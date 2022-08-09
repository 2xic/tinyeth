import { AbiType } from '../AbiStructDecoder';

export function abiDecodeArray({
  index,
  buffer,
  type,
}: {
  index: number;
  buffer: Buffer;
  type: AbiType;
}) {
  if (type === 'ARRAY') {
    let location = parseInt(
      buffer.slice(index, index + 32).toString('hex'),
      16
    );
    const size = parseInt(
      buffer.slice(location, location + 32).toString('hex'),
      16
    );
    const decodeResults: unknown[] = [];
    for (let i = 0; i < size; i++) {
      if (type === 'ARRAY') {
        location += 32;
        const item = buffer.slice(location, location + 32);
        decodeResults.push(item);
      }
    }
    index += 32;

    return {
      decodeResults,
      newIndex: index,
    };
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

    return {
      decodeResults: array,
      newIndex: index,
    };
  } else {
    throw new Error('Unknown array abi type');
  }
}
