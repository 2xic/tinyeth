module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testRegex: ['.*.unit.test.ts', '.*.e2e.test.ts'],
  transform: {
	  "\\.[jt]sx?$": "babel-jest"
  },
  "testPathIgnorePatterns": [".*.d.ts"]
};
