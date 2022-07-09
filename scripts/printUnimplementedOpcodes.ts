import {opcodes, UnimplementedOpcode} from '../dist'
import { EvmContext } from '../dist/evm/Evm';

Object.values(opcodes).map((item) => {
    try {
        item.execute({} as any as EvmContext);
    } catch(err){
        if (err instanceof UnimplementedOpcode){
            console.log(`${item.mnemonic} is unimplemented`)
        }
    }
})
