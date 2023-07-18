#!/bin/bash

# ./deploy.sh

set -e

export STAGE=$1
SCRIPT_DIR=$(dirname "$0")

if [ "$STAGE" == "dev" ]
then
  echo "Deploying to dev..."
  echo "Deploying dev backend..."
  (cd "${SCRIPT_DIR}/backend" && npm i && npx sls deploy --stage dev)
  echo "Deploying dev frontend..."
  (cd "${SCRIPT_DIR}/frontend" && npm i && npx sls deploy --stage dev)
  echo "Dev deployment complete!"

elif [ "$STAGE" == "prod" ]
then
  echo "Deploying to prod..."
  echo "Deploying prod backend..."
  (cd "${SCRIPT_DIR}/backend" && npm i && npx sls deploy --stage prod)
  echo "Deploying prod frontend..."
  (cd "${SCRIPT_DIR}/frontend" && npm i && npx sls deploy --stage prod)
  echo "Prod deployment complete!"
else
  echo "Invalid stage. Please provide 'dev' or 'prod'."
  exit 1
fi
