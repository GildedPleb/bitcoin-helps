# ./frontend/ci/build.sh

echo "...Building React App..."
echo "STAGE: ${STAGE}"

if [[ "$STAGE" == "prod" && -z "$GITHUB_ACTIONS" ]]
then
  echo "Prod deployments should only be executed in GitHub Actions."
  exit 1
fi

if [ "${STAGE}" = "dev" ]
then
  echo "DEV URL: ${REACT_APP_API_URL_HTTP_DEV}"
  export SCHEMA=${REACT_APP_API_URL_HTTP_DEV}
elif [ "${STAGE}" = "prod" ]
then
  echo "PROD URL: ${REACT_APP_API_URL_HTTP_PROD}"
  export SCHEMA=${REACT_APP_API_URL_HTTP_PROD}
else
  echo "Invalid stage."
  exit 1
fi

npx graphql-codegen

npm run build
