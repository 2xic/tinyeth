import BigNumber from 'bignumber.js';
import { EvmStorage } from './EvmStorage';

export class EvmStorageForking extends EvmStorage {
  private requestHandler: (key: string) => Promise<BigNumber> = () => {
    throw new Error('Not implemented');
  };

  public write({ key, value }: { key: BigNumber; value: BigNumber }) {
    return super.write({ key, value });
  }

  public async read({ key }: { key: BigNumber | number }): Promise<BigNumber> {
    if (this.hasKey({ key })) {
      return this.read({ key });
    } else {
      const value = await this.requestHandler(key.toString());
      this.write({ key: new BigNumber(key), value });
      return this.read({ key });
    }
  }

  public setRequester({
    callback,
  }: {
    callback: (key: string) => Promise<BigNumber>;
  }) {
    this.requestHandler = callback;
  }
}
