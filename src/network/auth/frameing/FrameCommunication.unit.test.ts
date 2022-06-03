import { FrameCommunication } from './FrameCommunication';
import { getClassFromTestContainer } from '../../../container/getClassFromTestContainer';

describe('FrameCommunication', () => {
  const initiatorNonce = Buffer.from('41'.repeat(32), 'hex');
  const receiverNonce: Buffer = Buffer.from('42'.repeat(32), 'hex');
  const ephemeralSharedSecret = Buffer.from('22'.repeat(32), 'hex');

  const remotePacket = Buffer.from('deadbeef', 'hex');
  const initiatorPacket = Buffer.from('beefbeef', 'hex');

  let sender: FrameCommunication;
  let receiver: FrameCommunication;

  beforeEach(() => {
    sender = getClassFromTestContainer(FrameCommunication).setup({
      ephemeralSharedSecret,
      remoteNonce: initiatorNonce,
      localNonce: receiverNonce,
      remotePacket,
      localPacket: initiatorPacket,
    });

    receiver = getClassFromTestContainer(FrameCommunication).setup({
      ephemeralSharedSecret,
      remoteNonce: receiverNonce,
      localNonce: initiatorNonce,
      remotePacket: initiatorPacket,
      localPacket: remotePacket,
      switchNonce: true,
    });
  });

  it('should construct a frame message correctly', () => {
    const encodedMessage = sender.encode({
      message: Buffer.from('deadbeef', 'hex'),
    });
    expect(encodedMessage.toString('hex')).toBe(
      '0fb74781565bc2a4c9bd7c3b4f58b7b2346f35f52075d68f96ff9c1fa6e98eea3ade8f8af2cc52530725e97f583c066942b87d4620a1e40b83bc4f347d93958c'
    );

    const encodedMessageLong = sender.encode({
      message: Buffer.from('deadbeef'.repeat(34), 'hex'),
    });
    expect(encodedMessageLong.toString('hex')).toBe(
      'f218aaf78f29dce921695939fcb6b56d1e71728163a6674c8d55f27c7f014d65ac9e0a04c6b75036c38c027f12ca359f6ab3e04fa0d7c285004e5dab738204a8a539d3b83b1f5017d65e7b93ff0c4e3ffd9af1cdc521ea974506ce2e869d8c09617f4274ee191dc0a48779c1182df735fadfc2caf7b8eb1c4bff0e6ed6432a86bab69d631a65d67813f158804ed9aa95b0a0a6f3893065ec875324681fae5162fb0c9ee144827cbb2dd35c7255aaa60bae61d13c16f6319ca8e2d6104c40a3c2'
    );
  });

  it('should construct a very long frame message correctly', () => {
    const encodedMessageVeryLong = sender.encode({
      message: Buffer.from('deadbeef'.repeat(128), 'hex'),
    });
    expect(encodedMessageVeryLong.toString('hex')).toBe(
      '0fb54381565bc2a4c9bd7c3b4f58b7b2e9d8d39f1994859229732c7f6e81c4f33ade8f8a2c61ecbcd98857908691b8862cb59cdad1046206ffc4e7d6221b0b82ac9e0a04c6b75036c38c027f12ca359f6ab3e04fa0d7c285004e5dab738204a8a539d3b83b1f5017d65e7b93ff0c4e3ffd9af1cdc521ea974506ce2e869d8c09617f4274ee191dc0a48779c1182df735fadfc2caf7b8eb1c4bff0e6ed6432a86bab69d631a65d67813f158804ed9aa95b0a0a6f3893065ec875324681fae5162fb0c9ee144827cbbf37ee29d8b0718e4deb4efc55e9412e6c06ae9e4d5470c7d93abb9c1c1aebd57f2dfe09513ea266b6475d2db304daab50883c7c4174b0bfb00154285057a360b9b40f21e2743f5d08836b80ec463bb16681af5f18f3eb5df68f455d55d10ffa9a254462754505a0da70edb4c0d51f7564dce82bd39e6d8d1fce16e5f241b5af550120e6c4abf764a4ba7258e3795d89e6f290b23b8966fc3b3e22c50d4edc7698742d819a2853d1f2e6e74519c7bf837b174ff623b4e94660c0730e321b41c172cc86cdf19d5579fb866b488f5646d55d213b268e25c43117732a9d8269046836abead041e9f681902613f7cc444a730611af5e86c333b68a449f6f05cf3ba7de511e1ce52efb05e21a1d6567d2124e5460366a1b65df3578b24fe593dd109daefa9bb9880e09ba25f6d7cf2a64d7512f4760064ce0c870b6809048bc39344fbf8023a99cdbcb7a8bcc2795c65ba5d80aa1844ec8b31b599bee363f8bb3d77496eacff6de802498e'
    );

    expect(
      receiver
        .decode({
          message: encodedMessageVeryLong,
        })
        .toString('hex')
    ).toBe('deadbeef'.repeat(128));
  });

  it('should deconstruct a frame message correctly', () => {
    const encodedMessage = sender.encode({
      message: Buffer.from('deadbeef', 'hex'),
    });
    expect(encodedMessage.toString('hex')).toBe(
      '0fb74781565bc2a4c9bd7c3b4f58b7b2346f35f52075d68f96ff9c1fa6e98eea3ade8f8af2cc52530725e97f583c066942b87d4620a1e40b83bc4f347d93958c'
    );

    expect(
      receiver
        .decode({
          message: Buffer.concat([encodedMessage]),
        })
        .toString('hex')
    ).toBe('deadbeef');

    const response = receiver.encode({
      message: Buffer.from('beefbeef', 'hex'),
    });

    expect(sender.decode({ message: response }).toString('hex')).toBe(
      'beefbeef'
    );
  });

  it('should deconstruct a short frame message correctly', () => {
    const encodedMessage = sender.encode({
      message: Buffer.from([0x41]),
    });
    expect(encodedMessage.toString('hex')).toBe(
      '0fb74281565bc2a4c9bd7c3b4f58b7b298713713cab14902915b5d39d4adb8daa5733165f2cc52530725e97f583c066921648f294325109b507604fd6a902177'
    );

    expect(
      receiver
        .decode({
          message: Buffer.concat([encodedMessage]),
        })
        .toString('hex')
    ).toBe('41');
  });

  it('should deconstruct a empty frame message correctly', () => {
    const encodedMessage = sender.encode({
      message: Buffer.from([]),
    });
    expect(encodedMessage.toString('hex')).toBe(
      '0fb74381565bc2a4c9bd7c3b4f58b7b2f6429271dc1360a2eb6cfab13fda7d0df7dd0a4800f4c05307af3596beae807e'
    );

    expect(
      receiver
        .decode({
          message: Buffer.concat([encodedMessage]),
        })
        .toString('hex')
    ).toBe('');
  });
});
