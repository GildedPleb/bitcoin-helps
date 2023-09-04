# ./ci/pre-remove.sh

echo "STAGE: ${STAGE}"

# Prevent removal of the production environment unless in GitHub Actions
if [ "$STAGE" = "prod" ] && [ -z "$GITHUB_ACTIONS" ]; then
  echo "Prod removals should only be executed in GitHub Actions."
  exit 1
fi
