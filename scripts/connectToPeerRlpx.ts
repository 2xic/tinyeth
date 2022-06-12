import { Peer, MessageType, ProductionContainer, getRandomPeer, DebugCommunicationState } from '../dist';
import exitHook from 'exit-hook';
import { CommunicationState } from '../dist/network/rlpx/CommunicationState';
import path from 'path';

(async () => {
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
      address: '146.190.233.190',
      port: 30300,
      publicKey: '70147261807397c434f2351f83ae9be6b33c39e8fab47647692b500e4999f3d3df74a6ee6056e47de2faf04030e3446240ae27d223862ebd5df323d3cede2ee5'
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
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
