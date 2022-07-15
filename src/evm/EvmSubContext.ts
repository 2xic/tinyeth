import { injectable } from 'inversify';

@injectable()
export class EvmSubContext {
  private subContext: SubContext[] = [];

  public addSubContext(options: SubContext) {
    this.subContext.push(options);
  }

  public get last() {
    return this.subContext[this.subContext.length - 1];
  }
}

interface SubContext {
  returnData?: Buffer;
}
