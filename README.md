# tinyeth

Something like [https://github.com/2xic/Bitcoin-lib-small](https://github.com/2xic/Bitcoin-lib-small), but for Ethereum, tinyeth!

_Just something so I get a better understanding of the core parts of the protocol, don't use this in production_

### Status
- [ ] Add tests from https://github.com/ethereum/tests
  - [x] ABI
  - [x] RLP
  - [ ] Transaction
  - [ ] Trie

- [x] Network support (should be able to fetch a block from another node). The implementation is currently a bit rough (it does not behave like a "nice" node), but it does have the capabilities to become "nice". 
  - Wire/discovery protocol is more or less implemented. It's currently able to find neighbor nodes which is needed for the RLPx. [Discv4](https://github.com/ethereum/devp2p/blob/master/discv4.md#wire-protocol) is currently implemented. I know [discv5](https://github.com/ethereum/devp2p/blob/master/discv5/discv5-theory.md) is out.
  - [RLPx](https://github.com/ethereum/devp2p/blob/master/rlpx.md) is able to do the initial handshake, and send messages. Need some stability improvements, but it's getting there.
  - Capabilities for RPLx. I.e [ETH](https://github.com/ethereum/devp2p/blob/master/caps/eth.md#eth62-2015) is the last step to be able to fetch a block :) 
    - It's now able to fetch a block :')

- [x] Implement encoding and decoding of RLP

  Currently added:
    - Decent encoder support
    - Decent decoder support

- [x] Signing of transactions

  Currently added:
    - Support for creating a key pair added, signing, and verification
    - Support for creating a raw transactions
    - Support for signing a raw transaction
    - (todo) Implement EIP 2718
    - (todo) Implement EIP 1559
    - (todo) Add some tracking of the nonce to make things user friendly.

- [ ] Implement the EVM (i.e should be able to run a simple contract based on the bytecode / mnemonic)

  Currently supports:
    - Most opcodes are more or less implemented (still some gas cost missing)
      - In other words, it's able to run most contracts.
    - Converts mnemonic into bytecode to make it easy to debug.
    - Support for the ABI, should be possible to encode calldata for most structs.
    - (todo) improved handling of the EVMs datatypes. Operations that are using uint256 for instance should have a modulo operation to make sure our rounding is correct.
    - (wip) gas cost/refund computation -> let's you see how much gas is used when executing contract.
        - There are only a few dynamic opcodes missing here.

- [ ] Data structures
    - Blocks
        - https://github.com/ethereum/go-ethereum/blob/4766b1107fadcd5f31c96b0744a2a788c6e4a01c/core/types/block_test.go#L35
    - Transactions (done)
    - Accounts
    - Merkle Patricia Trie
    - Ethhash ? 

- [ ] Tiny solidity compiler ? 
    - Just something to improve the mental mapping between solidity and the actual bytecode. Nothing fancy.
        - No optimizer.
    - https://docs.soliditylang.org/en/v0.8.15/grammar.html
    - What could be interesting is diving into static analysis of solidity programs
      - Or dynamic analysis, by doing some cool fuzzing ? 
      - Maybe with sat solvers also
    - This would make it easy to test things like state channels.
    - It also makes it super easy to obscure decode function calls
      - You load the entire solidity contract into the tiny solidity compiler parser which can extracts the methods and convert them to a method id.

- [ ] RPC ? 
    - Not sure if this is necessary.

- [ ] Play wargames with this implementation
  - https://github.com/fvictorio/evm-puzzles
    - Completed
  - https://ethernaut.openzeppelin.com/
  - https://www.damnvulnerabledefi.xyz/
  - https://github.com/karmacoma-eth/pinball-ctf
  - https://github.com/paradigm-operations/paradigm-ctf-2021
