import { replayFile } from '../dist';

(async () => {
    await replayFile({
        filePath: 'normal-flow.json',
        debug: true,
        loggingEnabled: true
    })
})();

