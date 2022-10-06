import { UnitTestContainer } from '../../container/UnitTestContainer';
import BigNumber from 'bignumber.js';
import { EthHash } from './EthHash';
import { EthHashBlockParameters } from './EthHashBlockParameters';
import { EthHashBlockParametersMock } from './EthHashBlockParametersMock';

describe('EthHash', () => {
  it('should correctly run the algorithm', () => {
    const container = new UnitTestContainer().create();
    container.unbind(EthHashBlockParameters);
    container.bind(EthHashBlockParameters).to(EthHashBlockParametersMock);

    const results = container.get(EthHash).mine({
      blockNumber: new BigNumber(0),
      difficultly: new BigNumber(1),
      header: Buffer.alloc(32),
      nonce: Buffer.alloc(8),
    });

    expect(results.toString('hex')).toBe(
      '4e7bc6e24307fffb42684d33e3eb53d015a92c066630d6b64f4fc98293ce58a7'
    );
  });
});
