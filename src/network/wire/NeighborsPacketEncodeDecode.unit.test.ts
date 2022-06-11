import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { RlpDecoder } from '../../rlp/RlpDecoder';
import { NeighborsPacketEncodeDecode } from './NeighborsPacketEncodeDecode';

describe('NeighborsPacketEncodeDecode', () => {
  let container: Container;
  beforeEach(() => {
    container = new UnitTestContainer().create({
      privateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
      ephemeralPrivateKey:
        'b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291',
    });
  });

  it('should correctly parse an neighbor packet', () => {
    const message =
      'f90144f9013cf84d84534db71582765f82765fb84023fe474f4885041cc07d8a7e3299349390bdcdd988a85ad5f00ac4f1252d5e64e63880b77e512aa2c7ff7520893591fc8d5aac7158f3771860739c9e9e685a2cf84d84a763c23682765f82765fb8403d62ca9c89db13500bf28b2ae021da253662974073c25ba1f821e977f98a3ae3bc4d41532a2b992e102dd26bbc88c88bdc56891da9b844303659c39054ef879ff84d843213528882765f82765fb8407d763616fee3ca6e0b51094f8243135c7399d5fb54da5f4719752a02708ca604e2dc0fe5e22e7b56d701eca9e1d26f846eb30fac8348bb7471bdd2971e296a62f84d8452874c1582765f82765fb84053923a7059e7b79ed3ff49762d9a91cb5ad82e4e174d4357fd095510bf505dfae0221ab2c06751b74c45a1d298855e362b9773430587a9c3df4e9ace093da8368462a49895';
    const decoded = container.get(RlpDecoder).decode({ input: message });
    if (!Array.isArray(decoded)) {
      throw new Error('');
    }
    const nodes = container.get(NeighborsPacketEncodeDecode).decode({
      input: decoded,
    });
    expect(nodes.nodes).toHaveLength(4);
    expect(nodes.nodes[0].ip).toBe('83.77.183.21');
    expect(nodes.nodes[0].tcpPort.toString()).toBe('30303');
    expect(nodes.nodes[0].udpPort.toString()).toBe('30303');
    expect(nodes.nodes[0].publicKey.toString('hex')).toBe(
      '23fe474f4885041cc07d8a7e3299349390bdcdd988a85ad5f00ac4f1252d5e64e63880b77e512aa2c7ff7520893591fc8d5aac7158f3771860739c9e9e685a2c'
    );

    expect(nodes.nodes[1].ip).toBe('167.99.194.54');
    expect(nodes.nodes[1].tcpPort.toString()).toBe('30303');
    expect(nodes.nodes[1].udpPort.toString()).toBe('30303');
    expect(nodes.nodes[1].publicKey.toString('hex')).toBe(
      '3d62ca9c89db13500bf28b2ae021da253662974073c25ba1f821e977f98a3ae3bc4d41532a2b992e102dd26bbc88c88bdc56891da9b844303659c39054ef879f'
    );

    expect(nodes.nodes[2].ip).toBe('50.19.82.136');
    expect(nodes.nodes[2].tcpPort.toString()).toBe('30303');
    expect(nodes.nodes[2].udpPort.toString()).toBe('30303');
    expect(nodes.nodes[2].publicKey.toString('hex')).toBe(
      '7d763616fee3ca6e0b51094f8243135c7399d5fb54da5f4719752a02708ca604e2dc0fe5e22e7b56d701eca9e1d26f846eb30fac8348bb7471bdd2971e296a62'
    );
  });
});
