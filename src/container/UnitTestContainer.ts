import { FrameCommunication } from '../network/auth/frameing/FrameCommunication';
import { MockNonceGenerator } from '../network/nonce-generator/MockNonceGenerator';
import { NonceGenerator } from '../network/nonce-generator/NonceGenerator';
import { AbstractSocket } from '../network/socket/AbstractSocket';
import { MockSocket } from '../network/socket/MockSocket';
import { ExposedFrameCommunication } from '../network/auth/frameing/ExposedFrameCommunication';
import { ReplayContractTestUtils } from '../evm';
import { ContainerOptions, CoreContainer } from './CoreContainer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export class UnitTestContainer extends CoreContainer {
  public create(options?: Omit<ContainerOptions, 'loggingEnabled'>) {
    const loggingEnabled = !!process.env.LOGGING_ENABLED;
    const container = super.create({ ...options, loggingEnabled });

    container.bind(AbstractSocket).to(MockSocket);
    container.bind(NonceGenerator).to(MockNonceGenerator);
    container.bind(FrameCommunication).to(ExposedFrameCommunication);
    container.bind(ReplayContractTestUtils).toSelf();

    return container;
  }
}
