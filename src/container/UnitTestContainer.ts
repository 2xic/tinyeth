import { MockNonceGenerator } from '../network/nonce-generator/MockNonceGenerator';
import { NonceGenerator } from '../network/nonce-generator/NonceGenerator';
import { AbstractSocket } from '../network/socket/AbstractSocket';
import { MockSocket } from '../network/socket/MockSocket';
import { ContainerOptions, CoreContainer } from './CoreContainer';

export class UnitTestContainer extends CoreContainer {
  public create(options?: ContainerOptions) {
    const container = super.create(options);

    container.bind(AbstractSocket).to(MockSocket);
    container.bind(NonceGenerator).to(MockNonceGenerator);

    return container;
  }
}
