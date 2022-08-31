import BigNumber from "bignumber.js";
import { injectable } from "inversify";
import { Address } from "../../dist/evm/Address";
import { Alchemy } from "./Alchemy";

@injectable()
export class AlchemyHook extends Alchemy {
    private storageHooks: Record<string, BigNumber> = {}
    
    public hookStorageAddress({ key, value }: { key: string; value: BigNumber }) {
        this.storageHooks[key.toString()] = value;        
    }

    public async getStorageAt({ address, key }: { address: Address; key: string }) {
        console.log(this.storageHooks)
        if (this.storageHooks[key]) {
            return this.storageHooks[key]
        } else {
            return super.getStorageAt({
                key,
                address
            })
        }
    }
}