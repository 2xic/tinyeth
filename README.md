# tinyeth

Something like [https://github.com/2xic/Bitcoin-lib-small](https://github.com/2xic/Bitcoin-lib-small), but for Ethereum, tinyeth!

_Just something so I get a better understanding of the core parts of the protocol, don't use this in production_

### Plan

- [ ] Network support (should be able to fetch a block from another node)
  - Wire protocol is more or less implemented. It's currently able to find neighbor nodes which is needed for the RLPx.
    - [Discovery protocol](https://github.com/ethereum/devp2p/blob/master/discv4.md)
    - [discv4](https://github.com/ethereum/devp2p/blob/master/discv4.md#wire-protocol)
      - The version that is currently implemented. I know [discv5](https://github.com/ethereum/devp2p/blob/master/discv5/discv5-theory.md) is out.
  - (wip) [RLPx](https://github.com/ethereum/devp2p/blob/master/rlpx.md) should now be more or less implemented. However there seem to be an non obvious bug causing problems, which is what I currently try to debug.

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

- [ ] (put aside to finish networking first) Implement the EVM (i.e should be able to run a simple contract based on the bytecode)

  Currently supports:
    - Runs basic contracts
    - (wip) you should be able to solve all these https://github.com/fvictorio/evm-puzzles puzzles with logic in this library, it's able to do up to level 7 currently.
    - (wip) improved support for the abi, make it "easy" to encode calldata.

- [ ] Data structures like block, transactions, accounts, Merkle Patricia Trie, ethash(?), etc
  