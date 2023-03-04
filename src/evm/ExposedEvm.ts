import { injectable } from 'inversify';
import { Logger } from '../utils/Logger';
import { Evm } from './Evm';
import { EvmAccountState } from './EvmAccountState';
import { EvmDebugger } from './EvmDebugger';
import { EvmStorage } from './EvmStorage';
import { EvmMemory } from './EvmMemory';
import { EvmStack } from './EvmStack';
import { EvmSubContext } from './EvmSubContext';
import { EvmSubContextCall } from './EvmSubContextCall';
import { AccessSets } from './gas/AccessSets';
import { GasComputer } from './gas/GasComputer';
import { InterfaceEvm } from './interfaceEvm';
import { Network } from './Network';

@injectable()
export class ExposedEvm extends Evm implements InterfaceEvm {
  constructor(
    public stack: EvmStack,
    public network: Network,
    public memory: EvmMemory,
    public storage: EvmStorage,
    public gasComputer: GasComputer,
    public accessSets: AccessSets,
    public subContext: EvmSubContext,
    public subContextExecutor: EvmSubContextCall,
    public evmAccountState: EvmAccountState,
    public logger: Logger,
    public evmDebugger: EvmDebugger
  ) {
    super(
      stack,
      network,
      memory,
      storage,
      gasComputer,
      accessSets,
      subContext,
      subContextExecutor,
      evmAccountState,
      evmDebugger,
      logger
    );
  }

  public peekOpcode(){
    return this.loadOpcode();
  }
}
