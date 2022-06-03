import 'reflect-metadata';
import { Container } from 'inversify';
import { DecodeAuthEip8 } from '../network/auth/DecodeAuthEip8';
import { EncodeAuthEip8 } from '../network/auth/EncodeAuthEip8';
import { Auth8Eip } from '../network/auth/AuthEip8';
import { Rlpx } from '../network/Rlpx';
import { KeyPair } from '../signatures/KeyPair';
import crypto from 'crypto';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { Transactions } from '../transactions/Transaction';
import { RawTransaction } from '../transactions/RawTransaction';
import { Peer } from '../network/Peer';
import { RlpxDecrpyt } from '../network/rlpx/RlpxDecrypt';
import { RlpxEcies } from '../network/rlpx/RlpxEcies';
import { ConstructAuthMessage } from '../network/auth/ConstructAuthMessage';
import { RlpDecoder } from '../rlp/RlpDecoder';
import { Signatures } from '../signatures/Signatures';
import { Logger } from '../utils/Logger';
import { MessageQueue } from '../network/MessageQueue';
import { GetRandomBytesInteractor } from '../network/nonce-generator/GetRandomBytesInteractor';
import { EciesEncrypt } from '../network/ecies/EciesEncrypt';
import { EncodeAckEip8 } from '../network/auth/EncodeAckEip8';
import { CommunicationState } from '../network/rlpx/CommunicationState';
import { EciesDecrypt } from '../network/ecies/EciesDecrypt';
import { FrameCommunication } from '../network/auth/frameing/FrameCommunication';
import { EncodeFrame } from '../network/auth/frameing/EncodeFrame';
import { DecodeFrame } from '../network/auth/frameing/DecodeFrame';
import { ReplayHelloPacket } from '../network/packet-types/ReplayHelloPacket';

export class CoreContainer {
  protected create(options?: ContainerOptions) {
    const container = new Container({
      defaultScope: 'Singleton',
    });
    container
      .bind('PRIVATE_KEY')
      .toConstantValue(
        options?.privateKey || crypto.randomBytes(32).toString('hex')
      );
    container
      .bind('EMPHERMAL_PRIVATE_KEY')
      .toConstantValue(
        options?.privateKey || crypto.randomBytes(32).toString('hex')
      );

    container
      .bind('SHOULD_RANDOMNESS_BE_DETERMINISTIC')
      .toConstantValue(
        typeof options?.deterministicRandomness === 'boolean'
          ? options?.deterministicRandomness
          : false
      );
    container
      .bind('IS_LOGGING_ENABLED')
      .toConstantValue(options?.loggingEnabled);

    container.bind(KeyPair).toSelf();
    container.bind(Signatures).toSelf();

    container.bind(DecodeAuthEip8).toSelf();
    container.bind(EncodeAuthEip8).toSelf();

    container.bind(EncodeAckEip8).toSelf();
    container.bind(CommunicationState).toSelf();

    container.bind(RawTransaction).toSelf();
    container.bind(Transactions).toSelf();

    container.bind(RlpEncoder).toSelf();
    container.bind(RlpDecoder).toSelf();

    container.bind(Rlpx).toSelf();
    container.bind(Peer).toSelf();
    container.bind(Auth8Eip).toSelf();
    container.bind(RlpxDecrpyt).toSelf();
    container.bind(RlpxEcies).toSelf();
    container.bind(ConstructAuthMessage).toSelf();
    container.bind(EciesEncrypt).toSelf();
    container.bind(EciesDecrypt).toSelf();
    container.bind(FrameCommunication).toSelf();
    container.bind(EncodeFrame).toSelf();
    container.bind(DecodeFrame).toSelf();
    container.bind(ReplayHelloPacket).toSelf();

    container.bind(MessageQueue).toSelf();
    container.bind(GetRandomBytesInteractor).toSelf();

    container.bind(Logger).toSelf();

    return container;
  }
}

export interface ContainerOptions {
  privateKey?: string;
  ephemeralPrivateKey?: string;
  deterministicRandomness?: boolean;
  loggingEnabled?: boolean;
}
