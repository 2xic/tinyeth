import { InvalidJump } from './errors/InvalidJump';

const JUMP_DEST = 0x5b;

export function isValidJump({
  pc,
  opCodeAtPc,
}: {
  pc: number;
  opCodeAtPc: number;
}) {
  if (opCodeAtPc !== JUMP_DEST) {
    throw new InvalidJump(`Invalid jump location 0x${pc.toString(16)}`);
  }
}
