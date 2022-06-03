# tinyeth

Something like [https://github.com/2xic/Bitcoin-lib-small](https://github.com/2xic/Bitcoin-lib-small), but for Ethereum, tinyeth!

_Just something so I get a better understanding of the core parts of the protocol, don't use this in production_

### Plan

- [ ] Network support (should be able to fetch a block)
  - (wip) Wire protocol
    - [Discovery protocol](https://github.com/ethereum/devp2p/blob/master/discv4.md)
    - [discv5](https://github.com/ethereum/devp2p/blob/master/discv5/discv5-theory.md)
  - [RLPx](https://github.com/ethereum/devp2p/blob/master/rlpx.md) should now be more or less implemented. The problems remaining I think are mostly because we connect to bootstrap node that don't do normal operation.   

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

- [ ] (started on) Implementation parts of the EVM (i.e should be able to run a simple contract based on the bytecode)

  Currently added:
    - Runs a basic contract
    - (wip) you should be able to solve all these https://github.com/fvictorio/evm-puzzles puzzles with logic in this library, it's able to do up to level 7 currently.
    - (wip) improved support for the abi, make it "easy" to encode calldata.

- [ ] Data structures like block, transactions, accounts, Merkle Patricia Trie, ethash(?), etc
  