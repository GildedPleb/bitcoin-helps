import currentThing from "eslint-config-current-thing";

export default [
  {
    ignores: ["temp.js", "**/src/prisma/**/*"],
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
    },
  },
];
