import 'reflect-metadata';
import { Container } from 'inversify';
import { DecodeAuthEip8 } from '../network/auth/DecodeAuthEip8';
import { EncodeAuthEip8 } from '../network/auth/EncodeAuthEip8';
import { EncodeAuthPreEip8 } from '../network/auth/EncodeAuthPreEip8';
import { Auth8Eip } from '../network/AuthEip8';
import { Rlpx } from '../network/Rlpx';
import { KeyPair } from '../signatures/KeyPair';
import crypto from 'crypto';
import { RlpEncoder } from '../rlp/RlpEncoder';
import { Transactions } from '../transactions/Transaction';
import { RawTransaction } from '../transactions/RawTransaction';
import { Peer } from '../network/Peer';
import { RlpxDecrpyt } from '../network/RlpxDecrypt';

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

    container.bind(KeyPair).toSelf();

    container.bind(DecodeAuthEip8).toSelf();
    container.bind(EncodeAuthEip8).toSelf();
    container.bind(EncodeAuthPreEip8).toSelf();

    container.bind(RawTransaction).toSelf();
    container.bind(Transactions).toSelf();

    container.bind(Rlpx).toSelf();
    container.bind(RlpEncoder).toSelf();
    container.bind(Peer).toSelf();
    container.bind(Auth8Eip).toSelf();
    container.bind(RlpxDecrpyt).toSelf();

    return container;
  }
}

export interface ContainerOptions {
  privateKey?: string;
  ephemeralPrivateKey?: string;
}
