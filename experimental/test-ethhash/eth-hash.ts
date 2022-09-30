import 'reflect-metadata'
import { UnitTestContainer } from "../../dist/container/UnitTestContainer";
import { EthHash } from "../../dist/consensus";
import BigNumber from "bignumber.js";
import { EthHashBlockParameters } from '../../dist/consensus/eth-hash/EthHashBlockParameters';



(() => {
    const container = new UnitTestContainer().create();
    container.unbind(EthHashBlockParameters);
    container.bind(EthHashBlockParameters).to(EthHashBlockParameters);

    const headerHash = Buffer.from(
        'ca2ff06caae7c94dc968be7d76d0fbf60dd2e1989ee9bf0d5931e48564d5143b',
        'hex'
      )

    const results = container.get(EthHash).mine({
      blockNumber: new BigNumber(2),
      header: headerHash,
      difficultly: new BigNumber(1),
    });
    /*
    const output = new UnitTestContainer()
        .create()
        .get(EthHash)
        .mine({
            blockNumber: new BigNumber(2),
            header: Buffer.alloc(0),
            difficultly: new BigNumber(1),
        })
*/
    console.log(results)
    console.log(results.length)
})()
