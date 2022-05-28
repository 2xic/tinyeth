import { KeyPair } from '../signatures/KeyPair';
import { getBufferFromHex } from './getBufferFromHex';
import { parseEncode } from './parseEnode';
import { MessageType, Peer } from './Peer';
import { MockSocket } from './socket/MockSocket';

describe('Peer', () => {
  it('should be able to do an handshake', async () => {
    const socket = new MockSocket();
    const node = new Peer(
      new KeyPair(
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a'
      ),
      new KeyPair(
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a'
      ),
      socket
    );
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
        '013e0482038930f72c7ce6f8e20b51541503c11be0524fbde8f47fff35d2383bad440d4dc32bb18a31b96d240df6024c297b263ec6fd6dd6bf3215bc7aeaea96fe35d3e3fd785e29f86a35bc630c12a5356667289218a91a90ea95e1fd987122693603d50e9c03eb906356a986fdc97633877042c0963cd378c2f1ec58f871147bc61cdb8727a9ff3573f8f6888a562db2be7de5899216b9e5d2df1ab585ef7c2604a51a9e9b46da71feb2efc76ede342569ed0e4a9a620a5319ba610782e3e670e91e30b1e904812444f8f765cfc68616eee221bd01f67cca691928fd37c5fa3b7c00255ce2444badb3106dcc8921d1770f1b3a525aeababffed87f330237c14355b80a9c2b6de09ce1c7c2175602e1fc10e61a256dda0c052662cd8ff762822b4a734548d1dab7a4271761c9aba6a32339b9bf836eaeaec249c49ed969c473'
      )
    );
    await socket.emit(
      'data',
      getBufferFromHex(
        '87c089a8142856a3db8274629e18bbbc403649d95c9cd8109f8b8220dba47b0dde5069b3b893153b76255f86b0a6f7eed6a37208220ef6e0b50298a5ed652aac3534566875c1ea95fdbc755671a75f4a7e57ee8170f660c7ae6f93542c3b287b0a2372ca504672cd8ecbcb9da5cfdf7106ede74d67978b5454db6d3bd2267750a452e2330af80dfadd45f1370b193a6a32229c60c3559cb7524df5e35e0fa81ea4c70753829c513b3b9c9728ce085417dc06e2d87442b384a5ddc874dfd9e7c8'
      )
    );
  });
});
