# ./frontend/ci/build.sh

echo "...Building React App..."
echo "STAGE: ${STAGE}"

if [ "${STAGE}" = "dev" ]
then
  echo "DEV URL: ${REACT_APP_API_URL_HTTP_DEV}"
elif [ "${STAGE}" = "prod" ]
then
  echo "PROD URL: ${REACT_APP_API_URL_HTTP_PROD}"
else
  echo "Invalid stage."
  exit 1
fi

npm run build
