import { MessageCommand } from './Message';

// Message codes listed https://github.com/ethereum/devp2p/blob/master/caps/eth.md

export class GetBlockHeadersMessageCommand implements MessageCommand {
  constructor(private requestId: string, private protocolVersion: string) {}
  public generateMessage(): string {
    throw new Error('Method not implemented.');
  }
}
