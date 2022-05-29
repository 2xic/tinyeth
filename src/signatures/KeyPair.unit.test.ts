import { UnitTestContainer } from '../container/UnitTestContainer';
import { KeyPair } from './KeyPair';
describe('KeyPair', () => {
  let interactor: KeyPair;
  beforeEach(() => {
    const container = new UnitTestContainer().create({
      privateKey:
        '840c32ef4b9ea4cec9fa4d14baf3ae3daaa4387d33634aff673f165985506f3a',
    });
    interactor = container.get(KeyPair);
  });

  it('should be able to create public key from private key', () => {
    // random address created by https://www.pwall.org/ethereum/
    const privateKey =
      '0x840c32ef4b9ea4cec9fa4d14baf3ae3daaa4387d33634aff673f165985506f3a';
    const publicKey = interactor.getPublicKey({
      privateKey,
    });
    const address = '0x4d5eB0Cd62351dF703BF707077e8e7c6525a1397'.toLowerCase();

    expect(
      interactor.getAddress({
        publicKey,
      })
    ).toBe(address);
  });

  // it's a bit flacky
  it.skip('should correctly compress and decompress public key', () => {
    const keypair = interactor;
    const publicKey = Buffer.from(keypair.getPublicKey(), 'hex');
    const compressedPublicKey = keypair.getCompressedKey({
      publicKey,
    });
    const decompressedPublicKey = keypair.getDecompressedKey({
      publicKey: compressedPublicKey,
    });
    expect(decompressedPublicKey.toString('hex')).toBe(
      publicKey.toString('hex')
    );
  });

  it('should correctly create an echd public key', () => {
    const alice = interactor;
    const bob = interactor;

    const aliceSharedKeyBob = alice.getEcdh({
      publicKey: bob.getPublicKey(),
    });
    const bobSharedKeyAlice = bob.getEcdh({
      publicKey: alice.getPublicKey(),
    });
    expect(aliceSharedKeyBob.toString('hex')).toBe(
      bobSharedKeyAlice.toString('hex')
    );
  });
});
