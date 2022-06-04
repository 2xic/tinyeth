import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { Packet, PacketTypes } from '../Packet';
import { getRandomGethPeer } from '../utils/getRandomPeer';
import { PacketEncapsulation } from './PacketEncapsulation';
import { PingPacket, PingPacketEncodeDecode } from './PingPacketEncodeDecode';
import dayjs from 'dayjs';

describe('Wire', () => {
  let container: Container;
  beforeEach(() => {
    container = new UnitTestContainer().create({
      privateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      ephemeralPrivateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
    });
  });
  it('should encode a packet correctly', async () => {
    const pingPacketEncoder = container.get(PingPacketEncodeDecode);
    const encapsulateMEssage = container.get(PacketEncapsulation);
    const packetEncodeDecode = new Packet();

    const options = getRandomGethPeer();
    expect(isNaN(options.port)).toBe(false);

    const inputPacket = {
      version: 4,
      expiration: dayjs().add(1, 'day').unix(),
      fromIp: '0.0.0.0',
      fromUdpPort: null,
      fromTcpPort: null,

      toIp: options.address,
      toUdpPort: options.port.toString(),
      toTcpPort: '0',
    };
    const message = pingPacketEncoder.encode({
      input: inputPacket,
    });
    const pingMessage = encapsulateMEssage.encapsulate({
      message: getBufferFromHex(message),
    });

    const data = packetEncodeDecode.decodeWirePacket({ input: pingMessage });
    expect(data).toBeTruthy();

    if (data.packetType === PacketTypes.PING) {
      const packet = data as PingPacket;
      expect(inputPacket.version).toBe(packet.version);
      expect(inputPacket.fromIp).toBe(packet.fromIp);
      expect(inputPacket.toIp).toBe(packet.toIp);
      expect(inputPacket.fromTcpPort).toBe(null);
      expect(inputPacket.fromUdpPort).toBe(null);

      // TODO : double check the rlp
      // expect(isNaN(Number(packet.toUdpPort))).toBe(false);
      //expect(inputPacket.toUdpPort).toBe(packet.toUdpPort);

      expect(inputPacket.toTcpPort).toBe(packet.toTcpPort);
      expect(inputPacket.expiration).toBe(packet.expiration);
    } else {
      throw new Error('Error');
    }
  });
});
