import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";
import eslint from "@eslint/js";
import * as tsEslint from "typescript-eslint";

export default tsEslint.config(
    eslint.configs.recommended,
    ...tsEslint.configs.recommendedTypeChecked,
    ...tsEslint.configs.stylisticTypeChecked,
    {
        ignores: ["lib/", "*.mjs", "coverage/"]
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            globals: {},
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module",

            parserOptions: {
                project: "tsconfig.json"
            }
        },
        plugins: {
            jsdoc,
            prettier
        },
        rules: {
            "@typescript-eslint/adjacent-overload-signatures": "error",

            "@typescript-eslint/array-type": [
                "error",
                {
                    default: "array"
                }
            ],

            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/dot-notation": "error",
            "@typescript-eslint/explicit-function-return-type": "off",

            "@typescript-eslint/explicit-member-accessibility": [
                "off",
                {
                    accessibility: "explicit"
                }
            ],

            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/indent": "off",

            "@typescript-eslint/member-delimiter-style": [
                "off",
                {
                    multiline: {
                        delimiter: "none",
                        requireLast: true
                    },

                    singleline: {
                        delimiter: "semi",
                        requireLast: false
                    }
                }
            ],

            "@typescript-eslint/naming-convention": [
                "off",
                {
                    selector: "variable",
                    format: ["camelCase", "UPPER_CASE", "PascalCase"],
                    leadingUnderscore: "allow",
                    trailingUnderscore: "forbid"
                }
            ],

            "@typescript-eslint/no-array-constructor": "error",
            "@typescript-eslint/no-base-to-string": "error",
            "@typescript-eslint/no-duplicate-enum-values": "error",
            "@typescript-eslint/no-duplicate-type-constituents": "error",
            "@typescript-eslint/no-empty-function": "error",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-extra-non-null-assertion": "error",

            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    ignoreVoid: true
                }
            ],

            "@typescript-eslint/no-for-in-array": "error",
            "@typescript-eslint/no-implied-eval": "error",
            "@typescript-eslint/no-loss-of-precision": "error",
            "@typescript-eslint/no-misused-new": "error",

            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksVoidReturn: {
                        arguments: false,
                        attributes: false
                    }
                }
            ],

            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
            "@typescript-eslint/no-parameter-properties": "off",
            "@typescript-eslint/no-redundant-type-constituents": "error",

            "@typescript-eslint/no-shadow": [
                "error",
                {
                    hoist: "all"
                }
            ],

            "@typescript-eslint/no-this-alias": "error",
            "@typescript-eslint/no-unnecessary-type-assertion": "error",
            "@typescript-eslint/no-unnecessary-type-constraint": "error",
            "@typescript-eslint/no-unsafe-argument": "error",
            "@typescript-eslint/no-unsafe-assignment": "error",
            "@typescript-eslint/no-unsafe-call": "error",
            "@typescript-eslint/no-unsafe-declaration-merging": "error",
            "@typescript-eslint/no-unsafe-enum-comparison": "error",
            "@typescript-eslint/no-unsafe-member-access": "error",
            "@typescript-eslint/no-unsafe-return": "error",
            "@typescript-eslint/no-unused-expressions": "error",
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-var-requires": "error",
            "@typescript-eslint/prefer-as-const": "error",
            "@typescript-eslint/prefer-for-of": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/prefer-namespace-keyword": "error",
            "@typescript-eslint/quotes": "off",
            "@typescript-eslint/require-await": "error",
            "@typescript-eslint/restrict-plus-operands": "error",
            "@typescript-eslint/restrict-template-expressions": "error",
            "@typescript-eslint/semi": ["off", null],

            "@typescript-eslint/triple-slash-reference": [
                "error",
                {
                    path: "always",
                    types: "prefer-import",
                    lib: "always"
                }
            ],

            "@typescript-eslint/type-annotation-spacing": "off",
            "@typescript-eslint/typedef": "off",

            "@typescript-eslint/unbound-method": [
                "error",
                {
                    ignoreStatic: true
                }
            ],

            "@typescript-eslint/unified-signatures": "error",
            "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "no-type-imports" }],
            "@typescript-eslint/non-nullable-type-assertion-style": "off",
            "arrow-parens": ["off", "always"],
            "brace-style": ["off", "off"],
            "comma-dangle": "off",
            complexity: "off",
            "constructor-super": "error",
            curly: "off",
            "dot-notation": "off",
            "eol-last": "error",
            eqeqeq: ["error", "smart"],
            "guard-for-in": "error",

            "id-denylist": [
                "error",
                "any",
                "Number",
                "number",
                "String",
                "string",
                "Boolean",
                "boolean",
                "Undefined",
                "undefined"
            ],
            "id-match": "error",
            indent: "off",
            "jsdoc/check-alignment": "error",
            "jsdoc/check-indentation": "error",

            "jsdoc/tag-lines": [
                "error",
                "any",
                {
                    startLines: 1
                }
            ],

            "linebreak-style": "off",
            "max-classes-per-file": ["error", 1],
            "max-len": "off",
            "new-parens": "off",
            "newline-per-chained-call": "off",
            "no-array-constructor": "off",
            "no-bitwise": "error",
            "no-caller": "error",
            "no-cond-assign": "error",
            "no-console": "error",
            "no-debugger": "error",
            "no-empty": "error",
            "no-empty-function": "off",
            "no-eval": "error",
            "no-extra-semi": "off",
            "no-fallthrough": "off",
            "no-implied-eval": "off",
            "no-invalid-this": "off",
            "no-irregular-whitespace": "off",
            "no-loss-of-precision": "off",
            "no-multiple-empty-lines": "off",
            "no-new-wrappers": "error",
            "no-shadow": "off",
            "no-throw-literal": "error",
            "no-trailing-spaces": "off",
            "no-undef-init": "error",
            "no-underscore-dangle": "off",
            "no-unsafe-finally": "error",
            "no-unused-expressions": "off",
            "no-unused-labels": "error",
            "no-unused-vars": "off",
            "no-use-before-define": "off",
            "no-var": "error",
            "object-shorthand": "error",
            "one-var": ["error", "never"],

            "padded-blocks": [
                "off",
                {
                    blocks: "never"
                },
                {
                    allowSingleLineBlocks: true
                }
            ],

            "prefer-const": "error",
            "quote-props": "off",
            quotes: "off",
            radix: "error",
            "require-await": "off",
            semi: "off",
            "space-before-function-paren": "off",
            "space-in-parens": ["off", "never"],

            "spaced-comment": [
                "error",
                "always",
                {
                    markers: ["/"]
                }
            ],

            "use-isnan": "error",
            "valid-typeof": "off",
            "prettier/prettier": "error"
        }
    },
    {
        files: ["__tests__/**/*.ts"],

        plugins: {
            jest
        },

        languageOptions: {
            globals: {
                ...jest.environments.globals.globals
            },

            ecmaVersion: 5,
            sourceType: "module",

            parserOptions: {
                project: "__tests__/tsconfig.json"
            }
        },

        rules: {
            "@typescript-eslint/unbound-method": "off",
            "jest/unbound-method": "error"
        }
    }
);
