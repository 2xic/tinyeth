import { injectable, optional } from 'inversify';
import { NodeCommunication } from './NodeCommunication';
import { PingPacketEncodeDecode } from './PingPacketEncodeDecode';
import dayjs from 'dayjs';
import { ParsedEnode } from '../utils/parseEnode';
import { Logger } from '../../utils/Logger';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { PacketEncapsulation } from './PacketEncapsulation';

@injectable()
export class NodeManager {
  constructor(
    private nodeCommunication: NodeCommunication,
    private PingPacketEncoder: PingPacketEncodeDecode,
    private encapsulateMEssage: PacketEncapsulation,
    private logger: Logger
  ) {}

  public async bootstrap(options: ParsedEnode) {
    const message = await this.PingPacketEncoder.encode({
      input: {
        version: 4,
        expiration: dayjs().add(1, 'day').unix(),
        fromIp: '0.0.0.0',
        fromUdpPort: null,
        fromTcpPort: null,

        toIp: options.address,
        toUdpPort: options.port.toString(),
        toTcpPort: '0',
      },
    });
    this.logger.log(`Trying to connect to ${options.address}...`);
    await this.nodeCommunication.connect({
      onMessage: this.messageHandler,
      nodeOptions: options,
    });
    const pingMessage = this.encapsulateMEssage.encapsulate({
      message: getBufferFromHex(message),
    });
    this.logger.log(
      `Trying to send message to ${options.address} of length ${pingMessage.length}...`
    );
    this.logger.log(`\t ${pingMessage.toString('hex')}`);
    await this.nodeCommunication.sendMessage(pingMessage);
    this.logger.log(`Sent message :) to ${options.address}...`);
  }

  private messageHandler(message: Buffer) {
    this.logger.log(`Got a message of length ${message.length}`);
  }
}
