import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { RlpEncoder } from '../../rlp/RlpEncoder';
import { MockNonceGenerator } from '../nonce-generator/MockNonceGenerator';
import { NonceGenerator } from '../nonce-generator/NonceGenerator';
import { EncodeAuthEip8 } from './EncodeAuthEip8';
import { describe, it, expect } from '../../getActiveTestMetadata';

describe('EncodeAuthEip8', () => {
  let container: Container;

  beforeEach(() => {
    container = new UnitTestContainer().create({
      privateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      ephemeralPrivateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      deterministicRandomness: true,
    });
  });

  it('should correctly create an eip 8 message', () => {
    (container.get(NonceGenerator) as MockNonceGenerator).setNonces([
      Buffer.alloc(32),
    ]);
    const message = container.get(EncodeAuthEip8).createAuthMessageEip8({
      ethNodePublicKey:
        '04ca634cae0d49acb401d8a4c6b6fe8c55b70d115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be00812904767bf5ccd1fc7f',
    });
    const encoded = container
      .get(RlpEncoder)
      .encode({ input: message.results });
    expect(encoded).toBe(
      '0xf8a7b841751dbc85fe8f1d8381624a14e382339dae8f2af2f8935776c4663573a1bb49ff59866d7e6b6827334fd4975dde588da26e877411bc66bcb7a536d16419fb7b7800b840fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877a0000000000000000000000000000000000000000000000000000000000000000004'
    );
  });
});
