#!/bin/bash

# ./deploy.sh

set -e

export STAGE=$1
SCRIPT_DIR=$(dirname "$0")

if [[ "$STAGE" != "dev" && "$STAGE" != "prod" ]]
then
  echo "Invalid stage. Please provide 'dev' or 'prod'."
  exit 1
fi

if [[ "$STAGE" == "prod" && -z "$GITHUB_ACTIONS" ]]
then
  echo "Prod deployments should only be executed in GitHub Actions."
  exit 1
fi

echo "Deploying to $STAGE..."
echo "Deploying $STAGE backend..."
(cd "${SCRIPT_DIR}/backend" && npm ci && npx sls deploy --stage $STAGE)
echo "Deploying $STAGE frontend..."
(cd "${SCRIPT_DIR}/frontend" && npm ci && npx sls deploy --stage $STAGE)
echo "$STAGE deployment complete!"
