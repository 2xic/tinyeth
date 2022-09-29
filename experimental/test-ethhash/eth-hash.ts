import 'reflect-metadata'
import { UnitTestContainer } from "../../dist/container/UnitTestContainer";
import { EthHash } from "../../dist/consensus";
import BigNumber from "bignumber.js";



(() => {
    const output = new UnitTestContainer()
        .create()
        .get(EthHash)
        .mine({
            blockNumber: new BigNumber(2),
            header: Buffer.alloc(0),
            difficultly: new BigNumber(1),
        })

    console.log(output)
})()
