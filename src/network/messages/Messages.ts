import { GetBlockHeadersMessageCommand } from './GetBlockHeadersMessageCommand';

// Message codes listed https://github.com/ethereum/devp2p/blob/master/caps/eth.md
export const Messages = {
  0x03: GetBlockHeadersMessageCommand,
};
