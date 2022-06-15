import { UnitTestContainer } from '../container/UnitTestContainer';
import { KeyPair } from './KeyPair';
import { Signatures } from './Signatures';
describe('KeyPair', () => {
  let interactor: Signatures;
  let keyPair: KeyPair;

  beforeEach(() => {
    const container = new UnitTestContainer().create({
      privateKey:
        '840c32ef4b9ea4cec9fa4d14baf3ae3daaa4387d33634aff673f165985506f3a',
    });
    interactor = container.get(Signatures);
    keyPair = container.get(KeyPair);
  });

  it('should be able to sign and verify', async () => {
    const {
      signature,
      recovery: r,
      message,
    } = await interactor.hashAndSignMessage({
      privateKey:
        '840c32ef4b9ea4cec9fa4d14baf3ae3daaa4387d33634aff673f165985506f3a',
      message: 'test',
    });

    const signaturePublicKEy = await interactor.getPublicKeyFromSignature({
      message,
      signature,
      r,
    });

    const actualPublicKey = await keyPair.getPublicKey({
      privateKey:
        '840c32ef4b9ea4cec9fa4d14baf3ae3daaa4387d33634aff673f165985506f3a',
    });
    expect(signaturePublicKEy).toBe(actualPublicKey);
  });

  it('should have matching signature as other implementations', async () => {
    // https://github.com/miguelmota/ethereum-development-with-go-book/blob/master/en/signature-verify/README.md

    const {
      signature,
      recovery: r,
      message,
      fullSignature,
    } = await interactor.hashAndSignMessage({
      privateKey:
        'fad9c8855b740a0b7ed4c221dbad0f33a83a49cad6b3fe8d5817ac83d38b6a19',
      message: Buffer.from('hello', 'ascii').toString('hex'),
    });

    expect(Buffer.from(message).toString('hex')).toBe(
      '1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8'
    );
    expect(fullSignature).toBe(
      '789a80053e4927d0a898db8e065e948f5cf086e32f9ccaa54c1908e22ac430c62621578113ddbb62d509bf6049b8fb544ab06d36f916685a2eb8e57ffadde02301'
    );

    const publicKey = await interactor.getPublicKeyFromSignature({
      message,
      signature,
      r,
    });

    const publicKey2 = await keyPair.getPublicKey({
      privateKey:
        'fad9c8855b740a0b7ed4c221dbad0f33a83a49cad6b3fe8d5817ac83d38b6a19',
    });

    expect(publicKey2).toBe(publicKey);
  });

  it('should correctly calculate the r,s,v', () => {
    const { v, r, s } = interactor.signTransaction({
      message: Buffer.from(
        'cf2d502a6347c7f393f107a8e1d15dcf4830c8c2cb7d81f7beda5b901006c50a',
        'hex'
      ),
      privateKey:
        '616E6769652E6A6A706572657A616775696E6167612E6574682E6C696E6B0D0A',
    });

    expect(v).toBe(28);
    expect(r.toString('hex')).toBe(
      '8029fda98d0c934c36078788937886dedb95be54c16c2bdf023033851b221d67'
    );
    expect(s.toString('hex')).toBe(
      '7e37b1ddf372c531f5b8f13f5f530a040ee32ad8f87d95f49a047d3c4db5d05b'
    );
  });
});
