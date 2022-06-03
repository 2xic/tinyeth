import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { CommunicationState, MessageType } from './CommunicationState';
import { MockNonceGenerator } from '../nonce-generator/MockNonceGenerator';
import { NonceGenerator } from '../nonce-generator/NonceGenerator';

describe('CommunicationState', () => {
  it.each([
    { deterministicRandomness: true },
    { deterministicRandomness: false },
  ])('should be able to communicate correctly', async (options) => {
    const senderContainer = new UnitTestContainer().create({
      privateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      ephemeralPrivateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      ...options,
    });
    const receiverContainer = new UnitTestContainer().create({
      privateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      ephemeralPrivateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      ...options,
    });

    if (options.deterministicRandomness) {
      [senderContainer, receiverContainer].map((item) => {
        (item.get(NonceGenerator) as MockNonceGenerator).setNonces([
          Buffer.alloc(32),
        ]);
      });
    }

    const senderContainerCommunicationState =
      senderContainer.get(CommunicationState);
    const receiverContainerCommunicationState =
      receiverContainer.get(CommunicationState);

    senderContainerCommunicationState.setRemotePublicKey({
      publicKey: receiverContainerCommunicationState.publicKey,
    });
    receiverContainerCommunicationState.setRemotePublicKey({
      publicKey: senderContainerCommunicationState.publicKey,
    });

    const message = await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState
        .sendMessage(
          {
            type: MessageType.AUTH_EIP_8,
          },
          async (value) => resolve(value)
        )
        .catch(reject)
    );
    if (options.deterministicRandomness) {
      expect(message.toString('hex')).toBe(
        '017e04fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f184287700000000000000000000000000000000f2f3d4382d8bcbaae7ad470f0c7cd6880f3bbe8102d0a76bb5915d5182a89504887d8a872615bacc2913b7510c225531679a4af622504aa9d43f7f80dc40275407934e7f61d3e10f04d7672407bc88d3c6c8be9559771d5bcf665e5ef3daa126cd12d81640fc85ca7d3197859c6ef59655e294f49ee33befff31528572b5943eaa4c9072ab29037c472240ad9d798b1286abed4533852c9df3455558f366a80ce060bcf310e320a9f0a60385d4758306b7ec2f71ade4b4253da5a5ab15acc7ab1e8b52fce3b1462ca57b206f4779128eda193cd372e72dee233d3974b0c33a70bcdc7183d599dc240e160aae64b734c1b271ab4d4b29403fff797ebacdda7fbcc7863034798f3f43f0b781080f849d500103cbd981ab2ba0d7296fe6f744ee689006eb0e1758011958585f6ea5'
      );
    }

    const parsed = await new Promise<Buffer>((resolve, reject) => {
      receiverContainerCommunicationState
        .parseMessage(message, async (value) => resolve(value))
        .catch(reject);
    });
    await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState
        .parseMessage(parsed, async (value) => resolve(value))
        .catch(reject)
    );

    const sendPing = await new Promise<Buffer>((resolve, reject) => {
      receiverContainerCommunicationState
        .sendMessage({ type: MessageType.PING }, async (value) =>
          resolve(value)
        )
        .catch(reject);
    });

    // This wails when not running deterministcally
    await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState
        .parseMessage(sendPing, async (value) => resolve(value))
        .catch(reject)
    );
  });
});
