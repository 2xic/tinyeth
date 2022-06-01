import { Peer, MessageType, ProductionContainer, getRandomPeer } from '../dist';

(async () => {
  const randomNode = getRandomPeer();
  /*  const randomNode = {
    publicKey:
      '865a63255b3bb68023b6bffd5095118fcc13e79dcf014fe4e47e065c350c7cc72af2e53eff895f11ba1bbb6a2b33271c1116ee870f266618eadfc2e78aa7349c',
    address: '52.176.100.77',
    port: 30303,
  };
*/
  console.log(randomNode);
  const node = new ProductionContainer()
    .create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
    })
    .get(Peer);

  //  await node.connect(parseEncode(randomNode));
  await node.connect(randomNode);

  await node.sendMessage({
    type: MessageType.AUTH_EIP_8,
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(100);
    await node.messageQueue.process();
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
