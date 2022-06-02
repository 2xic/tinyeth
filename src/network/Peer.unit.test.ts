import { getBufferFromHex } from '../utils/getBufferFromHex';
import { parseEncode } from './parseEnode';
import { Peer } from './Peer';
import { MockSocket } from './socket/MockSocket';
import { MockNonceGenerator } from './nonce-generator/MockNonceGenerator';
import { UnitTestContainer } from '../container/UnitTestContainer';
import { NonceGenerator } from './nonce-generator/NonceGenerator';
import { Container } from 'inversify';
import { AbstractSocket } from './socket/AbstractSocket';
import { ConstructAuthMessage } from './auth/ConstructAuthMessage';
import { GetRandomBytesInteractor } from './nonce-generator/GetRandomBytesInteractor';
import { convertToObject } from 'typescript';
import { KeyPath } from 'ecies-geth';
import { KeyPair } from '../signatures';
import { MessageType } from './CommunicationState';

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
  const getContainer = () => {
    return new UnitTestContainer().create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      deterministicRandomness: true,
    });
  };

  const getBufferENcoding = async (pubkey?: string) => {
    const containerx = getContainer();
    const interactor = containerx.get(NonceGenerator) as MockNonceGenerator;
    const fakeInteractor = containerx
      .get(GetRandomBytesInteractor)
      .getRandomBytes({ length: 5 });
    expect(fakeInteractor.toString('hex')).toBe('00'.repeat(5));

    interactor.setNonces([
      Buffer.from(
        '6ff3b775f46adc7f01239f7d939bf5323fb201fc049b7af1e5286f48bc712e35',
        'hex'
      ),
    ]);
    const socket = containerx.get(AbstractSocket) as MockSocket;
    const node = containerx.get(Peer);
    await node.connect(
      parseEncode(
        `enode://${
          pubkey ||
          '865a63255b3bb68023b6bffd5095118fcc13e79dcf014fe4e47e065c350c7cc72af2e53eff895f11ba1bbb6a2b33271c1116ee870f266618eadfc2e78aa7349c'
        }@35.227.75.9:29888`
      )
    );
    await node.sendMessage({
      type: MessageType.AUTH_EIP_8,
    });

    return socket.writtenData[0];
  };
  it('should be deterministic', async () => {
    expect((await getBufferENcoding()).toString('hex')).toBe(
      (await getBufferENcoding()).toString('hex')
    );
  });
});
