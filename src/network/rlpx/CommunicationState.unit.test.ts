import { UnitTestContainer } from '../../container/UnitTestContainer';
import {
  CommunicationState,
  MessageState,
  MessageType,
} from './CommunicationState';
import { MockNonceGenerator } from '../nonce-generator/MockNonceGenerator';
import { NonceGenerator } from '../nonce-generator/NonceGenerator';
import { ExposedFrameCommunication } from '../auth/frameing/ExposedFrameCommunication';
import { FrameCommunication } from '../auth/frameing/FrameCommunication';
import { EncodeFrame } from '../auth/frameing/EncodeFrame';
import { DecodeFrame } from '../auth/frameing/DecodeFrame';

describe('CommunicationState', () => {
  it('should run correct determinsitcally', async () => {
    const senderContainer = new UnitTestContainer().create({
      privateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      ephemeralPrivateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      deterministicRandomness: true,
    });
    const receiverContainer = new UnitTestContainer().create({
      privateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      ephemeralPrivateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      deterministicRandomness: true,
    });

    [senderContainer, receiverContainer].map((item) => {
      (item.get(NonceGenerator) as MockNonceGenerator).setNonces([
        Buffer.alloc(32),
      ]);
    });

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
    expect(message.toString('hex')).toBe(
      '017e04fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f184287700000000000000000000000000000000f2f3d4382d8bcbaae7ad470f0c7cd6880f3bbe8102d0a76bb5915d5182a89504887d8a872615bacc2913b7510c225531679a4af622504aa9d43f7f80dc40275407934e7f61d3e10f04d7672407bc88d3c6c8be9559771d5bcf665e5ef3daa126cd12d81640fc85ca7d3197859c6ef59655e294f49ee33befff31528572b5943eaa4c9072ab29037c472240ad9d798b1286abed4533852c9df3455558f366a80ce060bcf310e320a9f0a60385d4758306b7ec2f71ade4b4253da5a5ab15acc7ab1e8b52fce3b1462ca57b206f4779128eda193cd372e72dee233d3974b0c33a70bcdc7183d599dc240e160aae64b734c1b271ab4d4b29403fff797ebacdda7fbcc7863034798f3f43f0b781080f849d500103cbd981ab2ba0d7296fe6f744ee689006eb0e1758011958585f6ea5'
    );

    const ackMessage = await new Promise<Buffer>((resolve, reject) =>
      receiverContainerCommunicationState.parseMessage(message, resolve, reject)
    );

    const hello = await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState.parseMessage(
        ackMessage,
        resolve,
        reject
      )
    );
    expect(receiverContainerCommunicationState.nextState).toBe(
      MessageState.PACKETS
    );

    await new Promise<Buffer>((resolve, reject) =>
      receiverContainerCommunicationState.parseMessage(hello, resolve, reject)
    );

    const macEncodeFrame = senderContainer.get(EncodeFrame).egressMacHash;
    const macDecodeFrame = receiverContainer.get(DecodeFrame).ingressMacMacHash;
    expect(macEncodeFrame).toBe(macDecodeFrame);

    const sendPing = await new Promise<Buffer>((resolve, reject) => {
      receiverContainerCommunicationState
        .sendMessage({ type: MessageType.PING }, async (value) =>
          resolve(value)
        )
        .catch(reject);
    });

    await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState.parseMessage(sendPing, resolve, reject)
    );

    const sendPingAnotherPing = await new Promise<Buffer>((resolve, reject) => {
      receiverContainerCommunicationState
        .sendMessage({ type: MessageType.PING }, async (value) =>
          resolve(value)
        )
        .catch(reject);
    });

    await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState.parseMessage(
        sendPingAnotherPing,
        resolve,
        reject
      )
    );
  });

  // This is sometimes flacky, not sure why.
  it('should correctly preform a handshake', async () => {
    const [senderPrivateKey, receiverPrivateKey] = [
      'a19d58e8e50ab08dd376dbfd513b554a8ccde7ddcaa6505a6ac35776176144d7',
      '5791c6c8c400a13b98b82f4cb7b5e78ec0634d0ba14373c201dd36fc9f63362a',
    ];

    //const senderPrivateKey = crypto.randomBytes(32).toString('hex');
    const senderContainer = new UnitTestContainer().create({
      privateKey: senderPrivateKey,
      ephemeralPrivateKey: senderPrivateKey,
    });
    //const receiverPrivateKey = crypto.randomBytes(32).toString('hex');
    const receiverContainer = new UnitTestContainer().create({
      privateKey: receiverPrivateKey,
      ephemeralPrivateKey: receiverPrivateKey,
    });

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

    const authMessage = await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState
        .sendMessage(
          {
            type: MessageType.AUTH_EIP_8,
          },
          async (value) => resolve(value)
        )
        .catch(reject)
    );

    const ackMessage = await new Promise<Buffer>((resolve, reject) =>
      receiverContainerCommunicationState.parseMessage(
        authMessage,
        resolve,
        reject
      )
    );

    const hello = await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState.parseMessage(
        ackMessage,
        resolve,
        reject
      )
    );
    expect(receiverContainerCommunicationState.nextState).toBe(
      MessageState.PACKETS
    );

    await new Promise<Buffer>((resolve, reject) =>
      receiverContainerCommunicationState.parseMessage(hello, resolve, reject)
    );

    const senderContainerFrameComunication = senderContainer.get(
      FrameCommunication
    ) as ExposedFrameCommunication;
    const receiverContainerFrameComunication = receiverContainer.get(
      FrameCommunication
    ) as ExposedFrameCommunication;
    expect(senderContainerFrameComunication.options).toBeTruthy();
    expect(receiverContainerFrameComunication.options).toBeTruthy();

    expect(
      senderContainerFrameComunication.options?.aesKey.toString('hex')
    ).toBe(receiverContainerFrameComunication.options?.aesKey.toString('hex'));

    expect(
      senderContainerFrameComunication.options?.macKey.toString('hex')
    ).toBe(receiverContainerFrameComunication.options?.macKey.toString('hex'));

    const macEncodeFrame = senderContainer.get(EncodeFrame).egressMacHash;
    const macDecodeFrame = receiverContainer.get(DecodeFrame).ingressMacMacHash;
    expect(macEncodeFrame).toBe(macDecodeFrame);

    const senderMacDecodeFrame =
      senderContainer.get(DecodeFrame).ingressMacMacHash;
    const reciverMacEncodeFrame =
      receiverContainer.get(EncodeFrame).egressMacHash;
    expect(senderMacDecodeFrame).toBe(reciverMacEncodeFrame);

    const sendPing = await new Promise<Buffer>((resolve, reject) => {
      senderContainerCommunicationState
        .sendMessage({ type: MessageType.PING }, async (value) =>
          resolve(value)
        )
        .catch(reject);
    });
    expect(sendPing.length).toBe(64);
    expect(senderContainerCommunicationState.nextState).toBe(
      MessageState.PACKETS
    );
    expect(receiverContainerCommunicationState.nextState).toBe(
      MessageState.PACKETS
    );
  });

  it.skip('should be able to communicate correctly with randomness', async () => {
    const senderContainer = new UnitTestContainer().create({
      privateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
      ephemeralPrivateKey:
        '49a7b37aa6f6645917e7b807e9d1c00d4fa71f18343b0d4122a4d2df64dd6fee',
    });
    const receiverContainer = new UnitTestContainer().create({
      privateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      ephemeralPrivateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
    });

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

    const authMessage = await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState
        .sendMessage(
          {
            type: MessageType.AUTH_EIP_8,
          },
          async (value) => resolve(value)
        )
        .catch(reject)
    );

    const ackMessage = await new Promise<Buffer>((resolve, reject) =>
      receiverContainerCommunicationState.parseMessage(
        authMessage,
        resolve,
        reject
      )
    );
    const hello = await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState.parseMessage(
        ackMessage,
        resolve,
        reject
      )
    );
    expect(receiverContainerCommunicationState.nextState).toBe(
      MessageState.PACKETS
    );

    await new Promise<Buffer>((resolve, reject) =>
      receiverContainerCommunicationState.parseMessage(hello, resolve, reject)
    );

    const senderContainerFrameComunication = senderContainer.get(
      FrameCommunication
    ) as ExposedFrameCommunication;
    const receiverContainerFrameComunication = receiverContainer.get(
      FrameCommunication
    ) as ExposedFrameCommunication;
    expect(senderContainerFrameComunication.options).toBeTruthy();
    expect(receiverContainerFrameComunication.options).toBeTruthy();

    expect(
      senderContainerFrameComunication.options?.aesKey.toString('hex')
    ).toBe(receiverContainerFrameComunication.options?.aesKey.toString('hex'));

    expect(
      senderContainerFrameComunication.options?.macKey.toString('hex')
    ).toBe(receiverContainerFrameComunication.options?.macKey.toString('hex'));

    let macEncodeFrame = senderContainer.get(EncodeFrame).egressMacHash;
    let macDecodeFrame = receiverContainer.get(DecodeFrame).ingressMacMacHash;
    expect(macEncodeFrame).toBe(macDecodeFrame);

    let senderMacDecodeFrame =
      senderContainer.get(DecodeFrame).ingressMacMacHash;
    let reciverMacEncodeFrame =
      receiverContainer.get(EncodeFrame).egressMacHash;
    expect(senderMacDecodeFrame).toBe(reciverMacEncodeFrame);

    const sendPing = await new Promise<Buffer>((resolve, reject) => {
      senderContainerCommunicationState
        .sendMessage({ type: MessageType.PING }, async (value) =>
          resolve(value)
        )
        .catch(reject);
    });

    const sendPong = await new Promise<Buffer>((resolve, reject) =>
      receiverContainerCommunicationState.parseMessage(
        sendPing,
        resolve,
        reject,
        true
      )
    );

    expect(sendPing.length).toBe(64);
    expect(sendPong.length).toBe(0);
    expect(senderContainerCommunicationState.nextState).toBe(
      MessageState.PACKETS
    );
    expect(receiverContainerCommunicationState.nextState).toBe(
      MessageState.PACKETS
    );

    macEncodeFrame = senderContainer.get(EncodeFrame).egressMacHash;
    macDecodeFrame = receiverContainer.get(DecodeFrame).ingressMacMacHash;
    expect(macEncodeFrame).toBe(macDecodeFrame);

    senderMacDecodeFrame = senderContainer.get(DecodeFrame).ingressMacMacHash;
    reciverMacEncodeFrame = receiverContainer.get(EncodeFrame).egressMacHash;
    expect(senderMacDecodeFrame).toBe(reciverMacEncodeFrame);

    const sendPingAnotherPing = await new Promise<Buffer>((resolve, reject) => {
      receiverContainerCommunicationState
        .sendMessage({ type: MessageType.PING }, async (value) =>
          resolve(value)
        )
        .catch(reject);
    });

    await new Promise<Buffer>((resolve, reject) =>
      senderContainerCommunicationState
        .parseMessage(sendPingAnotherPing, resolve, reject)
        .catch(reject)
    );

    macEncodeFrame = senderContainer.get(EncodeFrame).egressMacHash;
    macDecodeFrame = receiverContainer.get(DecodeFrame).ingressMacMacHash;
    expect(macEncodeFrame).toBe(macDecodeFrame);

    senderMacDecodeFrame = senderContainer.get(DecodeFrame).ingressMacMacHash;
    reciverMacEncodeFrame = receiverContainer.get(EncodeFrame).egressMacHash;
    expect(senderMacDecodeFrame).toBe(reciverMacEncodeFrame);
  });
});
