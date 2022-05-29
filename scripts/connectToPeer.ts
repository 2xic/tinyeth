import {
  Peer,
  enocdes,
  MessageType,
  parseEncode,
  ProductionContainer,
} from '../dist';

(async () => {
  await Promise.all(
    enocdes.slice(0, 1).map(async (item: string) => {
      const node = new ProductionContainer()
        .create({
          privateKey:
            '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
          ephemeralPrivateKey:
            '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
        })
        .get(Peer);

      await node.connect(parseEncode(item));

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
