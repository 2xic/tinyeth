import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { getClassFromTestContainer } from '../container/getClassFromTestContainer';
import { Address } from './Address';
import { Reverted } from './errors/Reverted';
import { TxContext } from './Evm';
import { EvmContext, InterfaceEvm } from './interfaceEvm';
import { Wei } from './Wei';

@injectable()
export class EvmSubContextCall {
  public createSubContext({
    evmContext,
    optionsSubContext,
  }: {
    evmContext: EvmContext;
    optionsSubContext: SubContext;
  }) {
    const { memory, stack, network, subContext, context } = evmContext;
    try {
      const { argsOffset, argsSize, value, address, retSize, retOffset } =
        optionsSubContext;

      const data = memory.read(argsOffset.toNumber(), argsSize.toNumber());
      const contract = network.get(address);

      const forkedEvm = this.fork({
        evmContext,
        txContext: {
          value: new Wei(value?.toNumber() || 0),
          data,
          nonce: 0, // context.nonce,
          sender: context.sender,
          gasLimit: context.gasLimit,
        },
      });

      contract.execute(forkedEvm);

      subContext.addSubContext({
        returnData: contract.returnData,
      });
      stack.push(new BigNumber(1));
      if (subContext.last.returnData?.length) {
        subContext.last.returnData
          .slice(0, retSize.toNumber())
          .forEach((item, index) => {
            memory.write(retOffset.toNumber() + index, item);
          });
      } else {
        throw new Error('Expected return data in sub-context');
      }
    } catch (err) {
      if (err instanceof Reverted) {
        stack.push(new BigNumber(0));
      } else {
        throw err;
      }
    }
  }

  public fork({
    evmContext,
    txContext,
  }: {
    evmContext: EvmContext;
    txContext: TxContext;
  }): ForkedEvm {
    const evm = getClassFromTestContainer(InterfaceEvm);
    evmContext.memory.raw.forEach((item, index) => {
      evm.memory.write(index, item);
    });
    evmContext.storage.forEach((key, value) => {
      evm.storage.write({ key, value });
    });

    return {
      executor: ({ program }: { program: Buffer }) =>
        evm
          .boot({
            program,
            context: {
              value: txContext.value,
              data: txContext.data,
              nonce: 0,
              // Root
              sender: evmContext.context.sender,
              gasLimit: evmContext.context.gasLimit,
            },
            options: { debug: false },
          })
          .execute(),
    };
  }
}

export interface ForkedEvm {
  executor: ({ program }: { program: Buffer }) => InterfaceEvm;
}

interface SubContext {
  gas: BigNumber;
  value?: BigNumber;
  address: Address;
  argsOffset: BigNumber;
  argsSize: BigNumber;
  retOffset: BigNumber;
  retSize: BigNumber;
}
