import { injectable } from 'inversify';
import { ComputeSstoreGas, Results, SstoreContext } from './ComputeSstoreGas';

@injectable()
export class GasComputer {
  constructor(private computeSstoreGas: ComputeSstoreGas) {}

  public sstore(context: SstoreContext): Results {
    return this.computeSstoreGas.compute(context);
  }
}
