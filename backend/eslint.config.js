import currentThing from "eslint-config-current-thing";

export default [
  {
    ignores: ["**/src/prisma/**/*", ".build/**/*"],
  },
  ...currentThing(),

  {
    rules: {
      "no-console": "off",
    },
  },
];
