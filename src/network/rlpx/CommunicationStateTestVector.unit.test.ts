import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { NonceGenerator } from '../nonce-generator/NonceGenerator';
import { MockNonceGenerator } from '../nonce-generator/MockNonceGenerator';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { CommunicationState } from './CommunicationState';
import { KeyPair } from '../../signatures';
import { EncodeAuthEip8 } from '../auth/EncodeAuthEip8';
import { DebugCommunicationState } from './DebugCommunicationState';
import { Auth8Eip } from '../auth/AuthEip8';
import { ExposedFrameCommunication } from '../auth/frameing/ExposedFrameCommunication';

// will go through the test vectors in https://eips.ethereum.org/EIPS/eip-8 and make sure the secret and mac is correct
describe('CommunicationStateTestVector', () => {
  let aContainer: Container;
  let bContainer: Container;

  beforeEach(async () => {
    aContainer = await new UnitTestContainer().create({
      privateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      ephemeralPrivateKey:
        '869d6ecf5211f1cc60418a13b9d870b22959d0c16f02bec714c960dd2298a32d',
      deterministicRandomness: true,
      debugMode: true,
    });
    (aContainer.get(NonceGenerator) as MockNonceGenerator).setNonces([
      getBufferFromHex(
        '0x7e968bba13b6c50e2c4cd7f241cc0d64d1ac25c7f5952df231ac6a2bda8ee5d6'
      ),
    ]);

    bContainer = await new UnitTestContainer().create({
      privateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      ephemeralPrivateKey:
        'e238eb8e04fee6511ab04c6dd3c89ce097b11f25d584863ac2b6d5b35b1847e4',
      deterministicRandomness: true,
      debugMode: true,
    });
    (bContainer.get(NonceGenerator) as MockNonceGenerator).setNonces([
      getBufferFromHex(
        '0x559aead08264d5795d3909718cdd05abd49572e84fe55590eef31a88a08fdffd'
      ),
    ]);
  });

  it('should correctly prepare the auth message', async () => {
    // based of the flow from https://eips.ethereum.org/EIPS/eip-8
    const aPublicKey = aContainer.get(KeyPair).getPublicKey();
    const bPublicKey = bContainer.get(KeyPair).getPublicKey();

    const aCommunicationState = aContainer.get(
      CommunicationState
    ) as DebugCommunicationState;
    aCommunicationState.setRemotePublicKey({
      publicKey: bPublicKey,
    });
    const bCommunicationState = aContainer.get(
      CommunicationState
    ) as DebugCommunicationState;
    aCommunicationState.setRemotePublicKey({
      publicKey: bPublicKey,
    });
    bCommunicationState.setRemotePublicKey({
      publicKey: aPublicKey,
    });
    const encodeAuthEip8 = aContainer.get(EncodeAuthEip8);
    const encoded = encodeAuthEip8.createAuthMessageEip8({
      ethNodePublicKey: bPublicKey,
    });
    expect(encoded.metadata.nonce.toString('hex')).toBe(
      '7e968bba13b6c50e2c4cd7f241cc0d64d1ac25c7f5952df231ac6a2bda8ee5d6'
    );
    expect(encoded.metadata.rawPublicKey.toString('hex')).toBe(
      'fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877'
    );
    const authMessage = getBufferFromHex(
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
    const ackMessage = getBufferFromHex(
      '01ea0451958701280a56482929d3b0757da8f7fbe5286784beead59d95089c217c9b917788989470' +
        'b0e330cc6e4fb383c0340ed85fab836ec9fb8a49672712aeabbdfd1e837c1ff4cace34311cd7f4de' +
        '05d59279e3524ab26ef753a0095637ac88f2b499b9914b5f64e143eae548a1066e14cd2f4bd7f814' +
        'c4652f11b254f8a2d0191e2f5546fae6055694aed14d906df79ad3b407d94692694e259191cde171' +
        'ad542fc588fa2b7333313d82a9f887332f1dfc36cea03f831cb9a23fea05b33deb999e85489e645f' +
        '6aab1872475d488d7bd6c7c120caf28dbfc5d6833888155ed69d34dbdc39c1f299be1057810f34fb' +
        'e754d021bfca14dc989753d61c413d261934e1a9c67ee060a25eefb54e81a4d14baff922180c395d' +
        '3f998d70f46f6b58306f969627ae364497e73fc27f6d17ae45a413d322cb8814276be6ddd13b885b' +
        '201b943213656cde498fa0e9ddc8e0b8f8a53824fbd82254f3e2c17e8eaea009c38b4aa0a3f306e8' +
        '797db43c25d68e86f262e564086f59a2fc60511c42abfb3057c247a8a8fe4fb3ccbadde17514b7ac' +
        '8000cdb6a912778426260c47f38919a91f25f4b5ffb455d6aaaf150f7e5529c100ce62d6d92826a7' +
        '1778d809bdf60232ae21ce8a437eca8223f45ac37f6487452ce626f549b3b5fdee26afd2072e4bc7' +
        '5833c2464c805246155289f4'
    );

    const authNonce = getBufferFromHex(
      (await bContainer.get(Auth8Eip).decodeAuthEip8({ input: authMessage }))
        .nonce
    );
    const ephemeralSharedSecret = new KeyPair(
      '869d6ecf5211f1cc60418a13b9d870b22959d0c16f02bec714c960dd2298a32d'
    ).getEcdh({
      publicKey: new KeyPair(
        'e238eb8e04fee6511ab04c6dd3c89ce097b11f25d584863ac2b6d5b35b1847e4'
      ).getPublicKey(),
    });

    const localNonce = getBufferFromHex(
      (
        await aContainer.get(Auth8Eip).decodeAckEip8({
          input: ackMessage,
        })
      ).nonce
    );

    const bFrameCommunication =
      (await bCommunicationState.initializeFrameCommunication({
        ephemeralSharedSecret,
        remoteNonce: authNonce,
        remotePacket: authMessage,
        localNonce: localNonce,
        localPacket: ackMessage,
        switchNonce: false,
      })) as ExposedFrameCommunication;

    expect(bFrameCommunication.options?.macKey.toString('hex')).toBe(
      '2ea74ec5dae199227dff1af715362700e989d889d7a493cb0639691efb8e5f98'
    );
    expect(bFrameCommunication.options?.aesKey.toString('hex')).toBe(
      '80e8632c05fed6fc2a13b0f8d31a3cf645366239170ea067065aba8e28bac487'
    );
    expect(
      await bFrameCommunication.ingressMacUpdate({
        text: 'foo',
      })
    ).toBe('0c7ec6340062cc46f5e9f1e3cf86f8c8c403c5a0964f5df0ebd34a75ddc86db5');
  });
});
