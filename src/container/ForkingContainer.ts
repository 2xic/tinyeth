import { ContainerOptions } from './CoreContainer';
import { ProductionContainer } from './ProductionContainer';
import { Container } from 'inversify';
import { EvmStorage } from '../evm/EvmStorage';
import { EvmStorageForking } from '../evm/EvmStorageForking';
import { EvmAccountState } from '../evm/EvmAccountState';
import { EvmAccountStateForking } from '../evm/EvmAccountStateForking';

export class ForkingContainer extends ProductionContainer {
  public create(options?: ContainerOptions) {
    const container = super.create(options);

    this.rebind(container, EvmStorage, EvmStorageForking);
    this.rebind(container, EvmAccountState, EvmAccountStateForking);

    return container;
  }

  private rebind<T>(container: Container, item: new () => T, to: new () => T) {
    container.unbind(item);
    container.bind(item).to(to);
  }
}
