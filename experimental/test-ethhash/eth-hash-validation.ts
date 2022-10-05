import 'reflect-metadata'
import { UnitTestContainer } from "../../dist/container/UnitTestContainer";
import { EthHashBlockParametersMock, EthHashValidation } from "../../dist/consensus";
import BigNumber from "bignumber.js";
import { EthHashBlockParameters } from '../../dist/consensus/eth-hash/EthHashBlockParameters';

(() => {
    const container = new UnitTestContainer().create();
    container.unbind(EthHashBlockParameters);
    container.bind(EthHashBlockParameters).to(EthHashBlockParametersMock);

    const headerHash = Buffer.from(
        'ca2ff06caae7c94dc968be7d76d0fbf60dd2e1989ee9bf0d5931e48564d5143b',
        'hex'
    )

    const results = container.get(EthHashValidation).validatePow({
        headerHash: Buffer.alloc(32),
        nonce: Buffer.alloc(8),
        blockNumber: new BigNumber(0),
        difficultly: new BigNumber(100),
        mixHash: Buffer.from('ba4d46a087cdfa4ab7d61c372804695c217ca008e55139409c9fd1b8e4c02e9e', 'hex'),
    });

    console.log(results)
})()
