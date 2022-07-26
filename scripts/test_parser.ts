import { Parser, ProductionContainer } from '../dist/';

(async () => {
  const server = new ProductionContainer()
    .create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
    })
    .get(Parser);
    const simpleSolidity = `
        contract SimpleContract {
            function return1() public pure returns (uint8) {
            return 1;
            }
        }
    `;

    //   uint8 private name;

  const output = server.parse({
    input: simpleSolidity
  })

  console.log(output);
  console.log(JSON.stringify(output))
})();

