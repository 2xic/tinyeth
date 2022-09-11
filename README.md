# tinyeth

Something like [https://github.com/2xic/Bitcoin-lib-small](https://github.com/2xic/Bitcoin-lib-small), but for Ethereum, tinyeth!

_Just something so I get a better understanding of the core parts of the protocol, don't use this in production_

### Status / Plans
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

- [x] Implement the "core" of the EVM

  Currently supports:
    - Most opcodes are more or less implemented (still some gas cost missing)
      - In other words, it's able to run most contracts.
    - Converts mnemonic into bytecode to make it easy to debug.
    - Support for the ABI, should be possible to encode calldata for most structs.

  todo / wip: 
    - (wip) gas cost/refund computation -> let's you see how much gas is used when executing contract.
        - There are only a few dynamic opcodes missing here.
    - (todo) improved handling of the EVMs datatypes. Operations that are using uint256 for instance should have a modulo operation to make sure our rounding is correct.

- [ ] Data structures
    https://arxiv.org/pdf/2108.05513.pdf nice recourse
    - (added mvp) Blocks
        - https://github.com/ethereum/go-ethereum/blob/4766b1107fadcd5f31c96b0744a2a788c6e4a01c/core/types/block_test.go#L35
    - (added mvp) Simple serialize
      - This is basically works the same way as the abi. You need a schema to encode, and to decode. It also uses variable lengths and fixed lengths variables with the same way to deal with offset of the dynamic variables.
      - https://ethereum.org/en/developers/docs/data-structures-and-encoding/ssz
    - (ok) Transactions
    - Accounts
    - Merkle Patricia Trie
    - Ethhash ? 

- "Research" and further learning
  - [ ] (wip) Tiny solidity compiler

      Starting to take some shape, but still very rough around the edges. The syntax parser will be refactored to make the syntax mapping more intuitive (soon).
      - Just something to improve the mental mapping between solidity and the actual bytecode. Nothing fancy.
          - In other words no fancy optimizer.
      - https://docs.soliditylang.org/en/v0.8.15/grammar.html
      - What could be interesting is diving into static analysis of solidity programs
        - Or dynamic analysis, by doing some cool fuzzing ? 
        - Maybe with sat solvers also
      - This would make it easy to test things like state channels.
      - It also makes it super easy to obscure decode function calls
        - You load the entire solidity contract into the tiny solidity compiler parser which can extracts the methods and convert them to a method id.

  - [ ] Implement fuzzing / Symbolic execution
    - https://files.sri.inf.ethz.ch/website/papers/ccs19-ilf.pdf

  - [ ] Account abstraction
    - https://medium.com/infinitism/erc-4337-account-abstraction-without-ethereum-protocol-changes-d75c9d94dc4as

  - [ ] Play wargames with this implementation
    - https://github.com/fvictorio/evm-puzzles
      - Completed (see `EvmPuzzle.unit.test.ts`)
    - https://ethernaut.openzeppelin.com/
    - https://www.damnvulnerabledefi.xyz/
    - https://github.com/karmacoma-eth/pinball-ctf
    - https://github.com/paradigm-operations/paradigm-ctf-2021
