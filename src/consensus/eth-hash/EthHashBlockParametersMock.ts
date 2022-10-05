import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { EthHashBlockParameters } from './EthHashBlockParameters';
import { EthHashHelper } from './EthHashHelpers';

@injectable()
export class EthHashBlockParametersMock extends EthHashBlockParameters {
  constructor(protected ethHashHelper: EthHashHelper) {
    super(ethHashHelper);
  }

  public getBlockParameters({ blockNumber }: { blockNumber: BigNumber }) {
    const cacheSize = new BigNumber(1024);
    const datasetSize = cacheSize.multipliedBy(3);

    return {
      cacheSize,
      datasetSize,
    };
  }
}
