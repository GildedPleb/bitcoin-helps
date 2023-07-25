set -e

echo "\n\nSTARTING: Post-install...\n\n"

echo "...Pairing down unneeded Prisma Files..."

# Inclusions and exclussions
#
# The following commands add support for these exclusions and inclussions at the layer level, not handled by serverless-esbuild-layers:
#     package:
#       patterns:
#         - "!node_modules/.prisma/client/libquery_engine-*"
#         - "node_modules/.prisma/client/query-engine-rhel-openssl-1.0.x"
#         - "node_modules/.prisma/client/libquery_engine-rhel-*"
#         - "!node_modules/prisma/libquery_engine-*"
#         - "!node_modules/@prisma/engines/**"
#         - "!node_modules/.prisma/client/query-engine-debian-openssl-1.1.x"

# Delete macOS related stuffs
find ./src/layers/prisma/nodejs/node_modules/.prisma/client  -name "libquery_engine-darwin.dylib.node" -type f -delete
find ./src/layers/prisma/nodejs/node_modules/.prisma/client  -name "query-engine-debian"               -type f -delete
find ./src/layers/prisma/nodejs/node_modules/.prisma/client  -name "query-engine-darwin"               -type f -delete

# Delete unneeded stuffs
find ./src/layers/prisma/nodejs/node_modules/prisma          -name "libquery_engine-*"                 -type f -delete
find ./src/layers/prisma/nodejs/node_modules/@prisma/engines                                           -type f -delete

echo "...Deleting completed"

echo "...Notable Size contributions from ./src/layers/prisma/nodejs/node_modules/"
find ./src/layers/prisma/nodejs/node_modules -type d -mindepth 1 -maxdepth 1 -exec du -sh {} \; 2>/dev/null | sort -hr | head -n 10

echo "...Notable Size contributions from ./src/layers/endpoint/nodejs/node_modules/"
find ./src/layers/endpoint/nodejs/node_modules -type d -mindepth 1 -maxdepth 1 -exec du -sh {} \; 2>/dev/null | sort -hr | head -n 10

echo "\n\nENDING: Post-install COMPLETE\n\n"
