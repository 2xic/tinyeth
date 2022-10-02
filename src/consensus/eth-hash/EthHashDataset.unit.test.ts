import BigNumber from 'bignumber.js';
import { getClassFromTestContainer } from '../../container/getClassFromTestContainer';
import { EthHashCache } from './EthHashCache';
import { EthHashDataset } from './EthHashDataset';
import { EthHashHelper } from './EthHashHelpers';

describe('EthHashDataset', () => {
  it('should correctly create the data items', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: new BigNumber(0),
      seed: ethHashHelper.getSeedHash({
        blockNumber,
      }),
    });
    const dataset = getClassFromTestContainer(
      EthHashDataset
    ).calculateDatasetItem({
      cache,
      i: new BigNumber(1),
    });
    const results = [
      3188103998, 4243571685, 2334814757, 304915618, 1841029571, 363845397,
      3183860362, 3638462464, 1667284824, 3212100261, 405656103, 4059007662,
      3278779018, 4266524178, 8706036, 756577683,
    ];
    results.forEach((item, index) => {
      expect(item).toBe(dataset[index]);
    });
  });
});
