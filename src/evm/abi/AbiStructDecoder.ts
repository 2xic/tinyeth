import BigNumber from 'bignumber.js';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { Address } from '../Address';
import { abiDecodeArray } from './decoder/abiDecodeArray';

export class AbiStructDecoder {
  public decode({
    encoding,
    types,
  }: {
    encoding: string;
    types: Array<AbiType>;
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
        const { newIndex, decodeResults } = abiDecodeArray({
          index,
          buffer,
          type,
        });
        index = newIndex;
        results.push(decodeResults);
      } else if (type === 'ARRAY_BYTES') {
        const { newIndex, decodeResults } = abiDecodeArray({
          index,
          buffer,
          type,
        });
        index = newIndex;
        results.push(decodeResults);
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

export type AbiType =
  | 'ARRAY'
  | 'UINT'
  | 'ADDRESS'
  | 'BYTES'
  | 'DYNAMIC_BYTES'
  | 'FUNCTION'
  | 'ARRAY_BYTES';
