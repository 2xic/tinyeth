import { Peer, sleep, ProductionContainer, parseEncode, MessageType } from '../dist';

(async () => {
  const node = new ProductionContainer()
    .create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      debugMode: true,
      loggingEnabled: true,
      useTestnet: true,
    })
    .get(Peer);

  const self = 'enode://abaf6d4d738ceeb1db5737ca84568efa88ed78ffc7f98760827a91ab67212e3328fdffba87c61bb98b6c316d880e1700c12d372ace0b4eb93e3b4b7c9337bd1b@127.0.0.1:30303';

  await node.connect(
    parseEncode(
      self
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

