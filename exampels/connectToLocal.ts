const tinyeth = require('../dist/tinyeth');
//import tinyeth from '../dist/tinyeth';

(async () => {
  const node = new tinyeth.Peer();
  await node.connect(
    tinyeth.parseEncode(
      'enode:////565201cf682f2e62fc03173098e39e72ca49cb28beef29e956b480763150565be0471c39bccc8ffb4d8684e658034c3e7a93d315f57a42e82506bb29a973273e@172.16.254.4:30303'
    )
  );

  await node.sendMessage({
    type: tinyeth.MessageType.AUTH_EIP_8,
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(100);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
