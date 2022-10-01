export class ConsensusRules {
  private featureFlags: Array<{
    fromBlockNumber: number;
    feature: Feature;
  }> = [
    {
      fromBlockNumber: Forks.HOMESTEAD,
      feature: Feature.ACTIVATE_DELEGATECALL,
    },
    {
      fromBlockNumber: Forks.BYZANTIUM,
      feature: Feature.ACTIVATE_REVERT,
    },
    {
      fromBlockNumber: Forks.BYZANTIUM,
      feature: Feature.ACTIVATE_RETURNDATACOPY,
    },
    {
      fromBlockNumber: Forks.BYZANTIUM,
      feature: Feature.ACTIVATE_RETURNDATACOPY,
    },
    {
      fromBlockNumber: Forks.CONSTANTINOPLE,
      feature: Feature.ACTIVATE_BYTE_SHIFTS,
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
  ACTIVATE_REVERT,
  ACTIVATE_BYTE_SHIFTS,
  ACTIVATE_RETURNDATASIZE,
  ACTIVATE_RETURNDATACOPY,
}

export enum Forks {
  CONSTANTINOPLE = 7_280_000,
  BYZANTIUM = 4_370_000,
  HOMESTEAD = 1_500_00,
}
