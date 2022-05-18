const tinyeth = require('../dist/tinyeth');
//import tinyeth from '../dist/tinyeth';

(async () => {
  await Promise.all(
    tinyeth.enocdes.map(async (item: string) => {
      const node = new tinyeth.Peer();

      await node.connect(tinyeth.parseEncode(item));

      /*  await node.sendMessage({
      type: tinyeth.MessageType.AUTH,
    });
  */
      await node.sendMessage({
        type: tinyeth.MessageType.AUTH,
      });
    })
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(100);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
