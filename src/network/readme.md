
# Docs
- https://github.com/ethereum/devp2p
- https://github.com/ethereum/devp2p/blob/master/rlpx.md
- https://github.com/ethereum/devp2p/blob/master/caps/eth.md#getblockheaders-0x03

- https://medium.com/orbs-network/the-actual-networking-behind-the-ethereum-network-how-it-works-6e147ca36b45
- https://p2p.paris/gen/attf4zFDPfhauUHyj-The_p2p_network_behind_Ethereum.pdf
- https://mdbailey.ece.illinois.edu/publications/imc18_ethereum.pdf
- https://old.reddit.com/r/ethereum/comments/6ffycd/rlpx_v4_handshake_message_and_ecies_encryption/
    - SOme good example here

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
- https://github.com/stateview/atoms/tree/6c3513c0775e1e1e69a7c9e5c86255804fa3fb36/p2p/rlpx
    - Looks like they have some good tests also
- https://github.com/ethereumjs/ethereumjs-devp2p/pull/15/files
    - PR used for ethereumjs for eip-8
    


# Other info
## Node list
- Bootstrap nodes
    - https://github.com/ethereum/go-ethereum/blob/master/params/bootnodes.go
- Enodes
    - https://eth.wiki/en/fundamentals/enode-url-format
    - https://ethereum.stackexchange.com/questions/28970/how-to-produce-enode-from-node-key



### Breakdown of the handshakes
We know that from https://github.com/ethereum/devp2p/blob/master/rlpx.md that the following primitives are necessary
- secp256k1
- NIST SP 800-56 Concatenation Key Derivation Function
- HMAC using the SHA-256 hash function.
- AES-128 encryption function in CTR mode.

From https://p2p.paris/gen/attf4zFDPfhauUHyj-The_p2p_network_behind_Ethereum.pdf we know that we need both construct an shared secret, AES secret, mac-secret, ingress-mac, egress-mac.

From  https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/rlpxcipher.py#L146 and http://120.79.199.70/tim/gol/blob/master/p2p/rlpx/rlpx.go#L441 we know that
- shared-secret = sha3(ecdhe-shared-secret || sha3(nonce || initiator-nonce))
- aes-secret = sha3(ecdhe-shared-secret || shared-secret)
- mac-secret = sha3(ecdhe-shared-secret || aes-secret)
- ingress-mac = sha3.update(mac-secret ^ initiator-nonce || auth-recvd-ack)
- egress-mac = sha3.update(mac-secret ^ recipient-nonce || auth-sent-init)

-> This is actually desrcibed lower down on the RLPX.md, but it's ot written in a very clean way (i.e no references to the other sections).

Trying to break down the example in the ECIES encryption section from the RLPX.mD
Alice want's to send a message Bob, using public key crypto.

1. Alice generate a random number r, or a nonce.
2. 
    Alice computes a shared secret using bobs public key, and the random nonce.
    She can derive key material by doing KDF (Shared secret , 32, , which is the same as adding the K_E, and K_M ) -> OKAY, but what is the K_E, and K_M ? 
        - oh, I guess it's mac key, and egress key 
        - 
            
    Alice also create a random initialization vector IV (from the AES I guess).
3. ALice send a encrypted message as R || IV || c || d where c = AES(k_E, iv, m) and d = MAC(sha256(J_M), iv || C)


## eciesjs
- okay this seems to implement it all, 