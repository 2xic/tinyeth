import { injectable } from 'inversify';
import { NodeCommunication } from './NodeCommunication';
import { Logger } from '../../utils/Logger';
import { WireMessageEncoder } from './WireMessageEncoder';
import { EventEmitter } from 'node:events';
import { assertEqual } from '../../utils/enforce';
import { PongPacket } from './PongPacketEncodeDecode';
import { PingPacket } from './PingPacketEncodeDecode';
import { NeighborsPacket } from './NeighborsPacketEncodeDecode';
import { PeerConnectionOptions } from '../Peer';
import { WireMessageDecoder, WirePacketTypes } from './WireMessageDecoder';

@injectable()
export class NodeManager {
  constructor(
    private nodeCommunication: NodeCommunication,
    private logger: Logger,
    private wireMessagesEncoder: WireMessageEncoder,
    private wireMessageDecoder: WireMessageDecoder
  ) {}

  public events: EventEmitter = new EventEmitter();
  private nodeRecord: Record<string, boolean> = {};

  private pingRecord: Record<string, string> = {};
  private stateRecord: Record<string, State> = {};

  public async bootstrap(options: ConnectionOptions) {
    this.logger.log(`Trying to connect to ${options.address}...`);
    this.stateRecord[options.address] = State.WAITING_FOR_PING_OR_PONG;

    await this.nodeCommunication.connect({
      onMessage: (message) => this.messageHandler(message, options.address), //this.messageHandler.bind(this),
      nodeOptions: options,
    });

    const { pingMessage, hash: pingHash } =
      this.wireMessagesEncoder.ping(options);
    this.logger.log(
      `Trying to send message to ${options.address} of length ${pingMessage.length}...`
    );
    this.logger.log(`\t ${pingMessage.toString('hex')}`);
    this.pingRecord[options.address] = pingHash.toString('hex');
    await this.nodeCommunication.sendMessage(pingMessage);
    this.logger.log(`Sent message :) to ${options.address}...`);
  }

  private async messageHandler(message: Buffer, address: string) {
    this.logger.log(`Got a message of length ${message.length}`);
    const packetReceived = this.wireMessageDecoder.decode({ input: message });

    if (packetReceived.packetType === WirePacketTypes.PING) {
      this.logger.log('got ping :)');
      const packet = packetReceived as PingPacket;
      this.logger.log('sending pong :)');
      await this.nodeCommunication.sendMessage(
        this.wireMessagesEncoder.pong(
          {
            address: address,
            port: Number(packet.fromTcpPort),
          },
          packetReceived.messageHash
        ).pongMessage
      );
      if (!this.hasSentNeighborMessage({ address })) {
        this.events.emit('alive', address);
      }
    } else if (packetReceived.packetType === WirePacketTypes.PONG) {
      this.logger.log('got pong :)');
      assertEqual(
        this.pingRecord[address],
        (packetReceived as unknown as PongPacket).hash.slice(2),
        'Unmatched pong hash'
      );
      if (!this.hasSentNeighborMessage({ address })) {
        this.events.emit('alive', address);
      }
    } else if (packetReceived.packetType === WirePacketTypes.NEIGHBORS) {
      this.logger.log('got neighbors :)');
      const packet = packetReceived as NeighborsPacket;

      packet.nodes.forEach((peer) => {
        if (!this.nodeRecord[peer.ip]) {
          const connectionOptions: PeerConnectionOptions = {
            address: peer.ip,
            port: peer.tcpPort,
            publicKey: peer.publicKey.toString('hex'),
          };
          this.nodeRecord[peer.ip] = true;
          this.events.emit('peer', connectionOptions);
        }
      });
    } else {
      this.logger.log('got ', [packetReceived]);
    }
  }

  public async findNeighbors(address: string) {
    if (!this.hasSentNeighborMessage({ address })) {
      const { findNeighbors } = this.wireMessagesEncoder.findNeighbor();

      this.logger.log('\t sending find neighbors!');
      this.stateRecord[address] = State.SENT_FIND_NEIGHBORS;
      this.logger.log(`\t ${findNeighbors.toString('hex')}`);
      await this.nodeCommunication.sendMessage(findNeighbors);
    }
  }

  private hasSentNeighborMessage({ address }: { address: string }) {
    return this.stateRecord[address] == State.SENT_FIND_NEIGHBORS;
  }
}

export interface ConnectionOptions {
  address: string;
  port: number;
}

enum State {
  WAITING_FOR_PING_OR_PONG,
  SENT_FIND_NEIGHBORS,
}
