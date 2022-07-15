import { FrameCommunication } from '../network/auth/frameing/FrameCommunication';
import { MockNonceGenerator } from '../network/nonce-generator/MockNonceGenerator';
import { NonceGenerator } from '../network/nonce-generator/NonceGenerator';
import { AbstractSocket } from '../network/socket/AbstractSocket';
import { MockSocket } from '../network/socket/MockSocket';
import { ContainerOptions, CoreContainer } from './CoreContainer';
import { ExposedFrameCommunication } from '../network/auth/frameing/ExposedFrameCommunication';
import { ExposedEvm } from '../evm/ExposedEvm';
import { Evm } from '../evm/Evm';
import { InterfaceEvm } from '../evm/interfaceEvm';

export class UnitTestContainer extends CoreContainer {
  public create(options?: ContainerOptions) {
    const container = super.create(options);

    container.bind(AbstractSocket).to(MockSocket);
    container.bind(NonceGenerator).to(MockNonceGenerator);
    container.bind(FrameCommunication).to(ExposedFrameCommunication);
    container.bind(ExposedEvm).toSelf();
    container.bind(Evm).toSelf();

    container.bind(InterfaceEvm).to(ExposedEvm);

    return container;
  }
}
