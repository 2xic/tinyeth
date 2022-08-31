import 'reflect-metadata';
import { Alchemy } from "./Alchemy";
import { EvmExternalStorageRequests, ForkingContainer, getBufferFromHex } from "../../dist";
import { Evm } from "../../dist/evm/Evm";
import { Address } from "../../dist/evm/Address";
import { Wei } from "../../dist/evm/eth-units/Wei";
import BigNumber from "bignumber.js";

const testingAddress = '0xb2ed12f121995cb55ddfc2f268d1901aec05a8de';

(async () => {
    const evmCode = await new Alchemy().getContractCode({
        address: testingAddress
    });

    const container = new ForkingContainer().create({
        loggingEnabled: true,
    })
    container.bind(EvmExternalStorageRequests).to(Alchemy);

    const evm = container.get(Evm);
    const program = getBufferFromHex(evmCode.result);

    evm.boot({
        program,
        context: {
            data: getBufferFromHex('0x095ea7b3000000000000000000000000c36442b4a4522e871399cd717abdd847ab11fe88ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
            gasLimit: new BigNumber(1000),
            nonce: 1,
            sender: new Address(),
            receiver: new Address(testingAddress),
            value: new Wei(new BigNumber(0)),
        }
    });
    const error = await evm.execute().catch((err) => err);
    if (!(error instanceof Error)) {
        throw new Error('Expected reverted')
    } else if (!(error.message.includes('transfer amount exceeds balance'))) {
        console.log(error);
        throw new Error('Wrong reverted')
    }
    console.log(error)
})()


