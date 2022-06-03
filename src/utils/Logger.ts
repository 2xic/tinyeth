import { inject, injectable } from 'inversify';

@injectable()
export class Logger {
  constructor(
    @inject('IS_LOGGING_ENABLED')
    private isLoggingEnabled: boolean
  ) {}

  public log(message?: unknown, optionalParams: unknown[] = []) {
    if (this.isLoggingEnabled) {
      console.log(message, ...optionalParams);
    }
  }
}
