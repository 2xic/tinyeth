import { Container } from 'inversify';
import { UnitTestContainer } from '../../../container/UnitTestContainer';
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

  it('should calculate the fork id correctly', () => {
    const expectedForkId = container.get(ForkId).calculate({
      hash: 0,
      next: 0,
    });
    expect(expectedForkId).toBe('0xc6840000000080');
  });

  it('should calculate the fork id correctly', () => {
    const expectedForkId = container.get(ForkId).calculate({
      hash: 0xdeadbeef,
      next: 0xbaddcafe,
    });
    expect(expectedForkId).toBe('0xca84deadbeef84baddcafe');
  });
});
