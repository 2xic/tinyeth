/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
const isRunningJest = !!process.env.JEST_WORKER_ID;

import {
  describe as jestDescribe,
  expect as jestExpect,
  it as jestIt,
} from '@jest/globals';

/*
  "hack" to make it easy to somewhat easy to test different test runners
*/
const metadata = isRunningJest
  ? {
      describe: jestDescribe,
      it: jestIt,
      expect: jestExpect,
    }
  : {
      describe: require('./getBun').describe,
      it: require('./getBun').it,
      expect: require('./getBun').expect,
    };

export const describe = metadata.describe;
export const it = metadata.it;
export const expect = metadata.expect;
