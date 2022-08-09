import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { getClassFromTestContainer } from '../container/getClassFromTestContainer';
import { Address } from './Address';
import { Reverted } from './errors/Reverted';
import { StackUnderflow } from './errors/StackUnderflow';
import { TxContext } from './Evm';
import { EvmContext, InterfaceEvm } from './interfaceEvm';
import { Wei } from './eth-units/Wei';

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
    const { argsOffset, argsSize, value, address, retSize, retOffset } =
      optionsSubContext;

    const data = memory.read(argsOffset.toNumber(), argsSize.toNumber());
    const contract = network.get(address);

    const forkedEvm = this.fork({
      evmContext,
      isFork: false,
      txContext: {
        value: new Wei(new BigNumber(value?.toNumber() || 0)),
        data,
        nonce: 0,
        sender: context.sender,
        gasLimit: context.gasLimit,
      },
    });

    try {
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
      if (err instanceof Reverted || err instanceof StackUnderflow) {
        stack.push(new BigNumber(0));
      } else {
        throw err;
      }
    }

    return {
      gasCost: forkedEvm.evm.gasCost(),
    };
  }

  public fork({
    evmContext,
    txContext,
    isFork = true,
  }: {
    evmContext: EvmContext;
    txContext: TxContext;
    isFork?: boolean;
  }): ForkedEvm {
    const evm = getClassFromTestContainer(InterfaceEvm);
    evmContext.memory.raw.forEach((item, index) => {
      evm.memory.write(index, item);
    });
    evmContext.storage.forEach((key, value) => {
      evm.storage.write({ key, value });
    });

    return {
      executor: ({ program }: { program: Buffer }) => {
        evm
          .boot({
            isFork,
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
          .execute();

        return evm;
      },
      evm,
    };
  }
}

export interface ForkedEvm {
  executor: ({ program }: { program: Buffer }) => InterfaceEvm;
  evm: InterfaceEvm;
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
