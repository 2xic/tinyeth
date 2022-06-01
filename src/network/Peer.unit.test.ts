import { getBufferFromHex } from '../utils/getBufferFromHex';
import { parseEncode } from './parseEnode';
import { MessageType, Peer } from './Peer';
import { MockSocket } from './socket/MockSocket';
import { MockNonceGenerator } from './nonce-generator/MockNonceGenerator';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { NonceGenerator } from './nonce-generator/NonceGenerator';
import { Container } from 'inversify';
import { AbstractSocket } from './socket/AbstractSocket';

describe('Peer', () => {
  let peer: Peer;
  let container: Container;
  beforeEach(() => {
    container = new UnitTestContainer().create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      deterministicRandomness: true,
    });
    peer = container.get(Peer);
  });
  it('should be able to do an handshake with local geth', async () => {
    const interactor = container.get(NonceGenerator) as MockNonceGenerator;
    interactor.setNonces([
      Buffer.from(
        'c98e21c6b772bcb272fc207cbad36320d65b458ee76112813fc0d362b65379f3',
        'hex'
      ),
    ]);
    const socket = container.get(AbstractSocket) as MockSocket;

    const node = peer;
    expect(node.nodePublicKey).toBe('');
    await node.connect(
      parseEncode(
        'enode://565201cf682f2e62fc03173098e39e72ca49cb28beef29e956b480763150565be0471c39bccc8ffb4d8684e658034c3e7a93d315f57a42e82506bb29a973273e@localhost:30303'
      )
    );
    await node.sendMessage({
      type: MessageType.AUTH_EIP_8,
    });
    await socket.emit(
      'data',
      getBufferFromHex(
        '0158048144a797628de4a135fcb89a65ce58a566f9de5ba76be7ebd507b86ccaba006a11b3669e5a9faa60bb3f55d7e8703c4101a1756e62c04f7fcb7b5fa63e0b4f02629a6a31e3057979cf6e6abc0a90d1545f4565fffde164a80cf0f03e51a0127bf8a0a1d40c56ee237f2ab601316124362503629134d10d04e21b0b30caa811879978d6dc40ac7fca2c9eaad0808af284bfac1de8541eb9ab9d9247a2f7b94a016fa6f6a8bfad983b26ca0664701c1cc980c76c298b28a606a65702c5a783b4447e27c1fc566a4dac4533767c493a97d170fa50ee2f75d74d3462955480974bb00be28c7dadb21b31b4a5d8fb33850976b7d8cf1b2f58d3e0adb9b5928a0ef09917354c60b4ea441c2ad8caefb3a271df4ef35da483d355b8647cd1408398cf7b837936f96255a133f23cdfc0369d5c2f1454e559f48d04c72e903b5afc435cb9dd810fe386bccd3cd8a3be32a6e0768b917fdbfc2ff327'
      )
    );
    await socket.emit(
      'data',
      getBufferFromHex(
        '2802decd078d1c658c65f9469c5877cac14c6f26a894b35bfecc4ce349c52d879fee2fa9a4c546580ceb0e0df14a6f9869eeefa375dd2ad2db1d74dc6ff5977b8523f499c650310ea67dab2b5c55f1929ac12735f5b6895f9641c9aafac51e77157f863a7f499399d2a966f1957dcc43d43aece4a6a9d7692da7d6c7d88d3d70745c7c5a2b64b5a67bfadeb93a8a5c90780f35db090d4b25e17ddcb0a72842304877a5c64bad6f1f7d8978a5cc9ad20a658f893b658961862bc383744e9e6384'
      )
    );
    await node.messageQueue.process();
    await node.messageQueue.process();
  });

  it('should be able to do an handshake with external nodes', async () => {
    const interactor = container.get(NonceGenerator) as MockNonceGenerator;
    interactor.setNonces([
      Buffer.from(
        '6ff3b775f46adc7f01239f7d939bf5323fb201fc049b7af1e5286f48bc712e35',
        'hex'
      ),
    ]);
    const socket = container.get(AbstractSocket) as MockSocket;

    const node = peer;
    await node.connect(
      parseEncode(
        'enode://865a63255b3bb68023b6bffd5095118fcc13e79dcf014fe4e47e065c350c7cc72af2e53eff895f11ba1bbb6a2b33271c1116ee870f266618eadfc2e78aa7349c@35.227.75.9:29888'
      )
    );
    await node.sendMessage({
      type: MessageType.AUTH_EIP_8,
    });
    await socket.emit(
      'data',
      getBufferFromHex(
        '019304c0805ebe8470ff9e85f77355ec3a9253072a3a70a6e5ee532d851793b23b8613fe3022f24f30ef3e1952ab532a100b154dcc7a8486a15f79389a7e0ae207be654c98fdb065a6c67a0d9444b7c4da0ba4a260fd5870f25f2c9d9702b10841f6efcaec0d22dacdba261814f6ccd22b205602e6412ac4c135f10e97d10e3a7f88618fadd8ae714ff5c1bd7fcedb42028da1f8f74d615e34caf612c3aa850ba8ab839bfdcb6a1c3e0e59abb66b541a6127bc4898a8c106a69257f411c491ea5ab7e2b58ab764274865fee87a97effca727e46193539bd5a55246e30eb3b83163a29be27c10dfa3875c24f5f069ba4fb29c38549a085c506ec2492497e59992ca51c70d7be80f4062c2e13e4747345da30e92a0d26e8b04d813c76ff30270a22a9bd8d797580c6d5c75429b92e6deaef556eac073e549ec14d186eb1f22729cb7a73bb3502f5b0c3926e199b4e936509e5cb9a69317130576662dc77454ee2a2b1601701dfff5257f1a1978bba3e3047d2eb6ae80e14a3fbb5a2e4683f167fa0d7b104ea3137f83b809f9d018bd7bde6baa9f959c'
      )
    );
    await socket.emit(
      'data',
      getBufferFromHex(
        'b2f6cba3be2b5b9a4a7286905f61d1a93c3e86862cae744c565be13808ac09817aa5f278114990323f50c0b23c7b2c498552b55ac271cac07b4bfb6015867399a7835567a69387b71d345af03b5ae07a66a3abf4bad4e5169e63497c022562bb219d929f7f09cc2c3443b0c478860b5ddc5471fb6a4cdaeb429439b6341eece7fe31d2268227218bc4ae0463b89cc45df9f33ee619d02a008d8ee61f8a0872d305e8b1e8a9628702022ea998cdea1d922a86b533dd94c25506f916fb2ceb85d594d3ac1c86d277d763e197c33d3beafd82c8fc6e958c805cec980028b18b83cc68dd40e26d10d5590af723d7bb0adc2c'
      )
    );
    await socket.emit(
      'data',
      getBufferFromHex(
        '6b97e201c8802bb8c58f1b213807876f4a5f9a784870d89789e30384c3ef56d7ca7eae01514ba08e3b72d27f0aebfd831681cdb69facbe962dfe9d5b6ca6b259'
      )
    );
    await socket.emit(
      'data',
      getBufferFromHex(
        'c0923d501237609190002e882c8d29ea70b49b7768de6152d53c9a0aec8e548503b7f98f39ad737f9fe2ec0f1ae7eac65ac11b8e880475611194aae49ad4dd77a4b94e7e3448ba491baa64b5020d04110c122eabbbcc273464779cad55b6f29abf94fa5c4c0184383e722da71eaebe950b9dd0ee62a642999652a8e20f1c0908de6e2cf53bafccccc1cb7b98942885412f2b9ff66c237fa8c08ae1ccce2363bb25d0fcd069134b9d39304a572b23dca660203a70666999c1b85bb4289ed538430e36234dc514dc27679cf06f9eecd4ecd5b2a19914c86b4d3ad05c140247a4621368ec134acaae5315aee30e3915ac1496c76038cc3ad1dd4f0f13ba8daee1794ed234d14776d47b7ff09169a5f9f3d4b4db788ae6cb35724a7b350afea0fe9f643965aaa66047632fef1661f8c9528b16bcc9a161013c4b975bd13a675504151f5ab6ce03a812e3f1b073cc1fa22677ea8c660d06208ad205214cb24461f03a278013057ae71cac1cc1ec1465697a79db56db5dd4434d8ec279e92bed80487c1e699eea99edbc1e8d662bc6fa30861879e4c9884256de8c59975e0d72db5c046f465971b679c3198cc3f2d22b5489880bccbd7fbf09c7b88f8aaf9d5ebbd6f452b10645bfbd34343c92b5322fc182e70edef7d59d53191981e51d28301a4943449a43b351ee161121519cc16585261d19c1f0edcafe9edb6d2210433921b60d29fd53add16766ae7cb7def1a561eb9189181295241782d70d3b3f5519cb5a29'
      )
    );
    await socket.emit(
      'data',
      getBufferFromHex(
        'b8fafe311f515aafb52f077b76180e305eb91f6b1597ad843de684b7d3688c9de0c5705f8dc90a9b3875b74887eba5a9fdc7531013817a3b7102eea1987f0f17'
      )
    );
    await node.messageQueue.process();
    await node.messageQueue.process();
    await node.messageQueue.process();
    await node.messageQueue.process();
  });
});
