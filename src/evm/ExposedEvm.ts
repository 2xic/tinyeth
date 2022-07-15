import { injectable } from 'inversify';
import { Evm } from './Evm';
import { EvmKeyValueStorage } from './EvmKeyValueStorage';
import { EvmMemory } from './EvmMemory';
import { EvmStack } from './EvmStack';
import { EvmSubContext } from './EvmSubContext';
import { AccessSets } from './gas/AccessSets';
import { GasComputer } from './gas/GasComputer';
import { Network } from './Network';

@injectable()
export class ExposedEvm extends Evm {
  constructor(
    public stack: EvmStack,
    public network: Network,
    public memory: EvmMemory,
    public storage: EvmKeyValueStorage,
    public gasComputer: GasComputer,
    public accessSets: AccessSets,
    public subContext: EvmSubContext
  ) {
    super(stack, network, memory, storage, gasComputer, accessSets, subContext);
  }

  // TODO: this should be a fork call
  public copy(evm: Evm) {
    evm.memory.raw.forEach((item, index) => {
      this.memory.write(index, item);
    });
    evm.storage.forEach((key, value) => {
      this.storage.write({ key, value });
    });
  }
}
