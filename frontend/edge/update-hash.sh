#!/bin/bash

# update-hash.sh

# Get the file matching the pattern
FILE_NAME=$(ls ../dist/assets/index-*.js | xargs -n 1 basename)
echo "FILE_NAME: ${FILE_NAME}"

# Extract hash value
HASH_VALUE=$(echo $FILE_NAME | awk -F'index-' '{print $2}' | awk -F'.js' '{print $1}')
echo "HASH_VALUE: ${HASH_VALUE}"

# Replace in .ts file
sed -i.bak "s/index-.*.js/index-$HASH_VALUE.js/g" bot-intercept.ts

# Optionally, remove the backup
# rm bot-intercept.ts.bak
