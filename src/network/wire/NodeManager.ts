import { injectable } from 'inversify';
import { NodeCommunication } from './NodeCommunication';
import { PingPacketEncodeDecode } from './PingPacketEncodeDecode';
import dayjs from 'dayjs';
import { Logger } from '../../utils/Logger';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { PacketEncapsulation } from './PacketEncapsulation';
import { Packet, PacketTypes } from '../Packet';
import { FindNodePacketEncodeDecode } from './FindNodePacketEncodeDecode';
import { KeyPair } from '../../signatures';

@injectable()
export class NodeManager {
  constructor(
    private nodeCommunication: NodeCommunication,
    private PingPacketEncoder: PingPacketEncodeDecode,
    private encapsulateMEssage: PacketEncapsulation,
    private logger: Logger,
    private keyPair: KeyPair
  ) {}

  public async bootstrap(options: ConnectionOptions) {
    const message = await this.PingPacketEncoder.encode({
      input: {
        version: 4,
        expiration: dayjs().add(60, 'seconds').unix(),
        fromIp: '0.0.0.0',
        fromUdpPort: null,
        fromTcpPort: null,

        toIp: options.address,
        toUdpPort: options.port.toString(),
        toTcpPort: options.port.toString(),
      },
    });
    this.logger.log(`Trying to connect to ${options.address}...`);
    await this.nodeCommunication.connect({
      onMessage: this.messageHandler.bind(this),
      nodeOptions: options,
    });
    const pingMessage = this.encapsulateMEssage.encapsulate({
      message: getBufferFromHex(message),
      packetType: Buffer.from([0x1]),
    });
    this.logger.log(
      `Trying to send message to ${options.address} of length ${pingMessage.length}...`
    );
    this.logger.log(`\t ${pingMessage.toString('hex')}`);
    await this.nodeCommunication.sendMessage(pingMessage);
    this.logger.log(`Sent message :) to ${options.address}...`);
  }

  private async messageHandler(message: Buffer) {
    this.logger.log(`Got a message of length ${message.length}`);
    const packetReceived = new Packet().decodeWirePacket({ input: message });
    const findNeighbors = this.encapsulateMEssage.encapsulate({
      message: getBufferFromHex(
        new FindNodePacketEncodeDecode().encode({
          input: {
            target: this.keyPair.getPublicKey(),
            expiration: dayjs().add(60, 'seconds').unix(),
          },
        })
      ),
      packetType: Buffer.from([0x3]),
    });
    if (packetReceived.packetType === PacketTypes.PING) {
      console.log('got ping :)');
      //   await this.nodeCommunication.sendMessage(findNeighbors);
    } else if (packetReceived.packetType === PacketTypes.PONG) {
      console.log('got pong :)');
      console.log('\t sending find neighbors!');
      await this.nodeCommunication.sendMessage(findNeighbors);
    } else {
      console.log('got ', packetReceived);
    }
  }
}

export interface ConnectionOptions {
  address: string;
  port: number;
}
