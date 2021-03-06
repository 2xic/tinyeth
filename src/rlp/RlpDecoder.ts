import { injectable } from 'inversify';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { ArrayEncoderDecoder } from './types/ArrayEncoderDecoder';
import { BooleanEncoderDecoder } from './types/BooleanEncoderDecoder';
import { IsNonValueEncoderDecoder } from './types/IsNonValueEncoderDecoder';
import { NumberEncoderDecoder } from './types/NumberEncoderDecoder';
import { SimpleTypeEncoderDecoder } from './types/SimpleTypeEncoderDecoder';
import { StringEncoderDecoder } from './types/StringEncoderDecoder';
import {
  DecodingResults,
  SimpleTypes,
  TypeEncoderDecoder,
} from './types/TypeEncoderDecoder';

@injectable()
export class RlpDecoder {
  public decode({ input }: { input: string }): SimpleTypes | undefined {
    const buffer = getBufferFromHex(input);
    let parsed = undefined;

    const index = 0;
    const { decoding } = this.getToken({
      input: buffer,
      index,
    });

    if (!parsed) {
      if (typeof decoding === 'string') {
        parsed = decoding;
      } else if (Array.isArray(decoding)) {
        parsed = decoding;
      } else if (typeof decoding === 'number') {
        parsed = decoding;
      } else if (typeof decoding === 'boolean') {
        parsed = decoding;
      }
    } else {
      throw new Error(
        `Unknown state ${JSON.stringify(parsed)} ${JSON.stringify(decoding)}`
      );
    }

    return parsed;
  }

  private getToken({
    input,
    index,
  }: {
    input: Buffer;
    index: number;
  }): DecodingResults {
    const typeValue = input[index];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typeDecoders: Array<TypeEncoderDecoder<any>> = [
      new SimpleTypeEncoderDecoder(),
      new BooleanEncoderDecoder(),
      new ArrayEncoderDecoder(),
      new StringEncoderDecoder(),
      new IsNonValueEncoderDecoder(),
      new NumberEncoderDecoder(),
    ];

    for (const decoder of typeDecoders) {
      const canDecode = decoder.isDecodeType({
        input: typeValue,
      });

      if (canDecode) {
        try {
          const response = decoder.decode({
            input,
            fromIndex: index,
            decoder: this.getToken.bind(this),
          });

          if (!('newIndex' in response)) {
            throw new Error('The decoder function should set a new index');
          }
          return response;
        } catch (err) {
          if (err instanceof RangeError) {
            continue;
          } else {
            throw err;
          }
        }
      }
    }

    throw new Error(
      `Not implemented ${input.slice(index, index + 32).toString('hex')}... (${
        input.length
      }), first byte 0x${input[index].toString(16)}`
    );
  }
}
