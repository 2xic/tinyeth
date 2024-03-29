import BigNumber from 'bignumber.js';
import { getClassFromTestContainer } from '../../container/getClassFromTestContainer';
import { Address } from '../Address';
import { Wei } from '../eth-units/Wei';
import { getBufferFromHex } from '../../utils';
import { ExposedEvm } from '../ExposedEvm';
import { ReplayContractTestUtils } from './ReplayContractTestUtils';
import path from 'path';
import { MnemonicParser } from '../MnemonicParser';

describe('EvmReplay', () => {
  const gasLimit = new BigNumber(0xffffff);

  it('should correctly replay a baisc contract', async () => {
    const contract = getBufferFromHex(
      '608060405234801561001057600080fd5b50600436106100cf5760003560e01c806354fd4d501161008c57806395d89b411161006657806395d89b4114610195578063a457c2d71461019d578063a9059cbb146101b0578063dd62ed3e146101c357600080fd5b806354fd4d501461015c57806370a08231146101645780637afa1eed1461018d57600080fd5b806306fdde03146100d4578063095ea7b3146100f257806318160ddd1461011557806323b872dd14610127578063313ce5671461013a5780633950935114610149575b600080fd5b6100dc6101fc565b6040516100e9919061083d565b60405180910390f35b610105610100366004610813565b61028e565b60405190151581526020016100e9565b6002545b6040519081526020016100e9565b6101056101353660046107d7565b6102a4565b604051601281526020016100e9565b610105610157366004610813565b610353565b6100dc61038f565b610119610172366004610782565b6001600160a01b031660009081526020819052604090205490565b6100dc61039e565b6100dc6103be565b6101056101ab366004610813565b6103cd565b6101056101be366004610813565b610466565b6101196101d13660046107a4565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b60606003805461020b906108b8565b80601f0160208091040260200160405190810160405280929190818152602001828054610237906108b8565b80156102845780601f1061025957610100808354040283529160200191610284565b820191906000526020600020905b81548152906001019060200180831161026757829003601f168201915b5050505050905090565b600061029b338484610473565b50600192915050565b60006102b1848484610597565b6001600160a01b03841660009081526001602090815260408083203384529091529020548281101561033b5760405162461bcd60e51b815260206004820152602860248201527f45524332303a207472616e7366657220616d6f756e74206578636565647320616044820152676c6c6f77616e636560c01b60648201526084015b60405180910390fd5b6103488533858403610473565b506001949350505050565b3360008181526001602090815260408083206001600160a01b0387168452909152812054909161029b91859061038a908690610892565b610473565b60606005805461020b906108b8565b60606040518060600160405280602f81526020016108f4602f9139905090565b60606004805461020b906108b8565b3360009081526001602090815260408083206001600160a01b03861684529091528120548281101561044f5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b6064820152608401610332565b61045c3385858403610473565b5060019392505050565b600061029b338484610597565b6001600160a01b0383166104d55760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610332565b6001600160a01b0382166105365760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610332565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b0383166105fb5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610332565b6001600160a01b03821661065d5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610332565b6001600160a01b038316600090815260208190526040902054818110156106d55760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610332565b6001600160a01b0380851660009081526020819052604080822085850390559185168152908120805484929061070c908490610892565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161075891815260200190565b60405180910390a350505050565b80356001600160a01b038116811461077d57600080fd5b919050565b60006020828403121561079457600080fd5b61079d82610766565b9392505050565b600080604083850312156107b757600080fd5b6107c083610766565b91506107ce60208401610766565b90509250929050565b6000806000606084860312156107ec57600080fd5b6107f584610766565b925061080360208501610766565b9150604084013590509250925092565b6000806040838503121561082657600080fd5b61082f83610766565b946020939093013593505050565b600060208083528351808285015260005b8181101561086a5785810183015185820160400152820161084e565b8181111561087c576000604083870101525b50601f01601f1916929092016040019392505050565b600082198211156108b357634e487b7160e01b600052601160045260246000fd5b500190565b600181811c908216806108cc57607f821691505b602082108114156108ed57634e487b7160e01b600052602260045260246000fd5b5091905056fe68747470733a2f2f766974746f6d696e61636f72692e6769746875622e696f2f65726332302d67656e657261746f72a2646970667358221220edd5a4b7834c19d7e6f1b103e53541ebc11edfa33c480a7fcfc23578c8f72a5564736f6c63430008070033'
    );
    const evm = getClassFromTestContainer(ExposedEvm).boot({
      program: contract,
      context: {
        nonce: 1,
        gasLimit,
        sender: new Address('0xbe862ad9abfe6f22bcb087716c7d89a26051f74c'),
        value: new Wei(new BigNumber(0)),
        receiver: new Address(),
        data: getBufferFromHex(
          '0x095ea7b3000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c8ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        ),
      },
    });
    await getClassFromTestContainer(ReplayContractTestUtils).replayFile(
      evm,
      path.join(__dirname, 'example-1.json'),
      {}
    );
  });

  it('should correctly replay the second replay file minor contract', async () => {
    const contract = new MnemonicParser().parse({
      script: `
        PUSH32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        PUSH1 0x00
        MSTORE	
        PUSH1 0x20
        PUSH1 0x00	
        RETURN
      `,
    });
    const evm = getClassFromTestContainer(ExposedEvm).boot({
      program: contract,
      context: {
        nonce: 1,
        gasLimit,
        sender: new Address('0xbe862ad9abfe6f22bcb087716c7d89a26051f74c'),
        value: new Wei(new BigNumber(0)),
        receiver: new Address(),
        data: Buffer.alloc(0),
      },
    });
    await getClassFromTestContainer(ReplayContractTestUtils).replayFile(
      evm,
      path.join(__dirname, 'example-2-deployment.json'),
      {}
    );
    await evm.execute();
    expect(evm.gasCost()).toBe(21018);
  });

  it('should correctly replay the main second replay file', async () => {
    const contract = new MnemonicParser().parse({
      script: `
      
      // Creates a constructor that creates a contract with 32 FF as code
      PUSH32 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
      PUSH1 0
      MSTORE
      PUSH32 0xFF60005260206000F30000000000000000000000000000000000000000000000
      PUSH1 32
      MSTORE
      
      // Create the contract with the constructor code above
      PUSH1 41
      PUSH1 0
      PUSH1 0
      CREATE // Puts the new contract address on the stack
      
      // The address is on the stack, we can query the size
      EXTCODESIZE 
      `,
    });
    const evm = getClassFromTestContainer(ExposedEvm).boot({
      program: contract,
      context: {
        nonce: 1,
        gasLimit,
        sender: new Address('0xbe862ad9abfe6f22bcb087716c7d89a26051f74c'),
        value: new Wei(new BigNumber(0)),
        receiver: new Address(),
        data: Buffer.alloc(0),
      },
    });
    await getClassFromTestContainer(ReplayContractTestUtils).replayFile(
      evm,
      path.join(__dirname, 'example-2.json'),
      {}
    );
  });

  it.skip('should correctly replay the third replay file (STATICCALL)', async () => {
    const contract = new MnemonicParser().parse({
      script: `
        // Creates a constructor that creates a contract wich returns 32 FF
        PUSH32 0x7F7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
        PUSH1 0
        MSTORE
        PUSH32 0xFF6000527FFF60005260206000F3000000000000000000000000000000000000
        PUSH1 32
        MSTORE
        PUSH32 0x000000000060205260296000F300000000000000000000000000000000000000
        PUSH1 64
        MSTORE

        // Create the contract with the constructor code above
        PUSH1 77
        PUSH1 0
        PUSH1 0
        CREATE // Puts the new contract address on the stack

        // Call the deployed contract
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        DUP5
        PUSH4 0xFFFFFFFF
        STATICCALL

        // Clear the stack
        POP
        POP

        // Clear the memory
        PUSH1 0
        PUSH1 0
        MSTORE
        PUSH1 0
        PUSH1 32
        MSTORE
        PUSH1 0
        PUSH1 64
        MSTORE

        // Example 1
        PUSH1 32
        PUSH1 0
        PUSH1 0
        RETURNDATACOPY

        // Example 2
        PUSH1 1
        PUSH1 31
        PUSH1 32
        RETURNDATACOPY
      `,
    });
    const evm = getClassFromTestContainer(ExposedEvm).boot({
      program: contract,
      context: {
        nonce: 1,
        gasLimit,
        sender: new Address('0xbe862ad9abfe6f22bcb087716c7d89a26051f74c'),
        value: new Wei(new BigNumber(0)),
        receiver: new Address(),
        data: Buffer.alloc(0),
      },
    });
    await getClassFromTestContainer(ReplayContractTestUtils).replayFile(
      evm,
      path.join(__dirname, 'example-3.json'),
      {}
    );
  });

  it.skip('should correctly replay the forth replay file (DELEGATECALL)', async () => {
    const contract = new MnemonicParser().parse({
      script: `
        // Create a contract that creates an exception if first slot of storage is 0
        PUSH17 0x67600054600757FE5B60005260086018F3
        PUSH1 0
        MSTORE
        PUSH1 17
        PUSH1 15
        PUSH1 0
        CREATE
        
        // Call with storage slot 0 = 0, returns 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        DUP5
        PUSH2 0xFFFF
        DELEGATECALL
        
        // Set first slot in the current contract
        PUSH1 1
        PUSH1 0
        SSTORE
        
        // Call with storage slot 0 != 0, returns 1
        PUSH1 0
        PUSH1 0
        PUSH1 32
        PUSH1 0
        DUP6
        PUSH2 0xFFFF
        DELEGATECALL
      `,
    });
    const evm = getClassFromTestContainer(ExposedEvm).boot({
      program: contract,
      context: {
        nonce: 1,
        gasLimit,
        sender: new Address('0xbe862ad9abfe6f22bcb087716c7d89a26051f74c'),
        value: new Wei(new BigNumber(0)),
        receiver: new Address(),
        data: Buffer.alloc(0),
      },
    });
    await getClassFromTestContainer(ReplayContractTestUtils).replayFile(
      evm,
      path.join(__dirname, 'example-4.json'),
      {}
    );
  });

  it.skip('should correctly replay the fifth replay file (CALLCODE)', async () => {
    const contract = new MnemonicParser().parse({
      script: `
        // Create a contract that creates an exception if first slot of storage is 0
        PUSH17 0x67600054600757FE5B60005260086018F3
        PUSH1 0
        MSTORE
        PUSH1 17
        PUSH1 15
        PUSH1 0
        CREATE
        
        // Call with storage slot 0 = 0, returns 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        PUSH1 0
        DUP6
        PUSH2 0xFFFF
        CALLCODE
        
        // Set first slot in the current contract
        PUSH1 1
        PUSH1 0
        SSTORE
        
        // Call with storage slot 0 != 0, returns 1
        PUSH1 0
        PUSH1 0
        PUSH1 32
        PUSH1 0
        PUSH1 0
        DUP7
        PUSH2 0xFFFF
        CALLCODE
      `,
    });
    const evm = getClassFromTestContainer(ExposedEvm).boot({
      program: contract,
      context: {
        nonce: 1,
        gasLimit,
        sender: new Address('0xbe862ad9abfe6f22bcb087716c7d89a26051f74c'),
        value: new Wei(new BigNumber(0)),
        receiver: new Address(),
        data: Buffer.alloc(0),
      },
    });
    await getClassFromTestContainer(ReplayContractTestUtils).replayFile(
      evm,
      path.join(__dirname, 'example-5.json'),
      {}
    );
  });
});
