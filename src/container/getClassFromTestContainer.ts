import { interfaces } from 'inversify';
import { UnitTestContainer } from './UnitTestContainer';

export function getClassFromTestContainer<T>(
  service: interfaces.ServiceIdentifier<T>
) {
  return new UnitTestContainer()
    .create({
      privateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      ephemeralPrivateKey:
        '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
      deterministicRandomness: true,
    })
    .get(service);
}
