import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { Address } from '../Address';

export class AbiStructDecoder {
  public decode({
    encoding,
    types,
  }: {
    encoding: string;
    types: Array<
      | 'ARRAY'
      | 'UINT'
      | 'ADDRESS'
      | 'BYTES'
      | 'DYNAMIC_BYTES'
      | 'FUNCTION'
      | 'ARRAY_BYTES'
    >;
  }) {
    const results: Array<BigNumber | Buffer | Address | Array<unknown>> = [];
    let buffer = getBufferFromHex(encoding);
    let index = 0;
    if (types[0] === 'FUNCTION') {
      results.push(buffer.slice(index, index + 4));
      buffer = buffer.slice(4);
      types = types.slice(1);
    }

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
          if (type === 'ARRAY') {
            location += 32;
            const item = buffer.slice(location, location + 32);
            array.push(item);
          }
        }
        results.push(array);
        index += 32;
      } else if (type === 'ARRAY_BYTES') {
        let location = parseInt(
          buffer.slice(index, index + 32).toString('hex'),
          16
        );
        const array: unknown[] = [];

        const size = parseInt(
          buffer.slice(location, location + 32).toString('hex'),
          16
        );
        location += 32;
        const from =
          parseInt(buffer.slice(location, location + 32).toString('hex'), 16) +
          location +
          32;
        location += 32;

        const to =
          parseInt(buffer.slice(location, location + 32).toString('hex'), 16) +
          location +
          32;
        location += 32 * (size > 2 ? size - 1 : 1);

        if (1 < size) {
          for (let i = 0; i < size; i++) {
            // const _size = buffer.slice(location, location + 32).toString('hex');
            location += 32;

            const bytes = buffer.slice(location, location + 32).toString('hex');
            location += 32;
            array.push(bytes);
          }
        } else {
          const bytes = buffer.slice(from, to);
          location += 32;
          array.push(bytes);
        }
        results.push(array);
      } else if (type === 'UINT' || type === 'ADDRESS') {
        if (type === 'ADDRESS') {
          results.push(
            new Address(
              new BigNumber(buffer.slice(index, index + 32).toString('hex'), 16)
            )
          );
        } else {
          results.push(
            new BigNumber(buffer.slice(index, index + 32).toString('hex'), 16)
          );
        }
        index += 32;
      } else if (type === 'BYTES') {
        results.push(
          Buffer.from(
            buffer.slice(index, index + 32).filter((item) => item !== 0)
          )
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
        const delta = 32;
        const data = buffer.slice(location + 32, location + size + delta);
        results.push(data);
        index += 32;
      } else {
        throw new Error('not implemented');
      }
    }
    return results;
  }
}
