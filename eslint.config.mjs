import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: [
        ...nextCoreWebVitals,
        ...compat.extends("eslint:recommended"),
        ...compat.extends("plugin:@typescript-eslint/recommended")
    ],

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
    },

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
}]);