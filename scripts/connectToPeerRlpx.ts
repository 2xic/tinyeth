import { Peer, MessageType, ProductionContainer, PeerConnectionOptions, getRandomPeer, DebugCommunicationState } from '../dist';
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

    let nodes: PeerConnectionOptions[] =
      JSON.parse(fs.readFileSync('nodes.json').toString('ascii'))
    nodes = nodes.filter((item) => 0 < item.port );

    await node.connect(
      nodes[Math.floor((nodes.length - 1) * Math.random())]
    );

    await node.sendMessage({
      type: MessageType.AUTH_EIP_8,
    });

    exitHook(() => {
      /*(container.get(CommunicationState) as DebugCommunicationState).dump({
        path: path.resolve(__dirname, 'dump.json')
      })*/
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
