import { CoreContainer } from '../../container';
import BigNumber from 'bignumber.js';
import { EthHash } from './EthHash';

describe('EthHash', () => {
  it('should run', () => {
    const results = new CoreContainer()
      .create()
      .get(EthHash)
      .hashimoto({
        header: Buffer.alloc(0),
        nonce: Buffer.alloc(0),
        fullSize: new BigNumber(10),
        datasetLookup: () => new BigNumber(2),
      });
    expect(results).toBeTruthy();
  });
});
