import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { Address } from './Address';

@injectable()
export abstract class EvmExternalStorageRequests {
  public abstract getStorageAt({
    key,
    address,
  }: {
    key: string;
    address: Address;
  }): Promise<BigNumber>;
}
