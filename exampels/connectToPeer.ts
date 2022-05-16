const tinyeth = require('../dist/tinyeth');

(async () => {
  const node = new tinyeth.Peer();

  await node.connect();

  /*  await node.sendMessage({
    type: tinyeth.MessageType.AUTH,
  });
*/
  await node.sendMessage({
    type: tinyeth.MessageType.AUTH,
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(100);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
