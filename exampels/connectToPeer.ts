import { Peer, enocdes, MessageType, parseEncode } from '../dist';

(async () => {
  await Promise.all(
    enocdes.map(async (item: string) => {
      const node = new Peer();

      await node.connect(parseEncode(item));

      /*  await node.sendMessage({
      type: MessageType.AUTH,
    });
  */
      await node.sendMessage({
        type: MessageType.AUTH_EIP_8,
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
