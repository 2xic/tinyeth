import BigNumber from 'bignumber.js';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { EthHashBlockParameters } from './EthHashBlockParameters';
import { EthHashBlockParametersMock } from './EthHashBlockParametersMock';
import { EthHashValidation } from './EthHashValidation';

describe('EthHashValidation', () => {
  it('should correctly validate the proof of work', () => {
    const container = new UnitTestContainer().create();
    container.unbind(EthHashBlockParameters);
    container.bind(EthHashBlockParameters).to(EthHashBlockParametersMock);

    const results = container.get(EthHashValidation).validatePow({
      headerHash: Buffer.alloc(32),
      nonce: Buffer.alloc(8),
      blockNumber: new BigNumber(0),
      difficultly: new BigNumber(100),
      mixHash: Buffer.from(
        '4e7bc6e24307fffb42684d33e3eb53d015a92c066630d6b64f4fc98293ce58a7',
        'hex'
      ),
    });

    expect(results).toBe(true);
  });
});
