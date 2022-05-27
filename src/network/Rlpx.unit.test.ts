import { decrypt, encrypt } from 'ecies-geth';
import { resolveModuleName } from 'typescript';
import { KeyPair } from '../signatures/KeyPair';
import { getBufferFromHex } from './getBufferFromHex';
import { Rlpx } from './Rlpx';
import secp256k1 from 'secp256k1';
import { xor } from '@ethereumjs/devp2p';
import { keccak256 } from './keccak256';
import { generatePath } from 'react-router';
import crypto from 'crypto';
import { Key } from '@mui/icons-material';

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

  // test casse from https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/devp2p/test/rlpx-ecies.ts
  it('should correctly get a shared echd', () => {
    const intatorRlpx = new Rlpx(
      new KeyPair(
        'bc56f198f6b97dae6f157e35c8d607ab893be2c6ec1b242c529cc271f04f59b6'
      ),
      getBufferFromHex(testKeys.receiverEphemeralPrivateKey)
    );
    const responderRlpx = new Rlpx(
      new KeyPair(
        '482a0144fb169c3a55d9e2e177b25ba889d7cbe7a8b6d818f7f2e568d754697c'
      ),
      getBufferFromHex(testKeys.receiverEphemeralPrivateKey)
    );
    expect(intatorRlpx.keyPair.getPublicKey()).toBe(
      'edcd655fbeb5697a9829eacc4163c0045ad06f1697a1113af463fdea962147223fe80e5be564bda00fb35a42674e47d292084759465463e797b65d2afc2d61f1'
    );
    expect(responderRlpx.keyPair.getPublicKey()).toBe(
      'ca8c11dd4742cf1434ed2bf07c4381f6baecf98ee2e44f67bac987b47f8865bfde5436e71453a7829f076ddc353d86927acabc783c871ea90962c7f0c6926e55'
    );

    const sharedEchd =
      'e3512fe7713f4cf27513dd911e3a773059b439cc11614fda11ea1dd1cce847c6';
    expect(
      intatorRlpx.keyPair
        .getEcdh({
          privateKey:
            'c050056ba8b27cc2191305832f3f6837f5df839872f04d84416d78a1cd005f92',
          publicKey:
            '04ca8c11dd4742cf1434ed2bf07c4381f6baecf98ee2e44f67bac987b47f8865bfde5436e71453a7829f076ddc353d86927acabc783c871ea90962c7f0c6926e55',
        })
        .toString('hex')
    ).toBe(sharedEchd);
  });

  it.skip('should create the auth message correctly', () => {
    const intatorRlpx = new Rlpx(
      new KeyPair(testKeys.initiatorPrivateKey),
      getBufferFromHex(testKeys.initiatorEphemeralPrivateKey)
    );
    const responderRlpx = new Rlpx(
      new KeyPair(testKeys.receiverPrivateKey),
      getBufferFromHex(testKeys.receiverEphemeralPrivateKey)
    );

    const ethNodePublicKey = responderRlpx.keyPair.getPublicKey();
    const message = intatorRlpx.createAuthMessageEip8({
      ethNodePublicKey,
      nonce: getBufferFromHex(testKeys.initiatorNonce),
    });

    expect(message.length).toBe(194);
    expect(message.toString('hex').length).toBe(testKeys.authPlaintext.length);
    expect(message.toString('hex')).toBe(
      '22034ad2e7545e2b0bf02ecb1e40db478dfbbf7aeecc834aec2523eb2b7e74ee77ba40c70a83bfe9f2ab91f0131546dcf92c3ee8282d9907fee093017fd0302d0034fdb5419558137e0d44cd13d319afe5629eeccb47fd9dfe55cc6089426e46cc762dd8a0636e07a54b31169eba0c7a20a1ac1ef68596f1f283b5c676bae4064abfcce24799d09f67e392632d3ffdc12e3d6430dcb0ea19c318343ffa7aae74d4cd26fecb93657d1cd9e9eaf4f8be720b56dd1d39f190c4e1c6b7ec66f077bb1104'
    );
  });

  it('should correctly create a shared key', () => {
    const intatorRlpx = new Rlpx(
      new KeyPair(testKeys.initiatorPrivateKey),
      getBufferFromHex(testKeys.initiatorEphemeralPrivateKey)
    );
    const responderRlpx = new Rlpx(
      new KeyPair(testKeys.receiverPrivateKey),
      getBufferFromHex(testKeys.receiverEphemeralPrivateKey)
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

    // Again something seems wrong with the test vectors, checked against etherumjs
    //expect(iniatorEchd.toString('hex')).toBe(testKeys.token);
    expect(iniatorEchd.toString('hex')).toBe(
      'a86d3aee515ba98fd7662c09b9ccd848211199adc839318ef81d40fb2ff0f953'
    );
  });

  it.skip('should correctly create an non eip8 comaptabile auth packet', async () => {
    const responderRlpx = new Rlpx(
      new KeyPair(
        'c050056ba8b27cc2191305832f3f6837f5df839872f04d84416d78a1cd005f92'
      ),
      getBufferFromHex(
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291'
      )
    );
    const publickey =
      'ca8c11dd4742cf1434ed2bf07c4381f6baecf98ee2e44f67bac987b47f8865bfde5436e71453a7829f076ddc353d86927acabc783c871ea90962c7f0c6926e55'; //responderRlpx.keyPair.getPublicKey();

    const packet = responderRlpx.createAuthMessageEip8({
      ethNodePublicKey: publickey,
    });
    expect(packet.toString('hex')).toBe(
      'e4214ac8fff44ec9455c6a49f3b44b00f4fdf5676ec4938fbd7c94735ae5d476259f095b19000d7e9827a9c461c688e06dcb4acaa84ba3b3f313ad38ea1f040301a448f24c6d18e575453db13171562b71999873db5b286df957af199ec94617f70470d4dc07721330a47a0c7e155f92a9bca26533a5ac74a5e9e790c3f470f0afec53efb116f81f0ca1352d8178ff70ab86ab9767ac81d1f08fa396dda825f765db000000000000000000000000000000000000000000000000000000000000000000'
    );
    /*
    const encryptedPacket = await responderRlpx.encryptedMessage({
      message: packet,
      responderPublicKey: publickey,
    });
    expect(encryptedPacket.toString('hex')).toBe(
      '04ca634cae0d49acb401d8a4c6b6fe8c55b70d115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be00812904767bf5ccd1fc7f000000000000000000000000000000004b6dc9b43348b5479de3a32fd63ff15cdcc6d27825bee52c3b280bffdb33818d851434d2495cf0be3e4904e0cfa971caad5cfdccaa7b23eebfc20d564ab07252e50b65532f30741b69b1c763cff9f377c11b3d551e51e813e3d82e220de81f110b7c2ebb648e29fafd5829210ddd1a03e74148b7600c31ac9969131e5ad7562c7679afe849dbb32dbcbef61aab750f04fcc3ceffc2694fcef6b93595b1301a5c794ad97de6ed6890cc9095aab7ca797142467a2b95c691e5d65395d83b5d9e2b235cd8a7be2a22aa412fc1010e78b2b373b18bca8df89eec02494f77666a8886f5e2de'
    );
    */
  });

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
    const rlpx = await new Rlpx(
      new KeyPair(
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291'
      ),
      getBufferFromHex(
        'e238eb8e04fee6511ab04c6dd3c89ce097b11f25d584863ac2b6d5b35b1847e4'
      )
    ).decryptMessage({
      encryptedMessage,
    });

    expect(rlpx).toBeTruthy();
  });

  it('should correctly create an eip8 auth packet and parse it', async () => {
    const rlpx = await new Rlpx(
      new KeyPair(
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291'
      ),
      getBufferFromHex(
        'e238eb8e04fee6511ab04c6dd3c89ce097b11f25d584863ac2b6d5b35b1847e4'
      )
    ).createEncryptedAuthMessageEip8({
      ethNodePublicKey:
        'ca8c11dd4742cf1434ed2bf07c4381f6baecf98ee2e44f67bac987b47f8865bfde5436e71453a7829f076ddc353d86927acabc783c871ea90962c7f0c6926e55',
    });

    // 482a0144fb169c3a55d9e2e177b25ba889d7cbe7a8b6d818f7f2e568d754697c
    expect(rlpx).toBeTruthy();
    const responderRlpx = await new Rlpx(
      new KeyPair(
        '482a0144fb169c3a55d9e2e177b25ba889d7cbe7a8b6d818f7f2e568d754697c'
      ),
      getBufferFromHex(testKeys.receiverEphemeralPrivateKey)
    ).decryptEip8AuthMessage({
      encryptedMessage: rlpx,
    });
    expect(responderRlpx.version).toBe(4);
  });
});
