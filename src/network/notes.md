# p2p logic



- https://github.com/ethereum/go-ethereum/tree/256aae0bfa9fee14a55347f40714e04062d6be5b/eth/protocols/eth
    - Geth networking logic.
    - https://github.com/ethereum/go-ethereum/blob/256aae0bfa9fee14a55347f40714e04062d6be5b/eth/protocols/eth/protocol.go
        - The protocol command definitions

## Trying to auth
- By looking at https://github.com/ethereum/devp2p/blob/master/rlpx.md#initial-handshake and  https://github.com/vaporyjs/vaporyjs-devp2p/blob/30426512df912af6c0d9c7f84f2009bc75af5a11/src/rlpx/ecies.js#L133
    - It looks like I do the same thing.
    - looks like there was bug in the ecies library we used


