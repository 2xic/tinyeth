import { injectable } from 'inversify';
import { Evm } from './Evm';
import { EvmKeyValueStorage } from './EvmKeyValueStorage';
import { EvmMemory } from './EvmMemory';
import { EvmStack } from './EvmStack';
import { GasComputer } from './gas/GasComputer';
import { Network } from './Network';

@injectable()
export class ExposedEvm extends Evm {
  constructor(
    public stack: EvmStack,
    public network: Network,
    public memory: EvmMemory,
    public storage: EvmKeyValueStorage,
    public gasComputer: GasComputer
  ) {
    super(stack, network, memory, storage, gasComputer);
  }
}
