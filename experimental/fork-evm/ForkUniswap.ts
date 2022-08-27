import 'reflect-metadata';
import { Alchemy } from "./Alchemy";
import { getBufferFromHex, ProductionContainer } from "../../dist";
import { Evm } from "../../dist/evm/Evm";
import { Address } from "../../dist/evm/Address";
import { Wei } from "../../dist/evm/eth-units/Wei";
import BigNumber from "bignumber.js";

const testingAddress = '0xd35EFAE4097d005720608Eaf37E42a5936C94B44';


(async () => {
    const evmCode = await new Alchemy().getContractCode({
        address: testingAddress
    });

    const evm = new ProductionContainer().create().get(Evm);

    const program  = getBufferFromHex(evmCode.result);
    console.log(program)

    evm.boot({
        program,
        context: {
            data: Buffer.alloc(0),
            gasLimit: new BigNumber(1000),
            nonce: 100,
            sender: new Address(),
            value: new Wei(new BigNumber(10)),
        }
    });
    evm.execute();
})()


