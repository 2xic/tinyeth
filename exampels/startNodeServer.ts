const tinyeth = require('../dist/tinyeth');
//import tinyeth from '../dist/tinyeth';

(async () => {
  const server = new tinyeth.Server();
  server.start();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(100);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
