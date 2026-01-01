#!/bin/bash

set -e

echo "🚀 Starting SAM Local API..."

cd backend

# Start SAM Local API with Docker network and environment variables
sam local start-api \
  --docker-network friendlines-net \
  --port 3000 \
  --env-vars env.json

echo "API stopped."

