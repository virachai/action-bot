import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for Node.js libraries.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const libraryConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        React: true,
        JSX: true,
        node: true,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    ignores: [".*.js", ".*.mjs", "*.config.*", "node_modules/", "dist/"],
  },
];

export default libraryConfig;
