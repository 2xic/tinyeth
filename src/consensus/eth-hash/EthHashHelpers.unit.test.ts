import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { UIntEncoderDecoder } from '../../rlp/types/UIntEncoderDecoder';
import { EthHashHelper } from './EthHashHelpers';

describe('EthHashHelpers', () => {
  let container: Container;
  let interactor: EthHashHelper;

  beforeEach(() => {
    container = new UnitTestContainer().create();
    interactor = container.get(EthHashHelper);
  });

  it('should correctly serialize', () => {
    const cmix = Buffer.from(
      'ca2ff06caae7c94dc968be7d76d0fbf60dd2e1989ee9bf0d5931e48564d5143b',
      'hex'
    );
    const output = interactor.serialize({
      cmix,
    });
    expect(output.toString('hex')).toBe(
      'acf20fc6aa7e9cd49c86ebd7670dbf6fd02d1e89e99efbd095134e58465d41b3'
    );
  });
});
