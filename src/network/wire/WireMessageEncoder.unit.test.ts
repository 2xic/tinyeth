import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { PingPacketEncodeDecode } from './PingPacketEncodeDecode';

describe('WireMessageEncoder', () => {
  let container: Container;
  beforeEach(() => {
    container = new UnitTestContainer().create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      deterministicRandomness: true,
    });
  });

  it('should correctly encode a ping packet', () => {
    // https://github.com/ethereum/devp2p/blob/master/discv4.md#ping-packet-0x01
    const packet = container.get(PingPacketEncodeDecode).encode({
      input: {
        version: 4,
        fromIp: '127.0.0.1',
        fromTcpPort: '5544',
        fromUdpPort: '3322',
        toIp: '::1',
        toUdpPort: '2222',
        toTcpPort: '3333',
        expiration: 1136239445,
        sequence: [0x1, 0x2],
      },
    });

    expect(packet).toBe(
      '0xec04cb847f000001820cfa8215a8d790000000000000000000000000000000018208ae820d058443b9a3550102'
    );
  });
});
