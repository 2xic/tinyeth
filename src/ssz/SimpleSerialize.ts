import { convertNumberToBuffer } from '../utils/convertNumberToBuffer';
import { SimpleBuffers } from '../utils/SimpleBuffers';
import { List } from './types/List';
import { Types } from './types/types';
import { Uint } from './types/Uint';

export class SimpleSerialize {
  public encoding(structure: DataStructure): Buffer {
    const output = new SimpleBuffers();
    const variableLengths: Array<[number, Types]> = [];

    for (const [_, value] of Object.entries(structure)) {
      if (value instanceof Uint) {
        const byteValue = convertNumberToBuffer(value.value, 4);
        output.concat(byteValue);
      } else if (value instanceof List) {
        variableLengths.push([output.length, value]);
        output.concat(Buffer.alloc(4));
      }
    }

    let pushedIndex = 0;

    for (const [index, value] of variableLengths) {
      if (value instanceof List) {
        const valueParsed = Buffer.from(value.value.map((item) => item.value));
        output.overwrite(
          index + pushedIndex,
          convertNumberToBuffer(output.length, 4)
        );
        output.concat(valueParsed);

        pushedIndex += valueParsed.length;
      } else {
        throw new Error('Unknown type');
      }
    }

    return output.build();
  }
}

type DataStructure = Record<string, Types>;
