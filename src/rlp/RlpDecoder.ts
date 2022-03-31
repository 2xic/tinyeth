import { ArrayEncoderDecoder } from './types/ArrayEncoderDecoder';
import { IsNonValueEncoderDecoder } from './types/IsNonValueEncoderDecoder';
import { NumberEncoderDecoder } from './types/NumberEncoderDecoder';
import { SimpleTypeEncoderDecoder } from './types/SimpleTypeEncoderDecoder';
import { StringEncoderDecoder } from './types/StringEncoderDecoder';
import {
  DecodingResults,
  SimpleTypes,
  TypeEncoderDecoder,
} from './types/TypeEncoderDecoder';

export class RlpDecoder {
  public decode({ input }: { input: string }): SimpleTypes | undefined {
    const strippedInput = Buffer.from(input.substring(2), 'hex');
    let parsed = undefined;

    let index = 0;
    while (index < strippedInput.length) {
      const { newIndex, decoding } = this.getToken({
        input: strippedInput,
        index,
      });

      console.log(parsed, decoding);

      if (!parsed) {
        if (typeof decoding === 'string') {
          parsed = decoding;
        } else if (Array.isArray(decoding)) {
          parsed = decoding;
        } else if (typeof decoding === 'number') {
          parsed = decoding;
        }
      } else {
        console.log([parsed, decoding, index, newIndex]);
        //        console.log(decoding);
        throw new Error(
          `Unknown state ${JSON.stringify(parsed)} ${JSON.stringify(decoding)}`
        );
      }

      //      parsed += decoding;
      index = newIndex;
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
      new StringEncoderDecoder(),
      new ArrayEncoderDecoder(),
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
          console.log([typeValue, decoder, response]);

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
      `Not implemented ${input.slice(0, 32).toString('hex')}... (${
        input.length
      })`
    );
  }
}
