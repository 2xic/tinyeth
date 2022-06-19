/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse } from 'buffer-json';
import { CommunicationState } from '../CommunicationState';
import {
  Communication,
  DebugCommunicationState,
  LocalStateChange,
} from '../DebugCommunicationState';
import fs from 'fs';
import { Logger } from '../../../utils/Logger';
import { UnitTestContainer } from '../../../container/UnitTestContainer';
import { MessageQueue } from '../MessageQueue';

export async function replayFile({
  filePath,
  debug,
  loggingEnabled,
}: {
  filePath: string;
  debug?: boolean;
  loggingEnabled?: boolean;
}) {
  const container = new UnitTestContainer().create({
    privateKey:
      '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
    ephemeralPrivateKey:
      '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
    loggingEnabled: loggingEnabled,
  });
  const node = container.get(CommunicationState) as DebugCommunicationState;
  const logger = container.get(Logger);

  const state = parse(fs.readFileSync(filePath).toString('ascii'));
  const remotePublicKey: Buffer = state.find(
    (item: Communication | LocalStateChange) => {
      return 'key' in item ? item.key === '_remotePublicKey' : false;
    }
  ).value;
  const authState: { header: any; authMessage: Buffer } = state.find(
    (item: Communication | LocalStateChange) => {
      return 'key' in item ? item.key === 'createAuthMessageHeader' : false;
    }
  ).value;
  node.setRemotePublicKey({
    publicKey: remotePublicKey.toString('hex'),
  });
  await node.setSenderNonceState({
    header: authState.header,
    authMessage: authState.authMessage,
  });
  const messages: Communication[] = state.filter(
    (item: Communication | LocalStateChange) =>
      'direction' in item ? true : false
  );

  if (debug) {
    logger.log('Message stats');
    messages.forEach((message) => {
      logger.log(`${message.direction} - length ${message.message.length}`);
    });
  }

  const messageQueue = container.get(MessageQueue);

  for (const [index, { message, direction }] of Object.entries(messages)) {
    logger.log('Replaying message');
    logger.log(`loading message ${index}`);
    logger.log([index, message.length]);

    if (direction == 'from') {
      messageQueue.add(message);

      const buffer = messageQueue.read();
      if (buffer.length) {
        await new Promise<any>((resolve, reject) =>
          node.parseMessage(buffer, resolve, reject)
        );
      }
    } else {
      throw new Error('not implemented');
    }
  }
  logger.log('messages read :)');
}
