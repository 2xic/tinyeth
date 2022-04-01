# tinyeth

Something like [https://github.com/2xic/Bitcoin-lib-small](https://github.com/2xic/Bitcoin-lib-small), but for Ethereum, tinyeth!

_Just something so I get a better understanding of the core parts of the protocol, don't use this in production_

### Plan

- [ ] (WIP) Network support (should be able to fetch a block)
  - RLPx
  - Wire protocol

- [x] Implement encoding and decoding of RLP

  Currently added:
    - Decent encoder support
    - Decent decoder support

- [x] Signing of transactions

  Currently added:
    - Support for creating a key pair added, signing, and verification
    - Support for creating a raw transactions
    - Support for signing a raw transaction

- [ ] (started on) Implementation parts of the EVM (i.e should be able to run a simple contract based on the bytecode)

  Currently added:
    - Runs a basic contract

- [ ] Data structures like block, transactions, accounts, Merkle Patricia Trie, ethash(?), etc
