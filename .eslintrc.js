// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: ["scripts/**/", "experimental/**/"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: './tsconfig.json',
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "@typescript-eslint/no-floating-promises": "error",
    "prettier/prettier": "error",
    "linebreak-style": ["error", "unix"],
    "no-console": ["error", { allow: ["warn", "error"] }],
    quotes: ["error", "single"],
    semi: ["error", "always"],
  },
};
