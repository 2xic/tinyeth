import BigNumber from 'bignumber.js';
import { Container } from 'inversify';
import { UnitTestContainer } from '../../container/UnitTestContainer';
import { EthHashHelper } from './EthHashHelpers';

describe('EthHashHelpers', () => {
  let container: Container;
  let interactor: EthHashHelper;

  beforeEach(() => {
    container = new UnitTestContainer().create();
    interactor = container.get(EthHashHelper);
  });

  it('should correctly serialize number array', () => {
    const buffer = [
      1556305580, 3110293675, 2203511527, 3296848916, 2859967755, 2430480614,
      2650801184, 2777543048, 2868755835, 2618883232, 1406716006, 292260644,
      1070941320, 497093501, 2948592608, 1067179340,
    ];
    const output = interactor.serialize({
      buffer,
    });
    expect(output.toString('hex')).toBe(
      'ca653cc5ba05369b7eae653841ce184cb05a77aa6e03ed09024000e9881fd85ab7dbdfaa0acf81c9668c8d3542b8b61188445df3d7b01ad10e3ffbfac4ddb9f3'
    );
  });

  it('should correctly decode int', () => {
    const results = interactor.decodeInt({
      buffer: Buffer.from('0a', 'hex'),
    });
    expect(results).toBe(new BigNumber('10').toNumber());
  });

  it('should correctly get seed 30000', () => {
    const results = interactor.getSeedHash({
      blockNumber: new BigNumber(30000),
    });
    expect(results.toString('hex')).toBe(
      'e9261979c04bd49d04807cb9ac9f8df6814b4bb95a2b0a7418bd1799deb3e9e4'
    );
  });

  it('should correctly get seed 0', () => {
    const results = interactor.getSeedHash({
      blockNumber: new BigNumber(0),
    });
    expect(results.toString('hex')).toBe('00'.repeat(32));
  });

  it('should correctly run sha3_512 with words size and number input', () => {
    const pythonResults = [
      4222350358, 1973225343, 1791960186, 753837074, 3994813480, 3079448127,
      1588136613, 3582437939, 1953671597, 2220154068, 3659787161, 974854965,
      1134609847, 2873948534, 3691374415, 4011529997,
    ];
    const results = interactor.sha3_512({
      buffer: Buffer.from('deadbeef', 'hex'),
    });
    pythonResults.forEach((item, index) => {
      expect(item).toBe(results[index]);
    });
  });

  it('should correctly run sha3_256 with words size', () => {
    const pythonResults = [
      1619143477, 2053942669, 1533468099, 1567516354, 2973532311, 278995775,
      3909427614, 1220821567,
    ];
    const results = interactor.sha3_256({
      buffer: Buffer.from('deadbeef', 'hex'),
    });
    pythonResults.forEach((item, index) => {
      expect(item).toBe(results[index]);
    });
  });

  it('should correctly run fnv', () => {
    const results = interactor.fnv({
      v1: new BigNumber(42),
      v2: new BigNumber(44),
    });
    expect(results.toString()).toBe('704660018');
  });

  it('should correctly run sha3_512 with words size', () => {
    const pythonResults = [
      3105742346, 3981608396, 1688573785, 3177087789, 3496416025, 1247159436,
      4145437299, 259714167, 1582819074, 965637980, 2046479830, 1809411072,
      1728689348, 3106127019, 804101648, 4143475241,
    ];
    const buffer = interactor.serialize({
      buffer: Buffer.alloc(8),
    });
    const results = interactor.sha3_512({
      buffer,
    });
    pythonResults.forEach((item, index) => {
      expect(item).toBe(results[index]);
    });
  });

  it('should correctly run serialize array', () => {
    const buffer = interactor.serialize({
      buffer: [
        2755235811, 1595104947, 4073035754, 3783746169, 3486906058, 91995985,
        4139805475, 96047419, 3546066439, 3293631156, 274415143, 1006938476,
        358277688, 1510701946, 3769647728, 13810314,
      ],
    });
    expect(buffer.toString('hex').length).toBe(126);
    expect(buffer.toString('hex')).toBe(
      '3ef8934a3be531f5ae795c2f9726781eac6f5dfc15fbb75032b60c6fb3199b5070eac53d4b2d054c72e3b501c69a40c3832ea551a7b7b0a507240b0ea8ab2d'
    );
  });

  it('should correctly deserialize', () => {
    const expectedResults = [
      2542887582, 3645748236, 2613512256, 1876490698, 2612311064, 1201713829,
      2574375809, 1318992877,
    ];
    const output = interactor.deserialize({
      hashed: Buffer.from(
        '9e6291970cb44dd94008c79bcaf9d86f18b4b49ba5b2a04781db7199ed3b9e4e',
        'hex'
      ),
    });
    expectedResults.forEach((item, index) => {
      expect(item).toBe(output[index]);
    });
  });
});
