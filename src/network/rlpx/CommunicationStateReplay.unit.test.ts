import path from 'path';
import { replayFile } from './replays/replayFile';

/*
    - This will be replays for packets with a "real" node!
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
});
