import { DecodingResults, EncodingResults, TypeEncoderDecoder } from "./TypeEncoderDecoder";

export class BooleanEncoderDecoder implements TypeEncoderDecoder<boolean> {
  public encode({ input }: { input: boolean }): EncodingResults {
    if (input) {
      return {
        encoding: "01",
        length: 1,
      };
    } else {
      return {
        encoding: "80",
        length: 1,
      };
    }
  }
  
  public decode({ input }: { input: boolean }): DecodingResults {
    throw new Error("Method not implemented.");
  }
}
