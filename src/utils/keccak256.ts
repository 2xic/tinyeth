import createKeccakHash from 'keccak';

export function keccak256(inputMessage: Buffer): Buffer {
  return createKeccak256().update(inputMessage).digest();
}

export function createKeccak256() {
  return createKeccakHash('keccak256');
}
