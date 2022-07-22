import { NonceGenerator } from '../network/nonce-generator/NonceGenerator';
import { AbstractSocket } from '../network/socket/AbstractSocket';
import { ContainerOptions, CoreContainer } from './CoreContainer';
import net from 'net';
import { CryptoNonceGenerator } from '../network/nonce-generator/CryptoNonceGenerator';
import { FrameCommunication } from '../network/auth/frameing/FrameCommunication';
import { NodeServer } from '../network';

export class ProductionContainer extends CoreContainer {
  public create(options?: ContainerOptions) {
    const container = super.create(options);

    container
      .bind(AbstractSocket)
      .toConstantValue(new net.Socket() as AbstractSocket);
    container.bind(NonceGenerator).to(CryptoNonceGenerator);
    container.bind(FrameCommunication).toSelf();

    container.bind(NodeServer).toSelf();

    return container;
  }
}
