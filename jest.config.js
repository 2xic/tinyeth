module.exports = {
  testRegex: ".*.test.ts$",
  transform: {
    '\\.(js|ts|jsx|tsx)$': 'babel-jest',
  },
  verbose: true,
};
