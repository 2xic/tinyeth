
# Docs
- https://github.com/ethereum/devp2p
- https://github.com/ethereum/devp2p/blob/master/rlpx.md
- https://github.com/ethereum/devp2p/blob/master/caps/eth.md#getblockheaders-0x03

- https://medium.com/orbs-network/the-actual-networking-behind-the-ethereum-network-how-it-works-6e147ca36b45
- https://p2p.paris/gen/attf4zFDPfhauUHyj-The_p2p_network_behind_Ethereum.pdf

# Relevant code in other clients
- http://adam.schmideg.net/go-ethereum/developers/Peer-to-Peer
    - https://github.com/ethereum/go-ethereum/tree/master/p2p/discover
- https://github.com/status-im/nim-eth-p2p


# EIP (s)
- https://github.com/ethereum/EIPs/blob/master/EIPS/eip-8.md#test-vectors
    - https://github.com/ethereum/pydevp2p/pull/32/files
    - https://github.com/fjl/pydevp2p/blob/ea0bd3e6eb836b701defe01353ac73d796ea0e3e/devp2p/tests/test_discovery.py

# Code 
- https://github.com/vaporyjs/vaporyjs-devp2p
    - Implementation was kinda off messy, but has some useful tests that can be added
- https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/rlpxcipher.py#L156
    - More detailed of the actual auth message, the part in the docs is kinda short.
- https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/tests/test_go_handshake.py
    - Borrowing test data, thank you <3
     
# Other info
## Node list
- Bootstrap nodes
    - https://github.com/ethereum/go-ethereum/blob/master/params/bootnodes.go
- Enodes
    - https://eth.wiki/en/fundamentals/enode-url-format
    - https://ethereum.stackexchange.com/questions/28970/how-to-produce-enode-from-node-key
