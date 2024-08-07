#!/bin/bash

# set -o errexit
# set -o xtrace

# Check if a command is passed
if [ $# -eq 0 ]; then
    echo "No command provided. Usage: $0 <command>"
    exit 1
fi

# Concatenate all arguments to form the command to be executed
COMMAND="$@"

# Changes the output of docker container to have a valid "localhost" url
NORMALIZE_URL="sed 's|0.0.0.0|localhost|g'"

# Configuration
DOCKER_IMAGE="mcr.microsoft.com/playwright:v1.44.1-jammy"

# Run the Docker container with the specified configuration and pass the command
docker run -p 5400:5400 \
  --rm \
  -i \
  -t \
  --add-host=host.docker.internal:host-gateway \
  -v $PWD/../:/monorepo \
  -w /monorepo/e2e \
  -e USE_EXTERNAL_HOST=true \
  $DOCKER_IMAGE \
  /bin/bash -c "$COMMAND | $NORMALIZE_URL"