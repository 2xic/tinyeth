import BigNumber from 'bignumber.js';
import { getClassFromTestContainer } from '../../container/getClassFromTestContainer';
import { EthHashCache } from './EthHashCache';
import { HASH_BYTES } from './EthHashConstants';
import { EthHashHelper } from './EthHashHelpers';

describe('EthHashCache', () => {
  it('should correctly generate the cache', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: new BigNumber(0),
      seed: ethHashHelper.getSeedHash({
        blockNumber,
      }),
    });

    const cacheSerialized = cache
      .map((item) =>
        ethHashHelper
          .serialize({
            buffer: item,
          })
          .toString('hex')
      )
      .join('');

    expect(cacheSerialized).toBe(
      'da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3'
    );
  });

  it('should correctly create the cache with an interaction', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: HASH_BYTES,
      seed: ethHashHelper.getSeedHash({
        blockNumber,
      }),
    });

    const cacheSerialized = cache
      .map((item) =>
        ethHashHelper
          .serialize({
            buffer: item,
          })
          .toString('hex')
      )
      .join('');

    expect(cacheSerialized).toBe(
      'da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3'
    );
  });

  it('should correctly create cache with double iterations', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: HASH_BYTES.times(2),
      seed: ethHashHelper.getSeedHash({
        blockNumber,
      }),
    });

    const cacheSeralized = cache
      .map((item) =>
        ethHashHelper
          .serialize({
            buffer: item,
          })
          .toString('hex')
      )
      .join('');

    expect(cacheSeralized).toBe(
      'da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3'
    );
  });

  it('should correctly create cache with three iterations', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: HASH_BYTES.times(3),
      seed: ethHashHelper.getSeedHash({
        blockNumber,
      }),
    });

    const cacheSerialized = cache
      .map((item) =>
        ethHashHelper
          .serialize({
            buffer: item,
          })
          .toString('hex')
      )
      .join('');

    expect(cacheSerialized).toBe(
      'da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3'
    );
  });

  it('should correctly create cache with multiple iterations', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: HASH_BYTES.times(4),
      seed: ethHashHelper.getSeedHash({
        blockNumber,
      }),
    });

    const cacheSerialized = cache
      .map((item) =>
        ethHashHelper
          .serialize({
            buffer: item,
          })
          .toString('hex')
      )
      .join('');

    expect(cacheSerialized).toBe(
      '252e5612625ef1eaf6bdef150b1ac1352908c605b1418ac8a9f7e17461c1d663cbcad65dc8ca1e791c96ad6f824b55b9d54747d1e3ec1b7dbb3bd70a99bf7a501445fade0842cbff5e4f4c10b05322f3a7e9152247e6ca1ec48e4a98af34eaee8ca1adafa1b29b0a23aec492a736401771cb259b989ebea37d2c7bcf197f1e96a5038a552fc65975b946a142776eeace349b4d1dd81f9d23b9672cdb0ac7263b284e9a7c95af124b26d6fa8cc1de68516eff55fbd070100ff60c41588cdff22f923a820497aeb8fd2a2f04869448540a7f175292cbbf36a614bdcf89a9ce87a80dec5841bfb87fc1c34750cc0ef66cb0b5d06569b394d5972ce6bbc0d25cc8b9'
    );
  });
});
