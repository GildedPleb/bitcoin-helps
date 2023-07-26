# ./frontend/ci/build.sh

set -e

echo "STAGE: ${STAGE}"

if [ "$STAGE" = "prod" ] && [ -z "$GITHUB_ACTIONS" ]; then
  echo "Prod deployments should only be executed in GitHub Actions."
  exit 1
fi

if [ "${STAGE}" = "dev" ]; then
  echo "DEV URL: ${VITE_APP_API_URL_HTTP_DEV}"
  export SCHEMA=${VITE_APP_API_URL_HTTP_DEV}
elif [ "${STAGE}" = "prod" ]; then
  echo "PROD URL: ${VITE_APP_API_URL_HTTP_PROD}"
  export SCHEMA=${VITE_APP_API_URL_HTTP_PROD}
else
  echo "Invalid stage."
  exit 1
fi

export STAGE

echo "...Generating Types..."
npx graphql-codegen

echo "...Running Tests..."
npm run test

echo "...Building React App..."
npm run build:deploy
