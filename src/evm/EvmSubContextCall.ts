import BigNumber from 'bignumber.js';
import { injectable } from 'inversify';
import { getFreshContainer } from '../container/getClassFromTestContainer';
import { Address } from './Address';
import { Reverted } from './errors/Reverted';
import { StackUnderflow } from './errors/StackUnderflow';
import { TxContext } from './Evm';
import { EvmContext, InterfaceEvm } from './interfaceEvm';
import { Wei } from './eth-units/Wei';
import { InvalidOpcode } from './errors/InvalidOpcode';

@injectable()
export class EvmSubContextCall {
  public async createSubContext({
    evmContext,
    optionsSubContext,
    gasLimit,
  }: {
    evmContext: EvmContext;
    optionsSubContext: SubContext;
    gasLimit: BigNumber;
  }) {
    const { memory, stack, network, subContext, context } = evmContext;
    const { argsOffset, argsSize, value, address, retSize, retOffset } =
      optionsSubContext;

    const data = memory.read(argsOffset.toNumber(), argsSize.toNumber());
    const contract = network.get(address);
    let executionCost = 0;

    const forkedEvm = this.fork({
      evmContext,
      isFork: false,
      txContext: {
        value: new Wei(new BigNumber(value?.toNumber() || 0)),
        data,
        nonce: 0,
        receiver: context.receiver,
        sender: context.sender,
        gasLimit,
      },
      copy: optionsSubContext.copy,
    });

    try {
      await contract.execute(forkedEvm);

      subContext.addSubContext({
        returnData: contract.returnData,
      });
      stack.push(new BigNumber(1));

      if (subContext.last.returnData?.length && optionsSubContext.retOffset) {
        subContext.last.returnData
          .slice(0, retSize.toNumber())
          .forEach((item, index) => {
            memory.write(retOffset.toNumber() + index, item);
          });
      } else if (!optionsSubContext.retSize.isZero()) {
        throw new Error('Expected return data in sub-context');
      }
      executionCost = forkedEvm.evm.gasCost();
    } catch (err) {
      if (
        err instanceof InvalidOpcode ||
        err instanceof Reverted ||
        err instanceof StackUnderflow
      ) {
        stack.push(new BigNumber(0));

        /**
         * From https://github.com/wolflo/evm-opcodes/blob/main/gas.md
         * On execution of any invalid operation, whether the designated INVALID opcode or simply an undefined opcode, all remaining gas is consumed and the state is reverted to the point immediately prior to the beginning of the current execution context.
         */
        if (err instanceof InvalidOpcode) {
          executionCost = gasLimit.toNumber();
        } else {
          executionCost = forkedEvm.evm.gasCost();
        }
      } else {
        throw err;
      }
    }

    const { gasCost: callCost } = evmContext.gasComputer.call({
      value: new BigNumber(0),
      address,
    });
    const memoryExpansionCost =
      evmContext.gasComputer.memoryExpansion({
        address: retOffset.plus(retSize),
      }).gasCost +
      evmContext.gasComputer.memoryExpansion({
        address: argsOffset.plus(argsSize),
      }).gasCost;

    const gasCost = callCost + executionCost + memoryExpansionCost;

    console.log({
      callCost,
      executionCost,
      memoryExpansionCost,
    });

    return {
      gasCost,
    };
  }

  public fork({
    evmContext,
    txContext,
    isFork = true,
    copy = false,
  }: {
    evmContext: EvmContext;
    txContext: TxContext;
    isFork?: boolean;
    copy?: boolean;
  }): ForkedEvm {
    const freshContainer = getFreshContainer();
    const evm = freshContainer.get(InterfaceEvm);

    if (copy) {
      evmContext.memory.raw.forEach((item, index) => {
        evm.memory.write(index, item);
      });
      evmContext.storage.forEach((key, value) => {
        evm.storage.write({ key, value });
      });
    }

    return {
      executor: async ({ program }: { program: Buffer }) => {
        await evm
          .boot({
            isFork,
            isSubContext: true,
            program,
            context: {
              value: new Wei(new BigNumber(0)), // txContext.value,
              data: txContext.data,
              nonce: 0,
              // Root
              receiver: txContext.receiver,
              sender: evmContext.context.sender,
              gasLimit: evmContext.context.gasLimit,
            },
            options: { debug: true },
          })
          .execute();

        return evm;
      },
      evm,
    };
  }
}

export interface ForkedEvm {
  executor: ({ program }: { program: Buffer }) => Promise<InterfaceEvm>;
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
  copy?: boolean;
}
