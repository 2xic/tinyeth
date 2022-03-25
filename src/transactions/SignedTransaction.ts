export class SignedTransaction {
  constructor(private signed: string) {
    this.signed = signed;
  }

  public toString() {
    return this.signed;
  }
}
