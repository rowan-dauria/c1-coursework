#!/bin/bash

# Function for timestamped logging
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# Default to detached mode
DETACHED="-d"

# Parse arguments
for arg in "$@"
do
    case $arg in
        -d|--dev)
        DETACHED=""
        shift # Remove --dev from processing
        ;;
    esac
done

if [ -z "$DETACHED" ]; then
    log "Starting in DEV mode (attached, verbose logging)..."
else
    log "Starting in BACKGROUND mode..."
fi

docker compose up --build $DETACHED

log "Startup command executed."