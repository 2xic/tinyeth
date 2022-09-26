export class ConsensusRules {
  private featureFlags: Array<{
    fromBlockNumber: number;
    feature: Feature;
  }> = [
    {
      fromBlockNumber: 1_500_00,
      feature: Feature.ACTIVATE_DELEGATECALL,
    },
  ];

  public getActiveFeatures({ blockNumber }: { blockNumber: number }) {
    return this.featureFlags
      .filter((item) => item.fromBlockNumber >= blockNumber)
      .map((item) => item.feature);
  }

  public getParametersFeature({ blockNumber }: { blockNumber: number }) {
    // i.e default gas, some opcodes have also been adjusted between updates.
  }
}

export enum Feature {
  ACTIVATE_DELEGATECALL,
}
