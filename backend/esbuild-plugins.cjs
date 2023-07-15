// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-var-requires, n/no-unpublished-require
const { nodeExternalsPlugin } = require("esbuild-node-externals");

module.exports = [nodeExternalsPlugin()];
