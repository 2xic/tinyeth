import { replayFile } from '../dist';
import path from 'path';
import fs from 'fs'

async function ls(dirPath: string) {
    const dir = await fs.promises.opendir(dirPath)
    const paths: string[] = []
    for await (const dirent of dir) {
        if (dirent.isFile()) {
            paths.push(path.join(dirPath, dirent.name))
        }
    }
    return paths
}



(async () => {
    const files = await ls('dumps')
    for (const filePath of files) {
        console.log(filePath)
        await replayFile({
            filePath,
            debug: true,
            loggingEnabled: true
        })
    }
})();

