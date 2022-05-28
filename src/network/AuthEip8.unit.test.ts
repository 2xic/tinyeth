import { UnitTestContainer } from '../container/UnitTestContainer';
import { KeyPair } from '../signatures/KeyPair';
import { Auth8Eip } from './AuthEip8';
import { getBufferFromHex } from './getBufferFromHex';
import { Rlpx } from './Rlpx';

describe('AuthEip8', () => {
  it('should decrypt a auth packet correctly', async () => {
    const input = getBufferFromHex(
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
    const packet = await new UnitTestContainer()
      .create({
        privateKey:
          'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
        ephemeralPrivateKey:
          'e238eb8e04fee6511ab04c6dd3c89ce097b11f25d584863ac2b6d5b35b1847e4',
      })
      .get(Auth8Eip)
      .decodeAuthEip8({
        input,
      });

    expect(packet.version).toBe(4);
    expect(packet.nonce).toBe(
      '0x7e968bba13b6c50e2c4cd7f241cc0d64d1ac25c7f5952df231ac6a2bda8ee5d6'
    );
    const publicKey = new KeyPair(
      '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee'
    ).getPublicKey();
    expect(packet.publicKey).toBe(`0x${publicKey}`);
  });

  it.skip('should decrypt a auth ack correctly', async () => {
    const input = getBufferFromHex(
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
    const packet = await new UnitTestContainer()
      .create({
        privateKey:
          '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
        ephemeralPrivateKey:
          '869d6ecf5211f1cc60418a13b9d870b22959d0c16f02bec714c960dd2298a32d',
      })
      .get(Auth8Eip)
      .decodeAuthEip8({
        input,
      });
    expect(packet.version).toBe(4);
  });

  it('should correctly parse a packet from geth', async () => {
    const input = getBufferFromHex(
      '018d04ab9ea394923c19666b330cde8703c739a6808c3acb755ff6746e1b0f211e00ff916b093a20959ea1756a40411f6ea56e802c6275621626afa34a3292d9beb66b0b234262e57eebd16bf95b8d6650933f7a8fa8ca65b3c7ade30e9f1b882b008df742aac7950561c5b56597b4194ab3aa95eaa2d9a5c703936da5fee32f0843f8d55e788426dca363721678befc9a1b21e8f16fb3d86c5ad7bbd40bf2ab5c73114398b98ceaf0a3b2ded991317596def40b680a317b0962a6c6b931b18b8c67d428db915f47a565364fc45181b7d970765ff75b97a5f46f1f5c5e099dc2bd39b8ae4ad5cd2b67d2fad178496fbffc7fa3a102d90fb21516e2b9560bb8f6fad26249fb8d43486ee1a7f88b4ed55bf4a1fa1bc4119429220289baa024406503e3b162dc77aa0a9eaaf47d03a7f5b9748580c2796a7cdcaf68c4d6f77a9d5727a6f56e56f89abff7079706dd550cdeb5aeacf7707c3e554f28e4bf314f74476da696688c4f762d3e4e4b632d77ad3066bdea877ac6aefe02bf5b6b9e5538898ca116e2a3a6f81f593562bf46d36f'
    );

    const packet = await new UnitTestContainer()
      .create({
        privateKey:
          '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
        ephemeralPrivateKey:
          '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      })
      .get(Auth8Eip)
      .decodeAuthEip8({
        input,
      });
    expect(packet.version).toBe(4);
  });

  it('shold correctly parse a second packet from geth', async () => {
    const input = getBufferFromHex(
      '0173040a20053a57c302bc0751889c7717f4e58b3bde808dd98c02567c54c663834fe034f28c2bab712f46db5cb757b69024ec980c341d8b565c3b0b5bb45ac14874c0452bfdab2db357ae1f22bb29dce03633986eab735464b1ab760574b6dce540ea89a44f9a8f252578206fb7bda89d0c7e9f8ed72a4d468c8e9082278f5dcd3e0d6cfbca122884046f4097f18bef83f746ac6ad11b4f12a7966688045a312496be8d160e64482e80640a54f7dbd1c1024c358e10fc37638b3b6fa421f965b16b59a5d0b0c046a2c3e937384f7dcf1bfe5ab8ed7fa3332f004d9b5ff5ae9113fc074449cbe9495b09be7ccab122353201fe8df806ca96f24cae40df4eb2722f06e4a8ea791eda5cfca2cabd2a2c2fe73c933138cfdb0b14403b883e204dadb0b3026172916048e69b7f61b3a38084f9aaa6193b7e82aa99748f3c266bf9e0a485adf82483bb46a7d4c188dcd1d83104a4518d1a91afd2b10d71e155cea2e07f89af39bbba3889edd143d83dccd1f1a071c9f2bf'
    );

    const packet = await new UnitTestContainer()
      .create({
        privateKey:
          '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
        ephemeralPrivateKey:
          '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      })
      .get(Auth8Eip)
      .decodeAckEip8({
        input,
      });
    expect(packet.version).toBe(4);
  });
});
