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

  it('should correctly serialize', () => {
    const buffer = Buffer.from(
      'ca2ff06caae7c94dc968be7d76d0fbf60dd2e1989ee9bf0d5931e48564d5143b',
      'hex'
    );
    const output = interactor.serialize({
      buffer,
    });
    expect(output.toString('hex')).toBe(
      'ac000000f20000000f000000c6000000aa0000007e0000009c000000d40000009c00000086000000eb000000d7000000670000000d000000bf0000006f000000d00000002d0000001e00000089000000e90000009e000000fb000000d000000095000000130000004e00000058000000460000005d00000041000000b3000000'
    );
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
      'e9000000260000001900000079000000c00000004b000000d40000009d00000004000000800000007c000000b9000000ac0000009f0000008d000000f6000000810000004b0000004b000000b90000005a0000002b0000000a0000007400000018000000bd0000001700000099000000de000000b3000000e9000000e4000000'
    );
  });

  it('should correctly get seed 0', () => {
    const results = interactor.getSeedHash({
      blockNumber: new BigNumber(0),
    });
    expect(results.toString('hex')).toBe('00'.repeat(32));
  });

  it('should correctly run sha3_512 with words size', () => {
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
      4217925025, 2185742795, 606201448, 842188344, 4202428871, 2216616280,
      724259879, 3986359582, 523939305, 538900924, 2437647790, 2723274948,
      1645722346, 1329526573, 3834217637, 1665343538,
    ];
    const results = interactor.sha3_512({
      buffer: interactor.serialize({
        buffer: Buffer.alloc(32),
      }),
    });
    pythonResults.forEach((item, index) => {
      expect(item).toBe(results[index]);
    });
  });
});
