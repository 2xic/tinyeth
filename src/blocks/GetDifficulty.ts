import BigNumber from 'bignumber.js';

export class GetDifficulty {
  public getDifficulty(): {
    difficulty: BigNumber;
  } {
    return {
      // genesis, but described in the yellow paper how to calculate for newer versions.
      difficulty: new BigNumber(17179869184),
    };
  }
}
