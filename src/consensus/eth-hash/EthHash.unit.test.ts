import { UnitTestContainer } from '../../container/UnitTestContainer';
import BigNumber from 'bignumber.js';
import { EthHash } from './EthHash';

describe('EthHash', () => {
  it('should run', () => {
    const results = new UnitTestContainer()
      .create()
      .get(EthHash)
      .mine({
        blockNumber: new BigNumber(30000),
        header: Buffer.alloc(0),
        difficultly: new BigNumber(1),
      });
    expect(results).toBeTruthy();
  });
});
