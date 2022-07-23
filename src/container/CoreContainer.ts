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
import { GetRandomBytesInteractor } from '../network/nonce-generator/GetRandomBytesInteractor';
import { EciesEncrypt } from '../network/ecies/EciesEncrypt';
import { EncodeAckEip8 } from '../network/auth/EncodeAckEip8';
import { CommunicationState } from '../network/rlpx/CommunicationState';
import { EciesDecrypt } from '../network/ecies/EciesDecrypt';
import { EncodeFrame } from '../network/auth/frameing/EncodeFrame';
import { DecodeFrame } from '../network/auth/frameing/DecodeFrame';
import { ReplayHelloPacket } from '../network/rlpx/packet-types/ReplayHelloPacket';
import { NodeManager } from '../network';
import { NodeCommunication } from '../network/wire/NodeCommunication';
import { PingPacketEncodeDecode } from '../network/wire/PingPacketEncodeDecode';
import { PacketEncapsulation } from '../network/wire/PacketEncapsulation';
import { WireMessageEncoder } from '../network/wire/WireMessageEncoder';
import { PongPacketEncodeDecode } from '../network/wire/PongPacketEncodeDecode';
import { NeighborsPacketEncodeDecode } from '../network/wire/NeighborsPacketEncodeDecode';
import { DebugCommunicationState } from '../network/rlpx/DebugCommunicationState';
import { DecodeAuthMessageInteractor } from '../network/rlpx/DecodeAuthMessageInteractor';
import { DecodeAckMessageInteractor } from '../network/rlpx/DecodeAckMessageInteractor';
import { RlpxMessageEncoder } from '../network/rlpx/RlpxMessageEncoder';
import { WireMessageDecoder } from '../network/wire/WireMessageDecoder';
import { FindNodePacketEncodeDecode } from '../network/wire/FindNodePacketEncodeDecode';
import { RlpxHelloPacketEncoderDecoder } from '../network/rlpx/packet-types/RlpxHelloPacketEncoderDecoder';
import { RlpxMessageDecoder } from '../network/rlpx/packet-types/RlpxMessageDecoder';
import { SendStatusMessage } from '../network/rlpx/eth/SendStatusMessage';
import { GetBlockHeader } from '../network/rlpx/eth/GetBlockHeader';
import { PeerConnectionState } from '../network/rlpx/PeerConnectionState';
import { PeerConnection } from '../network/rlpx/PeerConnection';
import { MessageQueue } from '../network/rlpx/MessageQueue';
import { EvmStack } from '../evm/EvmStack';
import { Network } from '../evm/Network';
import { EvmMemory } from '../evm/EvmMemory';
import { GasComputer } from '../evm/gas/GasComputer';
import { ComputeSstoreGas } from '../evm/gas/ComputeSstoreGas';
import { AccessSets } from '../evm/gas/AccessSets';
import { EvmKeyValueStorage } from '../evm/EvmKeyValueStorage';
import { MemoryExpansionGas } from '../evm/gas/MemoyExspansionGas';
import { AccountAccessGas } from '../evm/gas/AccountAccessGas';
import { EvmSubContext } from '../evm/EvmSubContext';
import { EvmSubContextCall } from '../evm/EvmSubContextCall';
import { EvmAccountState } from '../evm/EvmAccountState';
import { EvmErrorTrace } from '../evm/EvmErrorTrace';
import { BlockLoader } from '../blocks/BlockLoader';
import { NodeId } from '../network/rlpx/NodeId';
import { SimpleRplxHelloMessageEncoder } from '../network/rlpx/packet-types/RlpxHelloMessageEncoder';
import { ChainInformation } from '../network/ChainInformation';
import { ForkId } from '../network/rlpx/eth/ForkId';
import { SendEthMessage } from '../network/rlpx/eth/SendEthMessage';

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
        options?.ephemeralPrivateKey || crypto.randomBytes(32).toString('hex')
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
    container.bind('USE_TESTNET').toConstantValue(options?.useTestnet);

    container.bind(NodeManager).toSelf();
    container.bind(NodeCommunication).toSelf();
    container.bind(PingPacketEncodeDecode).toSelf();
    container.bind(PongPacketEncodeDecode).toSelf();
    container.bind(NeighborsPacketEncodeDecode).toSelf();
    container.bind(FindNodePacketEncodeDecode).toSelf();
    container.bind(PacketEncapsulation).toSelf();
    container.bind(WireMessageEncoder).toSelf();
    container.bind(PeerConnection).toSelf();
    container.bind(PeerConnectionState).toSelf();

    container.bind(SendStatusMessage).toSelf();
    container.bind(GetBlockHeader).toSelf();

    container.bind(KeyPair).toSelf();
    container.bind(Signatures).toSelf();

    container.bind(NodeId).toSelf();
    container.bind(SimpleRplxHelloMessageEncoder).toSelf();
    container.bind(ChainInformation).toSelf();
    container.bind(ForkId).toSelf();
    container.bind(SendEthMessage).toSelf();

    container.bind(DecodeAuthEip8).toSelf();
    container.bind(EncodeAuthEip8).toSelf();
    container.bind(DecodeAuthMessageInteractor).toSelf();
    container.bind(DecodeAckMessageInteractor).toSelf();
    container.bind(RlpxMessageEncoder).toSelf();
    container.bind(WireMessageDecoder).toSelf();
    container.bind(RlpxHelloPacketEncoderDecoder).toSelf();
    container.bind(RlpxMessageDecoder).toSelf();

    container.bind(EncodeAckEip8).toSelf();
    if (options?.debugMode) {
      container.bind(CommunicationState).to(DebugCommunicationState);
    } else {
      container.bind(CommunicationState).toSelf();
    }

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
    container.bind(EncodeFrame).toSelf();
    container.bind(DecodeFrame).toSelf();
    container.bind(ReplayHelloPacket).toSelf();

    container.bind(MessageQueue).toSelf();
    container.bind(GetRandomBytesInteractor).toSelf();

    container.bind(EvmStack).toSelf();
    container.bind(Network).toSelf();
    container.bind(EvmMemory).toSelf();
    container.bind(GasComputer).toSelf();
    container.bind(ComputeSstoreGas).toSelf();
    container.bind(AccessSets).toSelf();
    container.bind(EvmKeyValueStorage).toSelf();
    container.bind(MemoryExpansionGas).toSelf();
    container.bind(AccountAccessGas).toSelf();
    container.bind(EvmSubContextCall).toSelf();
    container.bind(EvmSubContext).toSelf();
    container.bind(EvmAccountState).toSelf();
    container.bind(EvmErrorTrace).toSelf();

    container.bind(Logger).toSelf();

    container.bind(BlockLoader).toSelf();

    return container;
  }
}

export interface ContainerOptions {
  privateKey?: string;
  ephemeralPrivateKey?: string;
  deterministicRandomness?: boolean;
  loggingEnabled?: boolean;
  debugMode?: boolean;
  useTestnet?: boolean;
}
