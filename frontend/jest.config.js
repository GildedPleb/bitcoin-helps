export default {
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: ["./src/**"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        minify: false,
        jsc: {
          target: "es2021",
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          transform: {
            react: {
              runtime: "automatic", // This is the key to use new JSX Transform
              // refresh: false,
              refresh: true, // Only include this line for React projects
            },
          },
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  cacheDirectory: ".jest-cache",
  onlyChanged: true,
  snapshotSerializers: ["@emotion/jest/serializer"],
  // bail: 1,
  // reporters: [
  //   "jest-progress-bar-reporter",
  //   [
  //     "@jest-performance-reporter/core",
  //     {
  //       errorAfterMs: 1000,
  //       warnAfterMs: 100,
  //       logLevel: "warn",
  //       maxItems: 5,
  //       skipFileReport: true,
  //     },
  //   ],
  // ],
  // collectCoverage: true,
  // coverageReporters: [["text", { skipFull: true }]],
  // coveragePathIgnorePatterns: ["node_modules"],
  // coverageDirectory: "./coverage",
  // coverageProvider: "v8",
  // },
};
