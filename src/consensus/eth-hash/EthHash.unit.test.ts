import { UnitTestContainer } from '../../container/UnitTestContainer';
import BigNumber from 'bignumber.js';
import { EthHash } from './EthHash';
import { EthHashBlockParameters } from './EthHashBlockParameters';
import { EthHashBlockParametersMock } from './EthHashBlockParametersMock';

describe('EthHash', () => {
  it.skip('should run', () => {
    const container = new UnitTestContainer().create();
    container.unbind(EthHashBlockParameters);
    container.bind(EthHashBlockParameters).to(EthHashBlockParametersMock);

    const results = container.get(EthHash).mine({
      blockNumber: new BigNumber(30000),
      header: Buffer.alloc(0),
      difficultly: new BigNumber(1),
    });
    expect(results).toBeTruthy();
  });
});
