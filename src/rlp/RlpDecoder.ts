import { ArrayEncoderDecoder } from './types/ArrayEncoderDecoder';
import { IsNonValueEncoderDecoder } from './types/IsNonValueEncoderDecoder';
import { NumberEncoderDecoder } from './types/NumberEncoderDecoder';
import { SimpleTypeEncoderDecoder } from './types/SimpleTypeEncoderDecoder';
import { StringEncoderDecoder } from './types/StringEncoderDecoder';
import {
  DecodingResults,
  TypeEncoderDecoder,
} from './types/TypeEncoderDecoder';

export class RlpDecoder {
  public decode({ input }: { input: string }): string | undefined {
    const strippedInput = Buffer.from(input.substring(2), 'hex');
    let parsed = '';

    let index = 0;
    while (index < strippedInput.length) {
      const { newIndex, decoding } = this.getToken({
        input: strippedInput,
        index,
      });

      console.log(decoding);

      parsed += decoding;
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
      new StringEncoderDecoder(),
      new SimpleTypeEncoderDecoder(),
      new ArrayEncoderDecoder(),
      new IsNonValueEncoderDecoder(),
      new NumberEncoderDecoder(),
    ];

    for (const decoder of typeDecoders) {
      const canDecode = decoder.isDecodeType({
        input: typeValue,
        inputBuffer: input,
        fromIndex: index,
      });
      if (canDecode) {
        try {
          const response = decoder.decode({
            input,
            fromIndex: index,
            decoder: this.getToken.bind(this),
          });

          console.log([response, decoder]);

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

    throw new Error('Not implemented');
  }
}
