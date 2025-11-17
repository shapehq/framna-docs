import { defineConfig } from "eslint/config"
import js from "@eslint/js"
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import tseslint from "typescript-eslint"

export default defineConfig([
  ...nextCoreWebVitals,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["next-env.d.ts", ".next"],
    rules: {
      "array-callback-return": ["error"],
      "no-await-in-loop": ["error"],
      "no-constant-binary-expression": ["error"],
      "no-constructor-return": ["error"],
      "no-duplicate-imports": ["error"],
      "no-new-native-nonconstructor": ["error"],
      "no-self-compare": ["error"],
      "no-template-curly-in-string": ["error"],
      "no-unmodified-loop-condition": ["error"],
      "no-unreachable-loop": ["error"],
      "no-unused-private-class-members": ["error"],
      "require-atomic-updates": ["error"],
  
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
      }],
    },
  }
])
