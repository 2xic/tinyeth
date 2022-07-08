import { getBufferFromHex } from '../../utils/getBufferFromHex';

export class AbiStructDecoder {
  public decode({
    encoding,
    types,
  }: {
    encoding: string;
    types: Array<'ARRAY'>;
  }) {
    const results: unknown[] = [];
    const buffer = getBufferFromHex(encoding);
    const index = 0;
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
      } else {
        throw new Error('not implemented');
      }
    }
    return results;
  }
}
