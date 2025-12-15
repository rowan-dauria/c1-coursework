#!/bin/bash

# Function for timestamped logging
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log "Stopping services and removing containers, networks, volumes, and local images..."
docker compose down --volumes --remove-orphans --rmi local

log "Performing system prune to remove unused data..."
docker system prune -f

log "Cleanup complete."