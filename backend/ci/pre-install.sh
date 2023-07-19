# ./backend/ci/pre-install.sh

set -e

echo "\n\nSTARTING: Pre-install...\n\n"

###### TYPES ######

echo "...Generating Types..."
npm run codegen

###### PRISMA LAYER ######

echo "...Deleting prisma layer node_module..."
rm -rf ./src/layers/prisma/nodejs/node_modules

echo "...Migrating DB and Generating Prisma Client..."
if [ "$STAGE" = "dev" ]
then
  : ${DATABASE_URL_dev:?"Missing DATABASE_URL_dev env variable"}
  echo "DATABASE: ${DATABASE_URL_dev: -10}"
  echo "GPT: ${GPT_VERSION_dev}"
  DATABASE_URL=$DATABASE_URL_dev PRISMA_CLIENT_ENGINE_TYPE=binary npx prisma migrate dev
  echo "...Verifying seeds..."
  DATABASE_URL=$DATABASE_URL_dev npm run verify-seeds
elif [ "$STAGE" = "prod" ]
then
  : ${DATABASE_URL_prod:?"Missing DATABASE_URL_prod env variable"}
  echo "DATABASE: ${DATABASE_URL_prod: -10}"
  echo "GPT: ${GPT_VERSION_prod}"
  DATABASE_URL=$DATABASE_URL_prod PRISMA_CLIENT_ENGINE_TYPE=binary npx prisma migrate deploy && npx prisma generate
  echo "...Verifying seeds..."
  DATABASE_URL=$DATABASE_URL_prod npm run verify-seeds
else
  echo "Invalid stage. Please provide 'dev' or 'prod'."
  exit 1
fi

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

echo "\n\nENDING: Pre-install COMPLETE\n\n"
