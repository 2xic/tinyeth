https://eips.ethereum.org/EIPS/eip-712

Summary / Notes:

- Improve off-chain message signing for use on-chain.
- Proposes a method to use a schema to encode data in a way that allows users to get a better idea of what they are signing
  - encode(transaction) = RLP_encode(transaction)
  - encode(message) = "\x19Ethereum Signed Message:\n" || len(message) || message
    - || = concat
  - quote: "len(message) is the non-zero-padded ascii-decimal encoding of the number of bytes in message"
  - 
- Test cases
  - https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.js
  - https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.sol
  - 