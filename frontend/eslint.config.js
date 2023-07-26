import currentThing from "eslint-config-current-thing";

export default [
  {
    ignores: ["temp.js", "**/src/prisma/**/*"],
  },
  ...currentThing(),
  {
    parserOptions: {
      project: './tsconfig.eslint.json',
    },
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
];
