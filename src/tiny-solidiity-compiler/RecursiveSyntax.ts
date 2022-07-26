import { Syntax } from './Syntax';
import { Token } from './tokens/Token';

export class RecursiveSyntax {
  constructor(
    public recursiveToken: Syntax | Syntax[],
    public breakRecursion: Token
  ) {}
}
