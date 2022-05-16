import { KeyPair } from '../signatures/KeyPair';
import { P2P } from './P2P';
import { MessageType, Peer } from './Peer';

describe('Peer', () => {
  jest.setTimeout(30 * 1_000);
  it('should correctly connect to a peer', async () => {
    const peer = new Peer();
    await peer.connect();

    await peer.sendMessage({
      type: MessageType.AUTH,
    });

    await sleep(30_000);

    await peer.disconnect();
  });
});

async function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
