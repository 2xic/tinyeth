import { Syntax } from './Syntax';

export class OptionalSyntax {
  private optionalSyntax: Syntax | Syntax[] = [];
  private thenSyntax: Syntax | null = null;

  public paths(optionalSyntax: Syntax | Syntax[], thenSyntax: Syntax) {
    this.optionalSyntax = optionalSyntax;
    this.thenSyntax = thenSyntax;

    return this;
  }

  public optionality(): Syntax[] {
    const thenSyntax = this.thenSyntax;
    if (!thenSyntax) {
      throw new Error('Bad input');
    }
    const optionalSyntax = Array.isArray(this.optionalSyntax)
      ? this.optionalSyntax
      : [this.optionalSyntax];

    return [...optionalSyntax.map((item) => item.then(thenSyntax)), thenSyntax];
  }
}
