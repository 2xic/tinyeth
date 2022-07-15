import { Container } from 'inversify';
import { UnitTestContainer } from '../../../container/UnitTestContainer';
import { cleanString } from '../../../utils';
import { getBufferFromHex } from '../../../utils/getBufferFromHex';
import { RlpxHelloPacketEncoderDecoder } from './RlpxHelloPacketEncoderDecoder';
import { describe, it, expect } from '../../../getActiveTestMetadata';

describe('RlpxHelloMessage', () => {
  let helloPacketEncoderDecoder: RlpxHelloPacketEncoderDecoder;
  let container: Container;
  beforeEach(() => {
    container = new UnitTestContainer().create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      deterministicRandomness: true,
    });
    helloPacketEncoderDecoder = container.get(RlpxHelloPacketEncoderDecoder);
  });

  // from https://github.com/ethereum/go-ethereum/pull/2091/files#diff-a2488b7a37555bfb5c64327072acdbbf703ab127176956f6b6558067950f8f73R455

  it('should correctly decode hello packet', () => {
    // from https://eips.ethereum.org/EIPS/eip-8
    const helloPacket = getBufferFromHex(
      cleanString(`
    f87137916b6e6574682f76302e39312f706c616e39cdc5836574683dc6846d6f726b1682270fb840
    fda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569
    bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877c883666f6f836261720304    
     `)
    );

    const decodedPacket = helloPacketEncoderDecoder.decode({
      input: helloPacket,
    });
    //expect(decodedPacket.version).toBe(22);
    expect(decodedPacket.nodeId).toBe(
      '0xfda1cff674c90c9a197539fe3dfb53086ace64f83ed7c6eabec741f7f381cc803e52ab2cd55d5569bce4347107a310dfd5f88a010cd2ffd1005ca406f1842877'
    );
  });

  it('should correctly decode hello packet from geth', () => {
    const helloPacket = getBufferFromHex(
      cleanString(`
      80f88305b0476574682f76312e31302e31372d737461626c652d32356339623439662f6c696e75782d616d6436342f676f312e3138cdc58365746842c684736e61700180b840565201cf682f2e62fc03173098e39e72ca49cb28beef29e956b480763150565be0471c39bccc8ffb4d8684e658034c3e7a93d315f57a42e82506bb29a973273e     `)
    );

    const decodedPacket = helloPacketEncoderDecoder.decode({
      input: helloPacket.slice(1),
    });
    expect(decodedPacket.userAgent).toBe(
      'Geth/v1.10.17-stable-25c9b49f/linux-amd64/go1.18'
    );
    expect(decodedPacket.protocolVersion).toBe(5);
    expect(decodedPacket.capabilities.toString()).toBe(
      [
        ['eth', 66],
        ['snap', 1],
      ].toString()
    );
    expect(decodedPacket.listenPort).toBe(0);
    expect(decodedPacket.nodeId).toBe(
      '0x565201cf682f2e62fc03173098e39e72ca49cb28beef29e956b480763150565be0471c39bccc8ffb4d8684e658034c3e7a93d315f57a42e82506bb29a973273e'
    );
  });

  it('should correctly create an hello packet', () => {
    const helloPacket = getBufferFromHex(
      cleanString(`
      80f88305b0476574682f76312e31302e31372d737461626c652d32356339623439662f6c696e75782d616d6436342f676f312e3138cdc58365746842c684736e61700180b840565201cf682f2e62fc03173098e39e72ca49cb28beef29e956b480763150565be0471c39bccc8ffb4d8684e658034c3e7a93d315f57a42e82506bb29a973273e     `)
    );

    const decodedPacket = helloPacketEncoderDecoder.decode({
      input: helloPacket.slice(1),
    });

    const packet = helloPacketEncoderDecoder.encode({ input: decodedPacket });
    expect(packet.toString('hex')).toBe(helloPacket.toString('hex'));
  });
});
