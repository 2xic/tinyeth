import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../../utils/getBufferFromHex';

export class AbiStructDecoder {
  public decode({
    encoding,
    types,
  }: {
    encoding: string;
    types: Array<'ARRAY' | 'UINT' | 'ADDRESS' | 'BYTES' | 'DYNAMIC_BYTES'>;
  }) {
    const results: Array<BigNumber | string | Array<unknown>> = [];
    const buffer = getBufferFromHex(encoding);
    let index = 0;
    for (const type of types) {
      if (type === 'ARRAY') {
        let location = parseInt(
          buffer.slice(index, index + 32).toString('hex'),
          16
        );
        const size = parseInt(
          buffer.slice(location, location + 32).toString('hex'),
          16
        );
        const array: unknown[] = [];
        for (let i = 0; i < size; i++) {
          location += 32;
          const item = buffer.slice(location, location + 32);
          array.push(item);
        }

        results.push(array);
        index += 32;
      } else if (type === 'UINT' || type === 'ADDRESS') {
        results.push(
          new BigNumber(buffer.slice(index, index + 32).toString('hex'), 16)
        );
        index += 32;
      } else if (type === 'BYTES') {
        results.push(
          Buffer.from(
            buffer.slice(index, index + 32).filter((item) => item !== 0)
          )
            .toString('ascii')
            .trim()
        );
        index += 32;
      } else if (type === 'DYNAMIC_BYTES') {
        const location = parseInt(
          buffer.slice(index, index + 32).toString('hex'),
          16
        );
        const size = parseInt(
          buffer.slice(location, location + 32).toString('hex'),
          16
        );
        const delta = 32 + (size % 32 == 0 ? 0 : 32);
        const data = buffer
          .slice(location + 32, location + Math.max(delta, 32))
          .filter((item) => item !== 0);
        results.push(Buffer.from(data).toString('ascii'));
        index += 32;
      } else {
        throw new Error('not implemented');
      }
    }
    return results;
  }
}
