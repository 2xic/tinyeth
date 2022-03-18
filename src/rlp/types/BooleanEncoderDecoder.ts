import { Results, TypeEncoderDecoder } from "./TypeEncoderDecoder";

export class BooleanEncoderDecoder implements TypeEncoderDecoder<boolean> {
  public encode({ input }: { input: boolean }): Results {
    if (input) {
      return {
        encoding: "01",
        bytes: 1,
      };
    } else {
      return {
        encoding: "80",
        bytes: 1,
      };
    }
  }
  
  public decode({ input }: { input: boolean }): Results {
    throw new Error("Method not implemented.");
  }
}
