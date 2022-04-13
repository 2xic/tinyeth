export class UnimplementedOpcode extends Error {
  constructor(opcode: string) {
    super(`OpCode is not fully implemented ${opcode}`);
  }
}
