import { injectable } from 'inversify';

@injectable()
export class Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(message?: any, optionalParams: any[] = []) {
    // eslint-disable-next-line no-constant-condition
    if (false) {
      console.log(message, ...optionalParams);
    }
  }
}
