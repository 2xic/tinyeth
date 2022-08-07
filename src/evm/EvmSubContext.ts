import { injectable } from 'inversify';

@injectable()
export class EvmSubContext {
  private subContext: SubContext[] = [];

  public addSubContext(options: SubContext) {
    this.subContext.push(options);
  }

  public get tryGetLast(): undefined | SubContext {
    try {
      return this.last;
    } catch (err) {
      return undefined;
    }
  }

  public get last() {
    if (!this.subContext.length) {
      throw new Error('No sub-context');
    }
    return this.subContext[this.subContext.length - 1];
  }
}

interface SubContext {
  returnData?: Buffer;
  gasCost?: number;
  gasRefund?: number;
}
