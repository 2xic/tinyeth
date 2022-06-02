import 'reflect-metadata';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { RlpxDecrpyt } from './RlpxDecrypt';
import { Rlpx } from './Rlpx';
import { MockNonceGenerator } from './nonce-generator/MockNonceGenerator';
import { NonceGenerator } from './nonce-generator/NonceGenerator';

describe('RlpxDecrpyt', () => {
  it('should correctly parse an rlpx auth', async () => {
    const encryptedMessage = getBufferFromHex(
      '01b304ab7578555167be8154d5cc456f567d5ba302662433674222360f08d5f1534499d3678b513b' +
        '0fca474f3a514b18e75683032eb63fccb16c156dc6eb2c0b1593f0d84ac74f6e475f1b8d56116b84' +
        '9634a8c458705bf83a626ea0384d4d7341aae591fae42ce6bd5c850bfe0b999a694a49bbbaf3ef6c' +
        'da61110601d3b4c02ab6c30437257a6e0117792631a4b47c1d52fc0f8f89caadeb7d02770bf999cc' +
        '147d2df3b62e1ffb2c9d8c125a3984865356266bca11ce7d3a688663a51d82defaa8aad69da39ab6' +
        'd5470e81ec5f2a7a47fb865ff7cca21516f9299a07b1bc63ba56c7a1a892112841ca44b6e0034dee' +
        '70c9adabc15d76a54f443593fafdc3b27af8059703f88928e199cb122362a4b35f62386da7caad09' +
        'c001edaeb5f8a06d2b26fb6cb93c52a9fca51853b68193916982358fe1e5369e249875bb8d0d0ec3' +
        '6f917bc5e1eafd5896d46bd61ff23f1a863a8a8dcd54c7b109b771c8e61ec9c8908c733c0263440e' +
        '2aa067241aaa433f0bb053c7b31a838504b148f570c0ad62837129e547678c5190341e4f1693956c' +
        '3bf7678318e2d5b5340c9e488eefea198576344afbdf66db5f51204a6961a63ce072c8926c'
    );
    const rlpx = new UnitTestContainer()
      .create({
        privateKey:
          'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
        ephemeralPrivateKey:
          'e238eb8e04fee6511ab04c6dd3c89ce097b11f25d584863ac2b6d5b35b1847e4',
      })
      .get(RlpxDecrpyt)
      .decryptMessage({
        encryptedMessage,
      });

    expect(rlpx).toBeTruthy();
  });

  it('should correctly create an eip 8 auth message', async () => {
    const continaer = new UnitTestContainer().create({
      privateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      ephemeralPrivateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      deterministicRandomness: true,
    });
    (continaer.get(NonceGenerator) as MockNonceGenerator).setNonces([
      Buffer.alloc(32),
    ]);

    const response = await continaer.get(Rlpx).createEncryptedAuthMessageEip8({
      ethNodePublicKey:
        '04ca634cae0d49acb401d8a4c6b6fe8c55b70d115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be00812904767bf5ccd1fc7f',
    });

    expect(response.results.toString('hex')).toBe(
      '017e04fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f184287700000000000000000000000000000000f2f3d4382d8bcbaae7ad470f0c7cd6880f3bbe8102d0a76bb5915d5182a89504887d8a872615bacc2913b7510c225531679a4af622504aa9d43f7f80dc40275407934e7f61d3e10f04d7672407bc88d3c6c8be9559771d5bcf665e5ef3daa126cd12d81640fc85ca7d3197859c6ef59655e294f49ee33befff31528572b5943eaa4c9072ab29037c472240ad9d798b1286abed4533852c9df3455558f366a80ce060bcf310e320a9f0a60385d4758306b7ec2f71ade4b4253da5a5ab15acc7ab1e8b52fce3b1462ca57b206f4779128eda193cd372e72dee233d3974b0c33a70bcdc7183d599dc240e160aae64b734c1b271ab4d4b29403fff797ebacdda7fbcc7863034798f3f43f0b781080f849d500103cbd981ab2ba0d7296fe6f744ee689006eb0e1758011958585f6ea5'
    );
  });

  it('should correctly create an eip 8 ack message', async () => {
    const continaer = new UnitTestContainer().create({
      privateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      ephemeralPrivateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      deterministicRandomness: true,
    });

    const response = await continaer.get(Rlpx).createEncryptedAckMessageEip8({
      ethNodePublicKey:
        '04ca634cae0d49acb401d8a4c6b6fe8c55b70d115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be00812904767bf5ccd1fc7f',
    });
    expect(response.results.toString('hex')).toBe(
      '013b04fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f184287700000000000000000000000000000000f230d439a537b8d96deb5616946ba562d142de14c691e96173d5cccdf809e180da470ff841c17c9e9726c50bff12f61dbe61d78b992fb4b9648b3ce6792a5236efec1d70c16ba1f2a5189150ceb012cab3f140a8a22415310102a660241c4b980a532fe5c13405f42f9abb50c13b9c2ab1d6e5f33df3e43a07bb5389a04a453ef6e896832f0174dc472240ad9d798b1286abed4533852c9df3455558f366a80ce060bcf310e320a9f4a60385d4758306b7ec2f71ade4b4253da5a5ab15acc7ab1e8b52fce3b1462ca57b304a5936e057074e5095f0da03d7d07bea5e9539c8ff62b873a1928491316f77'
    );
  });
});
