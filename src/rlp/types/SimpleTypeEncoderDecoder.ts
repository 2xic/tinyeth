import { isValueBetween } from "./isBetween";
import {
  DecodingResults,
  EncodingResults,
  TypeEncoderDecoder,
} from "./TypeEncoderDecoder";

export class SimpleTypeEncoderDecoder implements TypeEncoderDecoder<any> {
  public encode({ input }: { input: any }): EncodingResults {
    throw new Error("Method not implemented");
  }

  public decode({
    input,
    fromIndex,
  }: {
    input: Buffer;
    fromIndex: number;
  }): DecodingResults {
    return {
      newIndex: fromIndex + 1,
      decoding: input[fromIndex].toString(),
    };
  }

  public isDecodeType({ input }: { input: number }): boolean {
    return isValueBetween({
      value: input,
      min: 0x00,
      max: 0x7f,
    });
  }
}
