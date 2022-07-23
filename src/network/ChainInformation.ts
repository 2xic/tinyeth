import { inject, injectable } from 'inversify';
import os from 'os';

@injectable()
export class ChainInformation {
  constructor(
    @inject<boolean>('USE_TESTNET')
    private isTestnet: boolean
  ) {}

  public get chainInformation(): ChainInformationFields {
    if (this.isTestnet) {
      return {
        chainId: '12345',
        userAgent: 'Geth/v1.10.20-stable-8f2416a8/linux-amd64/go1.18.1',
        capabilities: [
          ['eth', 67],
          //  ['eth', 67],
          //        ['snap', 1],
        ],
        listenPort: 0,
        difficulty: 17179869184, //1,
        nextForkBlock: '0x118c30',
        genesisHash:
          'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
        bestBlockHash:
          'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
      };
    } else {
      return {
        chainId: '1',
        userAgent: `tinyeth/v0.0.1/${os.platform()}-${os.arch()}/nodejs`,
        capabilities: [
          ['eth', 66],
          ['eth', 67],
          ['snap', 1],
        ],
        listenPort: 0,
        nextForkBlock: '0x118c30',

        difficulty: 17179869184,
        genesisHash:
          'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
        bestBlockHash:
          'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
      };
    }
  }
}

interface ChainInformationFields {
  chainId: string;
  userAgent: string;
  capabilities: [string, number][];
  listenPort: number;
  difficulty: number;
  genesisHash: string;
  bestBlockHash: string;
  nextForkBlock: string;
}
