echo "\n\nSTARTING: Pre-install...\n\n"

###### TYPES ######

npm run codegen

###### PRISMA LAYER ######

echo "...Deleting prisma layer node_module..."
rm -rf ./src/layers/prisma/nodejs/node_modules

echo "...Generating Prisma Client..."
PRISMA_CLIENT_ENGINE_TYPE=binary npx prisma generate

echo "...Copying included items..."
mkdir -p                           ./src/layers/prisma/nodejs/node_modules/.prisma/client/
mkdir -p                           ./src/layers/prisma/nodejs/node_modules/prisma/
mkdir -p                           ./src/layers/prisma/nodejs/node_modules/@prisma/
cp -r node_modules/.prisma/client ./src/layers/prisma/nodejs/node_modules/.prisma/
cp -r node_modules/prisma         ./src/layers/prisma/nodejs/node_modules/
cp -r node_modules/@prisma        ./src/layers/prisma/nodejs/node_modules/

echo "...Prisma Layer initialized!"

###### ENDPOINT LAYER ######

echo "...Deleting endpoint node_module..."
rm -rf ./src/layers/endpoint/nodejs/node_modules

echo "...Endpoint Layer initialized!"

###### Prompt Assurance ######

# TODO: this needs to work for both prod and dev
echo "...Syncing prompts..."
npm run update-prompts

echo "\n\nENDING: Pre-install COMPLETE\n\n"
