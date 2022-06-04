import { cleanString } from '../utils';
import { getBufferFromHex } from '../utils/getBufferFromHex';
import { Packet, PacketTypes } from './Packet';

describe('Packets', () => {
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

    const decodedPacket = new Packet().decodeHello({ input: helloPacket });
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

    const decodedPacket = new Packet().decodeHello({ input: helloPacket });
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

  it('should correctly decode a ping packet', () => {
    // from https://eips.ethereum.org/EIPS/eip-8
    const pingPacket = getBufferFromHex(
      cleanString(`
      e9614ccfd9fc3e74360018522d30e1419a143407ffcce748de3e22116b7e8dc92ff74788c0b6663a
      aa3d67d641936511c8f8d6ad8698b820a7cf9e1be7155e9a241f556658c55428ec0563514365799a
      4be2be5a685a80971ddcfa80cb422cdd0101ec04cb847f000001820cfa8215a8d790000000000000
      000000000000000000018208ae820d058443b9a3550102
      `)
    );

    const decodedPacket = new Packet().decodeWirePacket({ input: pingPacket });
    if (!('version' in decodedPacket)) {
      throw new Error('Ping packet parsed incorrectly');
    }
    expect(decodedPacket.packetType).toBe(PacketTypes.PING);
    expect(decodedPacket.version).toBe(4);
    expect(decodedPacket.expiration).toBe(1136239445);
    expect(decodedPacket.fromIp).toBe('127.0.0.1');
    expect(decodedPacket.fromTcpPort).toBe('5544');
    expect(decodedPacket.fromUdpPort).toBe('3322');

    //    expect(decodedPacket.toIp).toBe('00.00.00.00');
    expect(decodedPacket.toUdpPort).toBe('2222');
    expect(decodedPacket.toTcpPort).toBe('3333');
  });

  it('should correctly encode a ping packet', () => {
    // https://github.com/ethereum/devp2p/blob/master/discv4.md#ping-packet-0x01
    const packet = new Packet().encodePing({
      version: 4,
      fromIp: '127.0.0.1',
      fromTcpPort: '5544',
      fromUdpPort: '3322',
      toIp: '::1',
      toUdpPort: '2222',
      toTcpPort: '3333',
      expiration: 1136239445,
      sequence: [0x1, 0x2],
    });

    expect(packet).toBe(
      '0xec04cb847f000001820cfa8215a8d790000000000000000000000000000000018208ae820d058443b9a3550102'
    );
  });

  it.skip('should correctly decode a ping packet with random data', () => {
    // from https://eips.ethereum.org/EIPS/eip-8
    const pingPacket = getBufferFromHex(
      cleanString(`
      577be4349c4dd26768081f58de4c6f375a7a22f3f7adda654d1428637412c3d7fe917cadc56d4e5e
      7ffae1dbe3efffb9849feb71b262de37977e7c7a44e677295680e9e38ab26bee2fcbae207fba3ff3
      d74069a50b902a82c9903ed37cc993c50001f83e82022bd79020010db83c4d001500000000abcdef
      12820cfa8215a8d79020010db885a308d313198a2e037073488208ae82823a8443b9a355c5010203
      040531b9019afde696e582a78fa8d95ea13ce3297d4afb8ba6433e4154caa5ac6431af1b80ba7602
      3fa4090c408f6b4bc3701562c031041d4702971d102c9ab7fa5eed4cd6bab8f7af956f7d565ee191
      7084a95398b6a21eac920fe3dd1345ec0a7ef39367ee69ddf092cbfe5b93e5e568ebc491983c09c7
      6d922dc3      
      `)
    );

    const decodedPacket = new Packet().decodeWirePacket({ input: pingPacket });
    if (!('version' in decodedPacket)) {
      throw new Error('Ping packet parsed incorrectly');
    }
    expect(decodedPacket.packetType).toBe(PacketTypes.PING);
    expect(decodedPacket.version).toBe(555);
  });

  it('should correctly decode a pong packet', () => {
    // from https://eips.ethereum.org/EIPS/eip-8
    const pongPacket = getBufferFromHex(
      cleanString(`
      09b2428d83348d27cdf7064ad9024f526cebc19e4958f0fdad87c15eb598dd61d08423e0bf66b206
      9869e1724125f820d851c136684082774f870e614d95a2855d000f05d1648b2d5945470bc187c2d2
      216fbe870f43ed0909009882e176a46b0102f846d79020010db885a308d313198a2e037073488208
      ae82823aa0fbc914b16819237dcd8801d7e53f69e9719adecb3cc0e790c57e91ca4461c9548443b9
      a355c6010203c2040506a0c969a58f6f9095004c0177a6b47f451530cab38966a25cca5cb58f0555
      42124e    
  `)
    );

    const decodedPacket = new Packet().decodeWirePacket({ input: pongPacket });
    if (!('to' in decodedPacket)) {
      throw new Error('Ping packet parsed incorrectly');
    }

    expect(decodedPacket.packetType).toBe(PacketTypes.PONG);
    expect(decodedPacket.to).toBe('0x20010db885a308d313198a2e03707348');
  });

  it('should correctly decode a findnode packet', () => {
    // from https://eips.ethereum.org/EIPS/eip-8
    const findNodePacket = getBufferFromHex(
      cleanString(`
      c7c44041b9f7c7e41934417ebac9a8e1a4c6298f74553f2fcfdcae6ed6fe53163eb3d2b52e39fe91
831b8a927bf4fc222c3902202027e5e9eb812195f95d20061ef5cd31d502e47ecb61183f74a504fe
04c51e73df81f25c4d506b26db4517490103f84eb840ca634cae0d49acb401d8a4c6b6fe8c55b70d
115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be0081290476
7bf5ccd1fc7f8443b9a35582999983999999280dc62cc8255c73471e0a61da0c89acdc0e035e260a
dd7fc0c04ad9ebf3919644c91cb247affc82b69bd2ca235c71eab8e49737c937a2c396   
  `)
    );

    const decodedPacket = new Packet().decodeWirePacket({
      input: findNodePacket,
    });
    if (!('target' in decodedPacket)) {
      throw new Error('Ping packet parsed incorrectly');
    }

    expect(decodedPacket.packetType).toBe(PacketTypes.FIND_NODE);
    expect(decodedPacket.target).toBe(
      '0xca634cae0d49acb401d8a4c6b6fe8c55b70d115bf400769cc1400f3258cd31387574077f301b421bc84df7266c44e9e6d569fc56be00812904767bf5ccd1fc7f'
    );
  });

  it('should correctly decode a neighbours packet', () => {
    // from https://eips.ethereum.org/EIPS/eip-8
    const neighboursPacket = getBufferFromHex(
      cleanString(`
      c679fc8fe0b8b12f06577f2e802d34f6fa257e6137a995f6f4cbfc9ee50ed3710faf6e66f932c4c8
      d81d64343f429651328758b47d3dbc02c4042f0fff6946a50f4a49037a72bb550f3a7872363a83e1
      b9ee6469856c24eb4ef80b7535bcf99c0004f9015bf90150f84d846321163782115c82115db84031
      55e1427f85f10a5c9a7755877748041af1bcd8d474ec065eb33df57a97babf54bfd2103575fa8291
      15d224c523596b401065a97f74010610fce76382c0bf32f84984010203040101b840312c55512422
      cf9b8a4097e9a6ad79402e87a15ae909a4bfefa22398f03d20951933beea1e4dfa6f968212385e82
      9f04c2d314fc2d4e255e0d3bc08792b069dbf8599020010db83c4d001500000000abcdef12820d05
      820d05b84038643200b172dcfef857492156971f0e6aa2c538d8b74010f8e140811d53b98c765dd2
      d96126051913f44582e8c199ad7c6d6819e9a56483f637feaac9448aacf8599020010db885a308d3
      13198a2e037073488203e78203e8b8408dcab8618c3253b558d459da53bd8fa68935a719aff8b811
      197101a4b2b47dd2d47295286fc00cc081bb542d760717d1bdd6bec2c37cd72eca367d6dd3b9df73
      8443b9a355010203b525a138aa34383fec3d2719a0  
  `)
    );

    const decodedPacket = new Packet().decodeWirePacket({
      input: neighboursPacket,
    });
    if (!('nodes' in decodedPacket)) {
      throw new Error('Ping packet parsed incorrectly');
    }

    expect(decodedPacket.packetType).toBe(PacketTypes.NEIGHBORS);
    expect(decodedPacket.nodes.length).toBe(4);
    expect(decodedPacket.nodes[0].ip).toBeTruthy();
  });

  it('should correctly create an hello packet', () => {
    const helloPacket = getBufferFromHex(
      cleanString(`
      80f88305b0476574682f76312e31302e31372d737461626c652d32356339623439662f6c696e75782d616d6436342f676f312e3138cdc58365746842c684736e61700180b840565201cf682f2e62fc03173098e39e72ca49cb28beef29e956b480763150565be0471c39bccc8ffb4d8684e658034c3e7a93d315f57a42e82506bb29a973273e     `)
    );

    const decodedPacket = new Packet().decodeHello({ input: helloPacket });

    const packet = new Packet().encodeHello({ packet: decodedPacket });
    expect(packet.toString('hex')).toBe(helloPacket.toString('hex'));
  });
});
