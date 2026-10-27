import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"],
    plugins: { js }, extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  }, {
    files: ['webpack.common.js', 'webpack.dev.js', 'webpack.prod.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
