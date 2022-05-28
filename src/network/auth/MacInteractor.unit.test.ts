import { MacInteractor } from './MacInteractor';

describe('MacInteractor', () => {
  const macSecret = Buffer.from(
    '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
    'hex'
  );
  const nonce = Buffer.from(
    'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
    'hex'
  );
  const remoteData = Buffer.from(
    'fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877',
    'hex'
  );

  it('should initialize correctly', () => {
    const interactor = new MacInteractor(macSecret, nonce, remoteData);
    expect(interactor.slicedHash.toString('hex')).toBe(
      'f6b5c72739009f0597bae7cb43a2d369'
    );
  });

  it('should update header correctly', () => {
    const interactor = new MacInteractor(macSecret, nonce, remoteData);
    interactor.header({
      packet: Buffer.from('deadbeefdeadbeefdeadbeefdeadbeef', 'hex'),
    });
    expect(interactor.slicedHash.toString('hex')).toBe(
      '9882b5a060385db6a94ba9e8041e3393'
    );
  });

  it('should update body correctly', () => {
    const interactor = new MacInteractor(macSecret, nonce, remoteData);
    interactor.header({
      packet: Buffer.from('deadbeefdeadbeefdeadbeefdeadbeef', 'hex'),
    });
    interactor.body({
      packet: Buffer.from('4242b41414242b41414242b41414242b4141', 'hex'),
    });
    expect(interactor.slicedHash.toString('hex')).toBe(
      '15b280429d626df4aa27218faacd6311'
    );
  });
});
