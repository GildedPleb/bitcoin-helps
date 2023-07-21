# ./backend/ci/pre-install.sh

set -e

echo "\n\nSTARTING: Pre-install...\n\n"

if [[ "$STAGE" == "prod" && -z "$GITHUB_ACTIONS" ]]
then
  echo "Prod deployments should only be executed in GitHub Actions."
  exit 1
fi

###### TYPES ######

echo "...Generating Types..."
npm run codegen

###### PRISMA LAYER ######

echo "...Deleting prisma layer node_module..."
rm -rf ./src/layers/prisma/nodejs/node_modules

echo "...Migrating DB and Generating Prisma Client..."
if [ "$STAGE" = "dev" ]
then
  if [ -z "$DATABASE_URL_dev" ]
  then
    echo "Missing DATABASE_URL_dev env variable"
    exit 1
  fi
  echo "DATABASE: $(echo $DATABASE_URL_dev | rev | cut -c 1-10 | rev)"
  echo "GPT: ${GPT_VERSION_dev}"
  DATABASE_URL=$DATABASE_URL_dev PRISMA_CLIENT_ENGINE_TYPE=binary npx prisma migrate dev
  echo "...Verifying seeds..."
  DATABASE_URL=$DATABASE_URL_dev npm run verify-seeds
elif [ "$STAGE" = "prod" ]
then
  if [ -z "$DATABASE_URL_prod" ]
  then
    echo "Missing DATABASE_URL_prod env variable"
    exit 1
  fi
  echo "DATABASE: $(echo $DATABASE_URL_prod | rev | cut -c 1-10 | rev)"
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

echo "...Running Tests..."

npm test

echo "\n\nENDING: Pre-install COMPLETE\n\n"
