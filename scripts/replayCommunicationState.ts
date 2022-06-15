import { replayFile } from '../dist';

(async () => {
    await replayFile({
        filePath: 'dump.json',
        debug: true,
        loggingEnabled: true
    })
})();

