import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "goalchain_webapp/src/analytics/**"
    ]
  },
  {
    files: ["goalworld_site/src/assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrors": "none" }],
      "no-empty": ["error", { "allowEmptyCatch": true }]
    }
  },
  {
    files: ["goalworld_site/build.mjs", "design/sync-tokens.mjs", "goalchain_webapp/scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrors": "none" }],
      "no-empty": ["error", { "allowEmptyCatch": true }]
    }
  },
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ["goalchain_webapp/src/**/*.{ts,tsx}"]
  })),
  {
    files: ["goalchain_webapp/src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-empty": ["error", { "allowEmptyCatch": true }]
    }
  }
];
