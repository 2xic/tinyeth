import { Evm, TxContext } from './Evm';
import { EvmAccountState } from './EvmAccountState';
import { EvmKeyValueStorage } from './EvmKeyValueStorage';
import { EvmMemory } from './EvmMemory';
import { EvmStack } from './EvmStack';
import { EvmSubContext } from './EvmSubContext';
import { EvmSubContextCall } from './EvmSubContextCall';
import { AccessSets } from './gas/AccessSets';
import { GasComputer } from './gas/GasComputer';
import { Network } from './Network';

export abstract class InterfaceEvm {
  public abstract get memory(): EvmMemory;

  public abstract get storage(): EvmKeyValueStorage;

  public abstract boot(options: EvmBootOptions): InterfaceEvm;

  public abstract get callingContextReturnData(): Buffer | undefined;

  public abstract execute(): InterfaceEvm;

  public abstract gasCost(): number;
}

export interface EvmBootOptions {
  program: Buffer;
  context: TxContext;
  options?: DebugOptions;
}

export interface EvmContextWithSelfReference extends EvmContext {
  evmContext: EvmContext;
}

export interface EvmContext {
  evm: Evm;
  stack: EvmStack;
  network: Network;
  memory: EvmMemory;
  storage: EvmKeyValueStorage;
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
