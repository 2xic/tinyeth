import { Syntax } from './Syntax';
import { RequiredSyntax } from './RequiredSyntax';
import { Token } from './tokens/Token';

export class RecursiveSyntax {
  constructor(
    public recursivePaths: Array<Syntax | RequiredSyntax>,
    public breakRecursion: Token
  ) {}
}
