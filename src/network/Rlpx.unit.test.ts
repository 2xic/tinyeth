import { isInterfaceDeclaration } from 'typescript';
import { KeyPair } from '../signatures/KeyPair';
import { getBufferFromHash } from './getBufferFromHex';
import { Rlpx } from './Rlpx';

// Borrowing test data from https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/tests/test_go_handshake.py
describe('Rlpx', () => {
  const testKeys = {
    initiatorPrivateKey:
      '5e173f6ac3c669587538e7727cf19b782a4f2fda07c1eaa662c593e5e85e3051',
    receiverPrivateKey:
      'c45f950382d542169ea207959ee0220ec1491755abe405cd7498d6b16adb6df8',
    initiatorEphemeralPrivateKey:
      '19c2185f4f40634926ebed3af09070ca9e029f2edd5fae6253074896205f5f6c',
    receiverEphemeralPrivateKey:
      'd25688cf0ab10afa1a0e2dba7853ed5f1e5bf1c631757ed4e103b593ff3f5620',
    authPlaintext:
      '884c36f7ae6b406637c1f61b2f57e1d2cab813d24c6559aaf843c3f48962f32f46662c066d39669b7b2e3ba14781477417600e7728399278b1b5d801a519aa570034fdb5419558137e0d44cd13d319afe5629eeccb47fd9dfe55cc6089426e46cc762dd8a0636e07a54b31169eba0c7a20a1ac1ef68596f1f283b5c676bae4064abfcce24799d09f67e392632d3ffdc12e3d6430dcb0ea19c318343ffa7aae74d4cd26fecb93657d1cd9e9eaf4f8be720b56dd1d39f190c4e1c6b7ec66f077bb1100',
    authrespPlaintext:
      '802b052f8b066640bba94a4fc39d63815c377fced6fcb84d27f791c9921ddf3e9bf0108e298f490812847109cbd778fae393e80323fd643209841a3b7f110397f37ec61d84cea03dcc5e8385db93248584e8af4b4d1c832d8c7453c0089687a700',
    authCiphertext:
      '04a0274c5951e32132e7f088c9bdfdc76c9d91f0dc6078e848f8e3361193dbdc43b94351ea3d89e4ff33ddcefbc80070498824857f499656c4f79bbd97b6c51a514251d69fd1785ef8764bd1d262a883f780964cce6a14ff206daf1206aa073a2d35ce2697ebf3514225bef186631b2fd2316a4b7bcdefec8d75a1025ba2c5404a34e7795e1dd4bc01c6113ece07b0df13b69d3ba654a36e35e69ff9d482d88d2f0228e7d96fe11dccbb465a1831c7d4ad3a026924b182fc2bdfe016a6944312021da5cc459713b13b86a686cf34d6fe6615020e4acf26bf0d5b7579ba813e7723eb95b3cef9942f01a58bd61baee7c9bdd438956b426a4ffe238e61746a8c93d5e10680617c82e48d706ac4953f5e1c4c4f7d013c87d34a06626f498f34576dc017fdd3d581e83cfd26cf125b6d2bda1f1d56',
    authrespCiphertext:
      '049934a7b2d7f9af8fd9db941d9da281ac9381b5740e1f64f7092f3588d4f87f5ce55191a6653e5e80c1c5dd538169aa123e70dc6ffc5af1827e546c0e958e42dad355bcc1fcb9cdf2cf47ff524d2ad98cbf275e661bf4cf00960e74b5956b799771334f426df007350b46049adb21a6e78ab1408d5e6ccde6fb5e69f0f4c92bb9c725c02f99fa72b9cdc8dd53cff089e0e73317f61cc5abf6152513cb7d833f09d2851603919bf0fbe44d79a09245c6e8338eb502083dc84b846f2fee1cc310d2cc8b1b9334728f97220bb799376233e113',
    ecdheSharedSecret:
      'e3f407f83fc012470c26a93fdff534100f2c6f736439ce0ca90e9914f7d1c381',
    initiatorNonce:
      'cd26fecb93657d1cd9e9eaf4f8be720b56dd1d39f190c4e1c6b7ec66f077bb11',
    receiverNonce:
      'f37ec61d84cea03dcc5e8385db93248584e8af4b4d1c832d8c7453c0089687a7',
    aesSecret:
      'c0458fa97a5230830e05f4f20b7c755c1d4e54b1ce5cf43260bb191eef4e418d',
    macSecret:
      '48c938884d5067a1598272fcddaa4b833cd5e7d92e8228c0ecdfabbe68aef7f1',
    token: '3f9ec2592d1554852b1f54d228f042ed0a9310ea86d038dc2b401ba8cd7fdac4',
    initialEgressMAC:
      '09771e93b1a6109e97074cbe2d2b0cf3d3878efafe68f53c41bb60c0ec49097e',
    initialIngressMAC:
      '75823d96e23136c89666ee025fb21a432be906512b3dd4a3049e898adb433847',
    initiatorHelloPacket:
      '6ef23fcf1cec7312df623f9ae701e63b550cdb8517fefd8dd398fc2acd1d935e6e0434a2b96769078477637347b7b01924fff9ff1c06df2f804df3b0402bbb9f87365b3c6856b45e1e2b6470986813c3816a71bff9d69dd297a5dbd935ab578f6e5d7e93e4506a44f307c332d95e8a4b102585fd8ef9fc9e3e055537a5cec2e9',
    receiverHelloPacket:
      '6ef23fcf1cec7312df623f9ae701e63be36a1cdd1b19179146019984f3625d4a6e0434a2b96769050577657247b7b02bc6c314470eca7e3ef650b98c83e9d7dd4830b3f718ff562349aead2530a8d28a8484604f92e5fced2c6183f304344ab0e7c301a0c05559f4c25db65e36820b4b909a226171a60ac6cb7beea09376d6d8',
  };

  it.only('should create the auth message correctly', () => {
    const intatorRlpx = new Rlpx(new KeyPair(testKeys.initiatorPrivateKey));
    const responderRlpx = new Rlpx(new KeyPair(testKeys.receiverPrivateKey));

    const message = intatorRlpx.createAuthMessage({
      ethNodePublicKey: responderRlpx.keyPair.getPublicKey(),
      nonce: getBufferFromHash(testKeys.initiatorNonce),
    });

    expect(message.length).toBe(194);
    expect(message.toString('hex')).toBe(testKeys.authPlaintext);
  });

  it('should encrypt, and decrypt correctly', () => {
    const intatorRlpx = new Rlpx(new KeyPair(testKeys.initiatorPrivateKey));
    const responderRlpx = new Rlpx(new KeyPair(testKeys.receiverPrivateKey));

    const message = intatorRlpx.createAuthMessage({
      ethNodePublicKey: responderRlpx.keyPair.getPublicKey(),
      nonce: getBufferFromHash(testKeys.initiatorNonce),
    });

    const responderPublicKey = responderRlpx.keyPair.getPublicKey();
    const encryptedMessage = intatorRlpx.encryptedMessage({
      message,
      responderPublicKey,
    });
    expect(encryptedMessage).toBeTruthy();
    //    expect(encryptedMessage.length).toBe(113 + message.length);

    const encryptedDecryptedMessage = intatorRlpx.decryptMessage({
      encryptedMessage,
      responderPublicKey: Buffer.from(responderRlpx.keyPair.privatekey, 'hex'),
    });

    expect(message.toString('hex')).toBe(
      encryptedDecryptedMessage.toString('hex')
    );
  });

  it('should correctly create a shared key', () => {
    const intatorRlpx = new Rlpx(
      new KeyPair(testKeys.initiatorEphemeralPrivateKey)
    );
    const responderRlpx = new Rlpx(
      new KeyPair(testKeys.receiverEphemeralPrivateKey)
    );

    const iniatorEchd = intatorRlpx.keyPair.getEcdh({
      privateKey: intatorRlpx.keyPair.privatekey,
      publicKey: responderRlpx.keyPair.getPublicKey(),
    });
    const responderEchd = responderRlpx.keyPair.getEcdh({
      privateKey: responderRlpx.keyPair.privatekey,
      publicKey: intatorRlpx.keyPair.getPublicKey(),
    });

    expect(iniatorEchd.toString('hex')).toBe(responderEchd.toString('hex'));
    //    expect(iniatorEchd.toString('hex')).toBe(testKeys.token);
  });

  it('should correctly construct the auth message', () => {
    const encryptedMessage = getBufferFromHash(testKeys.authCiphertext);

    const responderRlpx = new Rlpx(
      new KeyPair(testKeys.receiverEphemeralPrivateKey)
    );

    const decreptedAuthMEssage = responderRlpx.decryptMessage({
      encryptedMessage,
      responderPublicKey: Buffer.from(testKeys.receiverPrivateKey, 'hex'),
    });
    const slicedDescryptedMessage = decreptedAuthMEssage.slice(65);
    const slicedExpectedMessage = testKeys.authPlaintext;
    expect(slicedDescryptedMessage).toBe(slicedExpectedMessage);
  });

  it('should create the responder auth message correctly', () => {
    const intatorRlpx = new Rlpx(new KeyPair(testKeys.initiatorPrivateKey));
    const responderRlpx = new Rlpx(
      new KeyPair(testKeys.receiverEphemeralPrivateKey)
    );

    const message = intatorRlpx.createAuthMessage({
      ethNodePublicKey: responderRlpx.keyPair.getPublicKey(),
      nonce: getBufferFromHash(testKeys.receiverNonce),
    });

    expect(message.length).toBe(194);
    expect(message.toString('hex')).toBe(testKeys.authrespPlaintext);
  });

  it('should correctly decrypt a packet', () => {
    const responderRlpx = new Rlpx(
      new KeyPair(testKeys.receiverEphemeralPrivateKey)
    );

    const decryptedPacket = responderRlpx.decryptPacket({
      message: testKeys.initiatorHelloPacket,
    });
    expect(decryptedPacket).toBeTruthy();
  });
});