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

  it('should correctly create the data items', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const seed = ethHashHelper.getSeedHash({
      blockNumber,
    });
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: new BigNumber(1024),
      seed,
    });
    expect(seed.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000000'
    );

    const dataset = getClassFromTestContainer(
      EthHashDataset
    ).calculateDatasetItem({
      cache,
      i: new BigNumber(4),
    });
    const results = [
      3031021500, 3552552081, 2389332005, 1973033370, 2667743915, 4181256217,
      1924483574, 669247221, 958569630, 241865053, 3728668196, 264899048,
      4186803025, 3284754241, 2214763876, 670767528,
    ];
    results.forEach((item, index) => {
      expect(item).toBe(dataset[index]);
    });
  });

  it('should correctly create the data items with i = 22', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const seed = ethHashHelper.getSeedHash({
      blockNumber,
    });
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: new BigNumber(1024),
      seed,
    });
    expect(seed.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000000'
    );

    const dataset = getClassFromTestContainer(
      EthHashDataset
    ).calculateDatasetItem({
      cache,
      i: new BigNumber(22),
    });
    const results = [
      1163054786, 2164210044, 291284267, 2142604011, 2565814730, 4236829621,
      1074625864, 554993032, 2132740606, 3381745540, 1634377114, 2352683091,
      406979423, 1093409190, 3448505828, 3473221765,
    ];
    expect(results.length).toBe(dataset.length);
    results.forEach((item, index) => {
      expect(item).toBe(dataset[index]);
    });
  });

  it('should correctly create the data items with i = 23', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const seed = ethHashHelper.getSeedHash({
      blockNumber,
    });
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: new BigNumber(1024),
      seed,
    });
    expect(seed.toString('hex')).toBe(
      '0000000000000000000000000000000000000000000000000000000000000000'
    );

    const dataset = getClassFromTestContainer(
      EthHashDataset
    ).calculateDatasetItem({
      cache,
      i: new BigNumber(23),
    });
    const results = [
      1134758706, 2265651652, 493604450, 2337444, 183842933, 650534535,
      3109711246, 1983007307, 2358546538, 2993878867, 2808463189, 2280784813,
      3836080089, 3612422119, 3627750168, 280614137,
    ];
    expect(results.length).toBe(dataset.length);
    results.forEach((item, index) => {
      expect(item).toBe(dataset[index]);
    });
  });
});
