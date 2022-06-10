import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { getBufferFromHex } from '../../utils/getBufferFromHex';
import { Packet, PacketTypes } from '../Packet';
import { getRandomGethPeer } from '../utils/getRandomPeer';
import { PacketEncapsulation } from './PacketEncapsulation';
import { PingPacket, PingPacketEncodeDecode } from './PingPacketEncodeDecode';
import dayjs from 'dayjs';
import { FindNodePacketEncodeDecode } from './FindNodePacketEncodeDecode';

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
      packetType: Buffer.from([0x1]),
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
      expect(inputPacket.toUdpPort).toBe(packet.toUdpPort);
      expect(inputPacket.toTcpPort).toBe(packet.toTcpPort);
      expect(inputPacket.expiration).toBe(packet.expiration);
    } else {
      throw new Error('Error');
    }
  });

  it('should encode two packets the same', () => {
    const pingPacketEncoder = container.get(PingPacketEncodeDecode);
    const encapsulateMEssage = container.get(PacketEncapsulation);

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
      packetType: Buffer.from([0x1]),
    });
    const pingMessage2 = encapsulateMEssage.encapsulate({
      message: getBufferFromHex(message),
      packetType: Buffer.from([0x1]),
    });

    expect(pingMessage.toString('hex')).toBe(pingMessage2.toString('hex'));
  });

  it('should correctly encode a ping packet', () => {
    const pingPacketEncoder = container.get(PingPacketEncodeDecode);
    const encapsulateMEssage = container.get(PacketEncapsulation);
    const inputPacket = {
      version: 4,
      expiration: 1654438346,
      fromIp: '0.0.0.0',
      fromUdpPort: null,
      fromTcpPort: null,

      toIp: '127.0.0.1',
      toUdpPort: '2222',
      toTcpPort: '2222',
    };
    const message = pingPacketEncoder.encode({
      input: inputPacket,
    });
    const pingMessage = encapsulateMEssage.encapsulate({
      message: getBufferFromHex(message),
      packetType: Buffer.from([0x1]),
    });
    expect(pingMessage.toString('hex')).toBe(
      'acf3ea381cd48e509b1c88fa78fa44c7567dcc617ddce044636cc017c06f3c0e78f383ceebf440105a16506d05eb87588693caf9347b8ecb3a428189fb933113420f3ab78f930550a56cf0d873d3cae2fd937bfeae6000cb322e4324a89c3ca70101da04c784000000008080cb847f0000018208ae8208ae84629cb9ca'
    );
  });

  it('should correctly encode a find node packet', () => {
    const encapsulateMEssage = container.get(PacketEncapsulation);
    const packet = new FindNodePacketEncodeDecode().encode({
      input: {
        target:
          '04ca634cae0d49acb401d8a4c6b6fe8c55b70d115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be00812904767bf5ccd1fc7f',
        expiration: 1654441902,
      },
    });
    const encapsulated = encapsulateMEssage.encapsulate({
      message: getBufferFromHex(packet),
      packetType: Buffer.from([0x3]),
    });
    expect(encapsulated.toString('hex')).toBe(
      '533ed3f087f6cbc54793a92cb20643e7ce9b98492a7b50b01ef74e0d0963daba3b62b4e0bca6231dee5f1fd1314d13c5da63a6047b44d3ed66223c85c218df0e0c0ef1133bebad6d8d1d44e1de9f495dca9bc7a9f7aff73f637aa5f3fdb74d3c0003f848b84104ca634cae0d49acb401d8a4c6b6fe8c55b70d115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be00812904767bf5ccd1fc7f84629cc7ae'
    );
  });
});
