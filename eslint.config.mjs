import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The property API is a CommonJS Express app.
  {
    files: ["property/server/**/*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // The property site was written to the react-app lint preset, which has
  // neither of these; its effects and copy follow that convention.
  {
    files: ["property/app/**/*.{js,jsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/purity": "off",
    },
  },
  // Component tests capture values from small harness components on purpose.
  {
    files: ["property/app/**/*.test.{js,jsx}"],
    rules: { "react-hooks/globals": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
