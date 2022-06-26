# tinyeth

Something like [https://github.com/2xic/Bitcoin-lib-small](https://github.com/2xic/Bitcoin-lib-small), but for Ethereum, tinyeth!

_Just something so I get a better understanding of the core parts of the protocol, don't use this in production_

### Plan

- [ ] Network support (should be able to fetch a block from another node)
  - Wire/discovery protocol is more or less implemented. It's currently able to find neighbor nodes which is needed for the RLPx. [Discv4](https://github.com/ethereum/devp2p/blob/master/discv4.md#wire-protocol) is currently implemented. I know [discv5](https://github.com/ethereum/devp2p/blob/master/discv5/discv5-theory.md) is out.
  - [RLPx](https://github.com/ethereum/devp2p/blob/master/rlpx.md) is able to do the initial handshake, and send messages. Need some stability improvements, but it's getting there.
  - (soon/wip) Capabilities for RPLx. I.e [ETH](https://github.com/ethereum/devp2p/blob/master/caps/eth.md#eth62-2015) is the last step to be able to fetch a block :) 

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

- [ ] (put aside to finish networking first) Implement the EVM (i.e should be able to run a simple contract based on the bytecode / mnemonic)

  Currently supports:
    - Runs basic contracts
    - Converts mnemonic into bytecode.
    - (wip) gas cost/refund computation -> let's you see how much gas is used when executing contract.
    - (wip) you should be able to solve all these https://github.com/fvictorio/evm-puzzles puzzles with logic in this library, it's able to do up to level 8 currently.
    - (wip) improved support for the abi, make it "easy" to encode calldata.

- [ ] Data structures like block, transactions, accounts, Merkle Patricia Trie, ethash(?), etc
  