import { UnitTestContainer } from '../container/UnitTestContainer';
import { AstToByteCode } from './AstToByteCode';

describe('AstToByteCode', () => {
  let astToByteCode: AstToByteCode;
  beforeEach(() => {
    const container = new UnitTestContainer().create();
    astToByteCode = container.get(AstToByteCode);
  });

  it('should correctly create an empty deployment contract', () => {
    const data = astToByteCode.deployment({
      script: `
            contract Test {

            }
        `,
    });

    expect(data.toString('hex')).toBe(
      '6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea264697066735822122062b37c2f49de67be4e4e8d8e912267eeef2505297138bd257fd40fe4e97a2d1064736f6c634300080f0033'
    );
  });
});
