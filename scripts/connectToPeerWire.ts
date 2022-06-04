import { NodeManager, ProductionContainer, getRandomGethPeer } from '../dist';

(async () => {
  const randomNode = getRandomGethPeer();
  const node = new ProductionContainer()
    .create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      loggingEnabled: true,
    })
    .get(NodeManager);

  await node.bootstrap(randomNode);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(1000);
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
