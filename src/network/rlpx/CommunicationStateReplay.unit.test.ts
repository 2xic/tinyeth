import path from 'path';
import { replayFile } from './replays/replayFile';

/*
    This will replays packets from a "real" node!
*/
describe('CommunicationStateReplay', () => {
  it('should correctly deal with messages where header and body is in different packets', async () => {
    await replayFile({
      filePath: path.resolve(
        __dirname,
        'replays',
        'body-and-header-seperated.json'
      ),
    });
  });

  it('should correctly parse a "normal" flow ', async () => {
    await replayFile({
      filePath: path.resolve(__dirname, 'replays', 'normal-flow.json'),
    });
    await replayFile({
      filePath: path.resolve(__dirname, 'replays', 'normal-flow-2.json'),
    });
  });

  it('should correctly deal with a packets with inconsistent length ', async () => {
    await replayFile({
      filePath: path.resolve(__dirname, 'replays', 'dump-two-packets.json'),
    });
  });
});
