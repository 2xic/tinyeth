import BigNumber from 'bignumber.js';
import { EvmStorage } from './EvmStorage';
import { EvmExternalStorageRequests } from './EvmExternalStorageRequests';
import { Address } from './Address';
import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';

@injectable()
export class EvmStorageForking extends EvmStorage {
  constructor(
    private evmExternalStorageRequests: EvmExternalStorageRequests,
    private logging: Logger
  ) {
    super();
  }
  public write({ key, value }: { key: BigNumber; value: BigNumber }) {
    return super.write({ key, value });
  }

  public async read({
    key,
    address,
  }: {
    key: BigNumber | number;
    address: Address;
  }): Promise<BigNumber> {
    if (this.hasKey({ key })) {
      return this.read({ key, address });
    } else {
      const value = await this.evmExternalStorageRequests.getStorageAt({
        key: key.toString(),
        address,
      });
      this.logging.log(`Reading storage ${key}, got value ${value}`);
      this.write({ key: new BigNumber(key), value });
      return value;
    }
  }
}
