import { libraryConfig } from "@repo/eslint-config/library";

export default [
  ...libraryConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
