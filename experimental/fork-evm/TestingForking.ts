import 'reflect-metadata';
import { Alchemy } from "./Alchemy";
import { EvmStorageForking, ForkingContainer, getBufferFromHex, ProductionContainer } from "../../dist";
import { Evm } from "../../dist/evm/Evm";
import { Address } from "../../dist/evm/Address";
import { Wei } from "../../dist/evm/eth-units/Wei";
import BigNumber from "bignumber.js";
import { EvmStorage } from '../../dist/evm/EvmStorage';

const testingAddress = '0xb2ed12f121995cb55ddfc2f268d1901aec05a8de';


(async () => {
    /*
        This should be able to execute without problems,
        looks like we still need to fix up some bugs in the EVM before
        enabling forking.
    */
    const evmCode = await new Alchemy().getContractCode({
        address: testingAddress
    });
    const storageValue = await new Alchemy().getStorageAt({
        address: testingAddress,
        key: '17978774291734825892607321453239800186494799842507858885805654573319060105575'
    })
    console.log(storageValue)

    const container = new ForkingContainer().create({
        loggingEnabled: true,
    })
    const evm = container.get(Evm);
  /*  container.get(EvmStorageForking).setRequester(
        {
            callback: async (key) => {
                const storageValue = (await new Alchemy().getStorageAt({
                    address: testingAddress,
                    key: key, //'17978774291734825892607321453239800186494799842507858885805654573319060105575'
                })).result.slice(2)
                return new BigNumber(storageValue, 16)
            }
        }
    )*/

    const program  = getBufferFromHex(evmCode.result);
    console.log(program.toString('hex'))

    evm.boot({
        program,
        context: {
            data: getBufferFromHex('0x095ea7b3000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c8ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
            gasLimit: new BigNumber(1000),
            nonce: 1,
            sender: new Address(),
            value: new Wei(new BigNumber(0)),
        },
        options: {
            debug: true,
        }
    });
    evm.execute();
    console.log(evm.callingContextReturnData)
})()


