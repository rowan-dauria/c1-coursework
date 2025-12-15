#!/bin/bash

# Function for timestamped logging
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# Default to detached mode and production compose file
DETACHED="-d"
COMPOSE_FILE="docker-compose.yml"

# Parse arguments
for arg in "$@"
do
    case $arg in
        -d|--dev)
        DETACHED=""
        COMPOSE_FILE="docker-compose.dev.yml"
        shift # Remove --dev from processing
        ;;
    esac
done

if [ -z "$DETACHED" ]; then
    log "Starting in DEV mode (attached, verbose logging)..."
else
    log "Starting in BACKGROUND mode..."
fi

log "Using compose file: $COMPOSE_FILE"

docker compose -f $COMPOSE_FILE up --build $DETACHED

log "Startup command executed."