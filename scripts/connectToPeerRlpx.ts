import { Peer, MessageType, ProductionContainer, getRandomPeer, DebugCommunicationState } from '../dist';
import exitHook from 'exit-hook';
import { CommunicationState } from '../dist/network/rlpx/CommunicationState';
import path from 'path';
import fs from 'fs';

(async () => {
  if (fs.existsSync('dump.json')) {
    console.log('please remove old dump before running')
  } else {
    const container = new ProductionContainer()
    .create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      loggingEnabled: true,
      debugMode: true,
    })
  const node = container
    .get(Peer);

  await node.connect(
    {
      address: '54.207.85.107',
      port: 30303,
      publicKey: 'b9050e002aa42464e6b07c811a1f9dfec01249af03f67b753e8415420649b184447bb2a784863ccbf327ad9e31aaba803464979dfe6a7facc669151a5fa6ad1b'
    }
  );

  await node.sendMessage({
    type: MessageType.AUTH_EIP_8,
  });

  exitHook(() => {
    console.log('Exiting 2');
    (container.get(CommunicationState) as DebugCommunicationState).dump({
      path: path.resolve(__dirname, 'dump.json')
    })
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(100);
  }
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
