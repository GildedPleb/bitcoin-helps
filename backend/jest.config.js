export default {
  testEnvironment: "node",
  bail: 1,
  reporters: [
    "jest-progress-bar-reporter",
    [
      "@jest-performance-reporter/core",
      {
        errorAfterMs: 1000,
        warnAfterMs: 100,
        logLevel: "warn",
        maxItems: 5,
        skipFileReport: true,
      },
    ],
  ],
  collectCoverage: true,
  coverageReporters: [["text", { skipFull: true }]],
  collectCoverageFrom: ["./src/**"],
  coveragePathIgnorePatterns: ["node_modules"],
  coverageDirectory: "./coverage",
  coverageProvider: "v8",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        minify: false,
        jsc: {
          transform: {
            react: {
              refresh: false,
              // "refresh": true // Only include this line for React projects
            },
          },
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  cacheDirectory: ".jest-cache",
  onlyChanged: true,
  moduleNameMapper: {
    "^@aws-sdk/client-dynamodb$":
      "<rootDir>/test/__mocks__/@aws-sdk/client-dynamodb.ts",
    "^@aws-sdk/util-dynamodb$":
      "<rootDir>/test/__mocks__/@aws-sdk/util-dynamodb.ts",
  },
};
