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
      'da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3'
    );
  });

  it('should correctly create the cache with an interation', () => {
    const blockNumber = new BigNumber(0);
    const ethHashHelper = getClassFromTestContainer(EthHashHelper);
    const cache = getClassFromTestContainer(EthHashCache).makeCache({
      cacheSize: HASH_BYTES,
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
      '42d3295f1a23a8c49c4fbcd66ae06e7f3b2674f2a74dcf11e763648c051675c4211e01dbcf9dd8090f1db9b6ffb5447a6cd91a79c5a3582290e59b12e755c382'
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
      'da653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3d1736ce32673f6848f4bce2d5062c52e1d4c99565d0e1fb991665d1bde94e0ab3f0e39c753308092a500abee4065ec7e867f60afdfaab41dca1ef412f048cbc5200b38d3c57ac38ac3f2c9cbf2e4a7bc555da0b7cd6009965e67fbc83569bd29d9c387042171e9ba14e90af7b9773c1471864fef3740f6f0b53c35b4927b44ecdb3013b240a2fa60ce57278fe50dcfccd6a37a18faa20281edbb606fe67022966c951eba7c877a73714f76bcbbf126f3c2211db6e7a0529691bdf9b525321189'
    );
  });
});
