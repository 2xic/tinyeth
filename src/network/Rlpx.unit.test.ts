import 'reflect-metadata';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { RlpxDecrpyt } from './RlpxDecrypt';

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
});
