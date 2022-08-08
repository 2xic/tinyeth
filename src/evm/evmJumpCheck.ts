import { InvalidJump } from './errors/InvalidJump';

const JUMP_DEST = 0x5b;

export function isValidJump({
  pc,
  opCodeAtPc,
  currentPc,
}: {
  pc: number;
  opCodeAtPc: number;
  currentPc: number;
}) {
  if (opCodeAtPc !== JUMP_DEST) {
    throw new InvalidJump(
      `Invalid jump location 0x${pc.toString(16)}. PC at 0x${currentPc.toString(
        16
      )}`
    );
  }
}
