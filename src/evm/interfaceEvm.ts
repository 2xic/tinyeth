import { Evm, TxContext } from './Evm';
import { EvmAccountState } from './EvmAccountState';
import { EvmStorage } from './EvmStorage';
import { EvmMemory } from './EvmMemory';
import { EvmStack } from './EvmStack';
import { EvmSubContext } from './EvmSubContext';
import { EvmSubContextCall } from './EvmSubContextCall';
import { AccessSets } from './gas/AccessSets';
import { GasComputer } from './gas/GasComputer';
import { Network } from './Network';

export abstract class InterfaceEvm {
  public abstract get memory(): EvmMemory;

  public abstract get storage(): EvmStorage;

  public abstract boot(options: EvmBootOptions): InterfaceEvm;

  public abstract get callingContextReturnData(): Buffer | undefined;

  public abstract execute(): Promise<InterfaceEvm>;

  public abstract gasCost(): number;
}

export interface EvmBootOptions {
  program: Buffer;
  context: TxContext;
  options?: DebugOptions;
  isFork?: boolean;
}

export interface EvmContextWithSelfReference extends EvmContext {
  evmContext: EvmContext;
}

export interface EvmContext {
  evm: Evm;
  stack: EvmStack;
  network: Network;
  memory: EvmMemory;
  storage: EvmStorage;
  accessSets: AccessSets;
  gasComputer: GasComputer;
  byteIndex: number;
  context: TxContext;
  subContext: EvmSubContext;
  evmSubContextCall: EvmSubContextCall;
  evmAccountState: EvmAccountState;
}

export interface DebugOptions {
  debug: boolean;
}
