import { NodeManager, ProductionContainer, getRandomGethPeer, ParsedEnode, gethEnodes, parseEncode } from '../dist';


(async () => {
  const node = new ProductionContainer()
    .create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      loggingEnabled: true,
    })
    .get(NodeManager);
  await Promise.all(gethEnodes.map(async (connection) => {
    await sleep(1000 * Math.random());
    await node.bootstrap(parseEncode(connection))
  }))

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(1000);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
