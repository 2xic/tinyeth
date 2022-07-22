import { injectable } from 'inversify';
import { ChainInformation } from '../../ChainInformation';
import crc32 from 'crc-32';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { resetConfigureGlobal } from 'fast-check';
import { SignedUnsignedNumberConverter } from '../../../evm/SignedUnsignedNumberConverter';
import BigNumber from 'bignumber.js';
import { RlpEncoder } from '../../../rlp';

@injectable()
export class ForkId {
  constructor(
    private chainInformation: ChainInformation,
    private rlp: RlpEncoder
  ) {}

  public get forkId() {
    return this.getForkId({
      bestHash: this.chainInformation.chainInformation.genesisHash,
    });
  }

  public calculate({
    hash = this.chainInformation.chainInformation.genesisHash,
    next = 0,
  }: {
    hash?: number | string;
    next?: number;
  }) {
    let hashBuffer = getBufferFromHex(hash);
    if (hashBuffer.length < 4) {
      hashBuffer = Buffer.concat([
        getBufferFromHex(hash),
        Buffer.alloc(4 - hashBuffer.length),
      ]);
    }
    return this.rlp.encode({
      input: [hashBuffer, next],
    });
  }

  private getForkId({ bestHash }: { bestHash: string | number }) {
    const converter = new SignedUnsignedNumberConverter();
    const results = converter
      .convert(new BigNumber(crc32.buf(getBufferFromHex(bestHash))))
      .toString(16)
      .slice(-8);

    return results;
  }
}
