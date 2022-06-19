import { injectable } from 'inversify';
import { PingPacketEncodeDecode } from './PingPacketEncodeDecode';
import dayjs from 'dayjs';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { PacketEncapsulation } from './PacketEncapsulation';
import { FindNodePacketEncodeDecode } from './FindNodePacketEncodeDecode';
import { ConnectionOptions } from './NodeManager';
import { assertEqual } from '../../utils/enforce';
import { PongPacketEncodeDecode } from './PongPacketEncodeDecode';

@injectable()
export class WireMessageEncoder {
  constructor(
    private pingPacketEncoder: PingPacketEncodeDecode,
    private pongPacketEncoder: PongPacketEncodeDecode,
    private encapsulateMEssage: PacketEncapsulation
  ) {}

  public ping(options: ConnectionOptions) {
    const message = this.pingPacketEncoder.encode({
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

    const { encodedMessage, hash, parityHash } =
      this.encapsulateMEssage.encapsulate({
        message: getBufferFromHex(message),
        packetType: Buffer.from([0x1]),
      });

    return {
      pingMessage: encodedMessage,
      hash,
      parityHash,
    };
  }

  public pong(options: ConnectionOptions, pingHash: Buffer) {
    const input = {
      expiration: dayjs().add(60, 'seconds').unix(),
      hash: pingHash.toString('hex'),

      toIp: options.address,
      toUdpPort: options.port.toString(),
      toTcpPort: options.port.toString(),
    };
    const message = this.pongPacketEncoder.encode({
      input,
    });

    const { encodedMessage, hash, parityHash } =
      this.encapsulateMEssage.encapsulate({
        message: getBufferFromHex(message),
        packetType: Buffer.from([0x2]),
      });

    return {
      pongMessage: encodedMessage,
      hash,
      parityHash,
    };
  }

  public findNeighbor({ target: inputTarget }: { target?: string }) {
    // TODO: remove the hardcoded target
    const target =
      inputTarget ||
      '22a5785c04f8e01670da51aaa8920e91bdba73414548b717817056dc76dae07846f8ae934d3174b19182a2f267843f932a3c5a7047fb1e13be1d3e329a587917'; // this.keyPair.getPublicKey();
    // https://github.com/ethereum/devp2p/blob/master/discv4.md#findnode-packet-0x03
    assertEqual(
      getBufferFromHex(target).length,
      64,
      'target should be 64 bytes'
    );
    const findNeighbors = this.encapsulateMEssage.encapsulate({
      message: getBufferFromHex(
        new FindNodePacketEncodeDecode().encode({
          input: {
            target,
            expiration: dayjs().add(60, 'seconds').unix(),
          },
        })
      ),
      packetType: Buffer.from([0x3]),
    });
    return {
      findNeighbors: findNeighbors.encodedMessage,
    };
  }
}
