

# forking of contract from mainnet

Idea is the following, we just use the alchemy / rpc provider to get the contract code.

Each time we need to load storage / etc we fetch it before loading it in.

We might have to hook some opcodes to make this work.

I think this is the simplest way to not have to load all blocks etc.
