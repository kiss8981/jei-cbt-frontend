import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // 기존 규칙을 덮어쓰거나 새로운 규칙을 추가하는 섹션입니다.
    rules: {
      // 1. 명시적 `any` 사용 허용 (Error: Unexpected any)
      "@typescript-eslint/no-explicit-any": "off", // 2. 사용되지 않는 변수/가져오기 완화 (Warning: 'X' is defined but never used)

      "@typescript-eslint/no-unused-vars": [
        "warn", // 'error' 대신 'warn'으로 심각도 낮춤
        {
          argsIgnorePattern: "^_", // 인수가 '_'로 시작하면 무시
          varsIgnorePattern: "^_", // 변수가 '_'로 시작하면 무시
          ignoreRestSiblings: true,
        },
      ],
      "@next/next/no-img-element": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },
];

export default eslintConfig;
