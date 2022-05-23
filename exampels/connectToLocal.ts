import { Peer, parseEncode, MessageType } from '../dist';

(async () => {
  const node = new Peer();
  await node.connect(
    parseEncode(
      'enode://565201cf682f2e62fc03173098e39e72ca49cb28beef29e956b480763150565be0471c39bccc8ffb4d8684e658034c3e7a93d315f57a42e82506bb29a973273e@localhost:30303'
    )
  );

  await node.sendMessage({
    type: MessageType.AUTH_EIP_8,
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(100);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
