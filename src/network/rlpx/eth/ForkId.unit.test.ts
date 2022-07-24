import { Container } from 'inversify';
import { UnitTestContainer } from '../../../container/UnitTestContainer';
import { RlpEncoder } from '../../../rlp';
import { ForkId } from './ForkId';

describe('ForkId', () => {
  let container: Container;

  beforeEach(() => {
    container = new UnitTestContainer().create();
  });

  it('should calculate the fork id correctly', () => {
    const expectedForkId = container.get(ForkId).forkId;
    expect(expectedForkId).toBe('fc64ec04');
  });

  it('should calculate the [zero, zero] fork id correctly', () => {
    const expectedForkId = new RlpEncoder().encode({
      input: container.get(ForkId).calculate({
        hash: 0,
        next: 0,
        providedForkId: true,
      }),
    });
    expect(expectedForkId).toBe('0xc6840000000080');
  });

  it('should calculate the [deadbeef, deadbeef] fork id correctly', () => {
    const expectedForkId = new RlpEncoder().encode({
      input: container.get(ForkId).calculate({
        hash: 0xdeadbeef,
        next: 0xbaddcafe,
        providedForkId: true,
      }),
    });
    expect(expectedForkId).toBe('0xca84deadbeef84baddcafe');
  });
});
