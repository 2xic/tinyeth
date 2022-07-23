import { injectable } from 'inversify';
import { RlpDecoder } from '../../../rlp/RlpDecoder';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { EthMessageType } from '../CommunicationState';
import { RlpxMessageEncoder } from '../RlpxMessageEncoder';
import { SNappyDecompress as SnappyDecompress } from '../SnappyCompress';
import { SendStatusMessage } from './SendStatusMessage';
import crypto from 'crypto';

@injectable()
export class SendEthMessage {
  constructor(
    private sendStatusMessage: SendStatusMessage,
    private rlpDecoder: RlpDecoder,
    private rlpxMessageEncoder: RlpxMessageEncoder
  ) {}

  public sendStatus() {
    return this.sendStatusMessage.sendStatus();
  }

  public parseBlockRequest(packetPayload: Buffer): { requestId: Buffer } {
    // snapretry should work here, but then I would get a unsynced cannot help synced node :)
    const data = this.rlpDecoder.decode({
      // TODO, this should be the actual input.
      // looks like we need to strip part of the zeros.
      input: SnappyDecompress(
        getBufferFromHex('1244d1884c22b02936d4ff9bc783e1ffff018080')
      ).toString('hex'),
    });

    if (!Array.isArray(data)) {
      throw new Error('expected block request to be rlp array');
    }

    return {
      requestId: getBufferFromHex(data[0].toString()),
    };
  }

  public sendBlockHeaders({ requestId }: { requestId: Buffer }) {
    // https://github.com/ethereum/devp2p/blob/master/caps/eth.md#blockheaders-0x04

    // [request-id: P, [header₁, header₂, ...]]
    const payload = [requestId, []];

    const message = this.rlpxMessageEncoder.encodeEthMessage({
      code: EthMessageType.SEND_BLOCK_HEADERS,
      payload,
    });
    return message;
  }

  public parseBlockResponse(packetPayload: Buffer): { requestId: any } {
    const data = this.rlpDecoder.decode({
      input: this.snappyRetry(packetPayload).toString('hex'),
    });
    if (!Array.isArray(data)) {
      throw new Error('expected block request to be rlp array');
    }

    console.log(data);

    return {
      requestId: getBufferFromHex(data[0].toString()),
    };
  }

  public requestBlockHeaders(): Buffer {
    // [version: P, networkid: P, td: P, blockhash: B_32, genesis: B_32, forkid]
    const payload = [crypto.randomBytes(6), [0, 1, 0, 0]];

    const message = this.rlpxMessageEncoder.encodeEthMessage({
      code: EthMessageType.GET_BLOCK_HEADERS,
      payload,
    });

    return message;
  }

  private snappyRetry(input: Buffer) {
    let copied = Buffer.from(input.toString('hex'), 'hex');
    while (copied.length) {
      try {
        const results = SnappyDecompress(copied);
        return results;
      } catch (err) {
        copied = copied.slice(0, copied.length - 1);
      }
    }
    throw new Error('Invalid input');
  }
}
