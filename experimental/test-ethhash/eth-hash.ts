import 'reflect-metadata'
import { UnitTestContainer } from "../../dist/container/UnitTestContainer";
import { EthHash, EthHashBlockParametersMock } from "../../dist/consensus";
import BigNumber from "bignumber.js";
import { EthHashBlockParameters } from '../../dist/consensus/eth-hash/EthHashBlockParameters';



(() => {
    const container = new UnitTestContainer().create();
    container.unbind(EthHashBlockParameters);
    container.bind(EthHashBlockParameters).to(EthHashBlockParametersMock);

    const results = container.get(EthHash).mine({
      blockNumber: new BigNumber(0),
      difficultly: new BigNumber(1),
      header: Buffer.alloc(32),
      nonce: Buffer.alloc(8),
  });

    console.log(results)
    console.log(results.length)
})()
