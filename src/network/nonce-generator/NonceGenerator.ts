export abstract class NonceGenerator {
  public abstract generate({ length }: { length: number }): Buffer;
}
