import currentThing from "eslint-config-current-thing";

export default [
  {
    ignores: ["**/src/prisma/**/*"],
  },
  ...currentThing(),
  {
    rules: {
      "react/require-default-props": [
        2,
        {
          functions: "defaultArguments",
        },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/react-in-jsx-scope": 0,
      "react/jsx-uses-react": 0,
    },
  },
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
    },
  },
];
