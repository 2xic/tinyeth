import { UnitTestContainer } from '../../container/UnitTestContainer';
import { KeyPair } from '../../signatures/KeyPair';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { RlpxEcies } from './RlpxEcies';

describe('RlpxEcies', () => {
  let rlpxEcies: RlpxEcies;

  let rlpxEciesReceiver: RlpxEcies;

  beforeEach(() => {
    rlpxEcies = new UnitTestContainer()
      .create({
        privateKey:
          'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
        ephemeralPrivateKey:
          'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      })
      .get(RlpxEcies);

    rlpxEciesReceiver = new UnitTestContainer()
      .create({
        privateKey:
          '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
        ephemeralPrivateKey:
          '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      })
      .get(RlpxEcies);
  });
  it('should decrypt a test vectors', async () => {
    // auth_1 test vector from https://eips.ethereum.org/EIPS/eip-8
    const buffer = getBufferFromHex(
      '048ca79ad18e4b0659fab4853fe5bc58eb83992980f4c9cc147d2aa31532efd29a3d3dc6a3d89eaf' +
        '913150cfc777ce0ce4af2758bf4810235f6e6ceccfee1acc6b22c005e9e3a49d6448610a58e98744' +
        'ba3ac0399e82692d67c1f58849050b3024e21a52c9d3b01d871ff5f210817912773e610443a9ef14' +
        '2e91cdba0bd77b5fdf0769b05671fc35f83d83e4d3b0b000c6b2a1b1bba89e0fc51bf4e460df3105' +
        'c444f14be226458940d6061c296350937ffd5e3acaceeaaefd3c6f74be8e23e0f45163cc7ebd7622' +
        '0f0128410fd05250273156d548a414444ae2f7dea4dfca2d43c057adb701a715bf59f6fb66b2d1d2' +
        '0f2c703f851cbf5ac47396d9ca65b6260bd141ac4d53e2de585a73d1750780db4c9ee4cd4d225173' +
        'a4592ee77e2bd94d0be3691f3b406f9bba9b591fc63facc016bfa8'
    );

    const results = await rlpxEcies.decryptMessage({
      message: buffer,
    });
    expect(results).toBeTruthy();
    console.log(results.toString('hex'));
  });

  it('should correctly decode ack_1', async () => {
    // ack_1 https://eips.ethereum.org/EIPS/eip-8

    const input = getBufferFromHex(
      '049f8abcfa9c0dc65b982e98af921bc0ba6e4243169348a236abe9df5f93aa69d99cadddaa387662' +
        'b0ff2c08e9006d5a11a278b1b3331e5aaabf0a32f01281b6f4ede0e09a2d5f585b26513cb794d963' +
        '5a57563921c04a9090b4f14ee42be1a5461049af4ea7a7f49bf4c97a352d39c8d02ee4acc416388c' +
        '1c66cec761d2bc1c72da6ba143477f049c9d2dde846c252c111b904f630ac98e51609b3b1f58168d' +
        'dca6505b7196532e5f85b259a20c45e1979491683fee108e9660edbf38f3add489ae73e3dda2c71b' +
        'd1497113d5c755e942d1'
    );
    const rlpxEcies = await new UnitTestContainer()
      .create({
        privateKey:
          '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
        ephemeralPrivateKey:
          '869d6ecf5211f1cc60418a13b9d870b22959d0c16f02bec714c960dd2298a32d',
      })
      .get(RlpxEcies);

    const results = await rlpxEcies.decryptMessage({
      message: input,
    });
    expect(results).toBeTruthy();
  });

  it('should decrypt a test vector 3', async () => {
    // auth_3 test vector from https://eips.ethereum.org/EIPS/eip-8
    const buffer = getBufferFromHex(
      '01b8044c6c312173685d1edd268aa95e1d495474c6959bcdd10067ba4c9013df9e40ff45f5bfd6f7' +
        '2471f93a91b493f8e00abc4b80f682973de715d77ba3a005a242eb859f9a211d93a347fa64b597bf' +
        '280a6b88e26299cf263b01b8dfdb712278464fd1c25840b995e84d367d743f66c0e54a586725b7bb' +
        'f12acca27170ae3283c1073adda4b6d79f27656993aefccf16e0d0409fe07db2dc398a1b7e8ee93b' +
        'cd181485fd332f381d6a050fba4c7641a5112ac1b0b61168d20f01b479e19adf7fdbfa0905f63352' +
        'bfc7e23cf3357657455119d879c78d3cf8c8c06375f3f7d4861aa02a122467e069acaf513025ff19' +
        '6641f6d2810ce493f51bee9c966b15c5043505350392b57645385a18c78f14669cc4d960446c1757' +
        '1b7c5d725021babbcd786957f3d17089c084907bda22c2b2675b4378b114c601d858802a55345a15' +
        '116bc61da4193996187ed70d16730e9ae6b3bb8787ebcaea1871d850997ddc08b4f4ea668fbf3740' +
        '7ac044b55be0908ecb94d4ed172ece66fd31bfdadf2b97a8bc690163ee11f5b575a4b44e36e2bfb2' +
        'f0fce91676fd64c7773bac6a003f481fddd0bae0a1f31aa27504e2a533af4cef3b623f4791b2cca6' +
        'd490'
    );

    const length = buffer.slice(0, 2).readUInt16BE();
    const message = buffer.slice(2);
    expect(message.length).toBe(length);

    const results = await rlpxEcies.decryptMessage({
      message: message.slice(0, length),
      mac: buffer.slice(0, 2),
    });
    expect(results).toBeTruthy();
  });

  it('should decrypt a ack test vector 3', async () => {
    // ack_3 test vector from https://eips.ethereum.org/EIPS/eip-8
    const buffer = getBufferFromHex(
      '01f004076e58aae772bb101ab1a8e64e01ee96e64857ce82b1113817c6cdd52c09d26f7b90981cd7' +
        'ae835aeac72e1573b8a0225dd56d157a010846d888dac7464baf53f2ad4e3d584531fa203658fab0' +
        '3a06c9fd5e35737e417bc28c1cbf5e5dfc666de7090f69c3b29754725f84f75382891c561040ea1d' +
        'dc0d8f381ed1b9d0d4ad2a0ec021421d847820d6fa0ba66eaf58175f1b235e851c7e2124069fbc20' +
        '2888ddb3ac4d56bcbd1b9b7eab59e78f2e2d400905050f4a92dec1c4bdf797b3fc9b2f8e84a482f3' +
        'd800386186712dae00d5c386ec9387a5e9c9a1aca5a573ca91082c7d68421f388e79127a5177d4f8' +
        '590237364fd348c9611fa39f78dcdceee3f390f07991b7b47e1daa3ebcb6ccc9607811cb17ce51f1' +
        'c8c2c5098dbdd28fca547b3f58c01a424ac05f869f49c6a34672ea2cbbc558428aa1fe48bbfd6115' +
        '8b1b735a65d99f21e70dbc020bfdface9f724a0d1fb5895db971cc81aa7608baa0920abb0a565c9c' +
        '436e2fd13323428296c86385f2384e408a31e104670df0791d93e743a3a5194ee6b076fb6323ca59' +
        '3011b7348c16cf58f66b9633906ba54a2ee803187344b394f75dd2e663a57b956cb830dd7a908d4f' +
        '39a2336a61ef9fda549180d4ccde21514d117b6c6fd07a9102b5efe710a32af4eeacae2cb3b1dec0' +
        '35b9593b48b9d3ca4c13d245d5f04169b0b1'
    );

    const ackRlpxEcies = await new UnitTestContainer()
      .create({
        privateKey:
          '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
        ephemeralPrivateKey:
          '869d6ecf5211f1cc60418a13b9d870b22959d0c16f02bec714c960dd2298a32d',
      })
      .get(RlpxEcies);

    const length = buffer.slice(0, 2).readUInt16BE();
    const message = buffer.slice(2);
    expect(message.length).toBe(length);

    const results = await ackRlpxEcies.decryptMessage({
      message: message.slice(0, length),
      mac: buffer.slice(0, 2),
    });
    expect(results).toBeTruthy();
  });

  it('should be able to encrypt a message', async () => {
    const remotePublicKey = getBufferFromHex(
      'fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877'
    );
    const encryptedMessage = await rlpxEcies.encryptMessage({
      message: Buffer.from('deadbeef', 'hex'),
      remotePublicKey,
    });

    const receiver = new KeyPair(
      '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee'
    );
    expect(receiver.getPublicKey()).toBe(remotePublicKey.toString('hex'));

    const results = await rlpxEciesReceiver.decryptMessage({
      message: encryptedMessage,
    });

    expect(results.toString('hex')).toBe('deadbeef');
  });

  it('should be able to encrypt a message with mac', async () => {
    const mac = Buffer.from('4242', 'hex');
    const remotePublicKey = getBufferFromHex(
      'fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877'
    );
    const encryptedMessage = await rlpxEcies.encryptMessage({
      message: Buffer.from('deadbeef', 'hex'),
      remotePublicKey,
      mac,
    });

    const receiver = new KeyPair(
      '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee'
    );
    expect(receiver.getPublicKey()).toBe(remotePublicKey.toString('hex'));

    const results = await rlpxEciesReceiver.decryptMessage({
      message: encryptedMessage,
      mac,
    });

    expect(results.toString('hex')).toBe('deadbeef');
  });

  it('should decrypt a test vectors', async () => {
    // auth_2 test vector from https://eips.ethereum.org/EIPS/eip-8
    const buffer = getBufferFromHex(
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
    const length = buffer.slice(0, 2).readUInt16BE();
    const message = buffer.slice(2);
    expect(message.length).toBe(length);

    const results = await rlpxEcies.decryptMessage({
      message,
      mac: buffer.slice(0, 2),
    });
    expect(results).toBeTruthy();
  });

  it('should correctly encrypt a message', async () => {
    const message = await new UnitTestContainer()
      .create({
        privateKey:
          '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
        ephemeralPrivateKey:
          '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
        deterministicRandomness: true,
      })
      .get(RlpxEcies)
      .encryptMessage({
        message: Buffer.from('deadbeef', 'hex'),
        remotePublicKey: Buffer.from(
          '04ca634cae0d49acb401d8a4c6b6fe8c55b70d115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be00812904767bf5ccd1fc7f',
          'hex'
        ),
      });
    expect(message.toString('hex')).toBe(
      '04fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f184287700000000000000000000000000000000d4f9d296f309bc5a6611c259bbee7828f6a78aa4bb482fc7ccd9b0f29403199541f216da'
    );
  });
});
