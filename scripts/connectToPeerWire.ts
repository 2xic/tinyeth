import { NodeManager, ProductionContainer, gethEnodes, parseEncode } from '../dist';


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
  node.events.on('alive', async (address: string) => {
    console.log([address, 'is alive :)'])
    await node.findNeighbors(address);
  })
  const nodes = gethEnodes.sort(() => Math.random() < 0.5 ? -1 : 1).slice(0, 1);
  await Promise.all(nodes.map(async (connection) => {
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
