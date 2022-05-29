import { KeyPair } from '../signatures/KeyPair';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { RlpxEcies } from './RlpxEcies';

describe('RlpxEcies', () => {
  it('should decrypt a test vectors', async () => {
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

    const rlpEcies = new RlpxEcies(
      new KeyPair(
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291'
      )
    );
    const results = await rlpEcies.decryptMessage({
      message: buffer,
    });
    expect(results).toBeTruthy();
  });

  it('should be able to encrypt a message', async () => {
    const remotePublicKey = getBufferFromHex(
      'fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877'
    );
    const encryptedMessage = await new RlpxEcies(
      new KeyPair(
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291'
      )
    ).encryptMessage({
      message: Buffer.from('deadbeef', 'hex'),
      remotePublicKey,
    });

    const reciver = new KeyPair(
      '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee'
    );
    expect(reciver.getPublicKey()).toBe(remotePublicKey.toString('hex'));

    const results = await new RlpxEcies(reciver).decryptMessage({
      message: encryptedMessage,
    });

    expect(results.toString('hex')).toBe('deadbeef');
  });

  it('should be able to encrypt a message with mac', async () => {
    const mac = Buffer.from('4242', 'hex');
    const remotePublicKey = getBufferFromHex(
      'fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877'
    );
    const encryptedMessage = await new RlpxEcies(
      new KeyPair(
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291'
      )
    ).encryptMessage({
      message: Buffer.from('deadbeef', 'hex'),
      remotePublicKey,
      mac,
    });

    const reciver = new KeyPair(
      '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee'
    );
    expect(reciver.getPublicKey()).toBe(remotePublicKey.toString('hex'));

    const results = await new RlpxEcies(reciver).decryptMessage({
      message: encryptedMessage,
      mac,
    });

    expect(results.toString('hex')).toBe('deadbeef');
  });

  it('should decrypt a test vectors', async () => {
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

    const rlpEcies = new RlpxEcies(
      new KeyPair(
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291'
      )
    );

    const results = await rlpEcies.decryptMessage({
      message,
      mac: buffer.slice(0, 2),
    });
    expect(results).toBeTruthy();
  });
});
