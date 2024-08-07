#!/bin/bash

# File containing environment variables
ENV_FILE=".env.local"

# Check if the .env.local file exists
if [[ ! -f $ENV_FILE ]]; then
    echo "File $ENV_FILE does not exist."
    exit 1
fi

# Read and export environment variables from .env.local
while IFS='=' read -r key value; do
    # Ignore comments and empty lines
    if [[ ! $key =~ ^# && -n $key ]]; then
        export "$key=$value"
    fi
done < "$ENV_FILE"

# Set the environment variables for all child process
export VITE_APP_SISENSE_URL="$E2E_SISENSE_URL"
export VITE_APP_SISENSE_TOKEN="$E2E_SISENSE_TOKEN"

# Preparation scripts
configura_angular_env="node ./scripts/configure-angular-demo-env.cjs";

# Define the servers with their start commands and URLs to check
server_commands=(
    "yarn workspace react-ts-demo dev --port 5300 --host"
    "yarn workspace @sisense/sdk-ui dev --port 5301 --host"
    "yarn workspace @sisense/sdk-ui storybook --port 5302 --no-open"
    "yarn workspace vue-ts-demo dev --port 5303 --host"
    "yarn workspace angular-demo start --port 5304 --disable-host-check --host='0.0.0.0'"
)
server_urls=(
    "http://localhost:5300"
    "http://localhost:5301"
    "http://localhost:5302"
    "http://localhost:5303"
    "http://localhost:5304"
)


# Function to start a command in a subshell
start_command() {
    $1 > /dev/null 2>&1 &
    pid=$!  # Capture the PID of the subshell
    pids+=($pid)  # Store the PID
}

# Function to check if a URL is responding using curl
wait_for_url() {
    local url=$1
    while ! curl -s "$url" >/dev/null; do
        sleep 1
    done
}

# Array to hold PIDs
pids=()

# Check if a command is passed
if [ $# -eq 0 ]; then
    echo "No command provided. Usage: $0 <command>"
    exit 1
fi

# Concatenate all arguments to form the command to be executed
COMMAND="$@"

# Run preparation scripts
$configura_angular_env

# Start the servers
echo "Starting all servers..."

for cmd in "${server_commands[@]}"; do
    start_command "$cmd"
done

# Wait for all servers to be ready
for url in "${server_urls[@]}"; do
    wait_for_url "$url"
done

echo "All servers are up and running."

# Function to kill all servers
cleanup() {
    echo "Killing all servers..."
    for pid in "${pids[@]}"; do
        # Kill the main process and all child processes
        pkill -P $pid
    done
    echo "All servers are killed."
}

# Run the passed script
$COMMAND

# Trap the EXIT signal to ensure cleanup
trap cleanup EXIT
