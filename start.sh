#!/bin/bash
set -e

echo "Starting Short Video Maker MCP Server..."
echo "Working directory: $(pwd)"
echo "Contents: $(ls -la)"

# Set default port
export PORT=${PORT:-3123}
echo "PORT set to: $PORT"

# Check if dist/index.js exists
if [ ! -f "dist/index.js" ]; then
    echo "ERROR: dist/index.js not found!"
    echo "Available files in dist/:"
    ls -la dist/ || echo "dist/ directory not found"
    exit 1
fi

echo "Starting Node.js application..."
exec node dist/index.js
