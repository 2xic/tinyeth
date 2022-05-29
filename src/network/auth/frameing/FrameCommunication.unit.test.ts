import { FrameCommunication } from './FrameCommunication';

describe('FrameCommunication', () => {
  it('should construct a frame message correctly', () => {
    const interactor = new FrameCommunication().setup({
      ephemeralSharedSecret: Buffer.from('22'.repeat(32), 'hex'),
      initiatorNonce: Buffer.from('41'.repeat(32), 'hex'),
      receiverNonce: Buffer.from('42'.repeat(32), 'hex'),
      remotePacket: Buffer.from('deadbeef', 'hex'),
      initiatorPacket: Buffer.from('beefbeef', 'hex'),
    });

    const encodedMessage = interactor.encode({
      message: Buffer.from('deadbeef', 'hex'),
    });
    expect(encodedMessage.toString('hex')).toBe(
      '0fb74781565bc2a4c9bd7c3b4f58b7b2346f35f52075d68f96ff9c1fa6e98eea3ade8f8af2cc52530725e97f583c066942b87d4620a1e40b83bc4f347d93958c'
    );

    const encodedMessageLong = interactor.encode({
      message: Buffer.from('deadbeef'.repeat(34), 'hex'),
    });
    expect(encodedMessageLong.toString('hex')).toBe(
      'f218aaf78f29dce921695939fcb6b56d1e71728163a6674c8d55f27c7f014d65ac9e0a04c6b75036c38c027f12ca359f6ab3e04fa0d7c285004e5dab738204a8a539d3b83b1f5017d65e7b93ff0c4e3ffd9af1cdc521ea974506ce2e869d8c09617f4274ee191dc0a48779c1182df735fadfc2caf7b8eb1c4bff0e6ed6432a86bab69d631a65d67813f158804ed9aa95b0a0a6f3893065ec875324681fae5162fb0c9ee144827cbb2dd35c7255aaa60bae61d13c16f6319ca8e2d6104c40a3c2'
    );
  });
});
