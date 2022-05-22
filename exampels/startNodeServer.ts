import { NodeServer } from '../dist/';

(async () => {
  console.log('Starting node server now..');
  const server = new NodeServer();
  server.start();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(100);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
