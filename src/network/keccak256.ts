import createKeccakHash from 'keccak';

export function keccak256(inputMessage: Buffer): Buffer {
  return createKeccakHash('keccak256').update(inputMessage).digest();
}
