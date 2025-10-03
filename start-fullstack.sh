#!/bin/bash

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "/workspaces/spark-template/backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd /workspaces/spark-template/backend
    npm install
fi

# Start the backend server
echo "Starting backend server..."
cd /workspaces/spark-template/backend
npm run dev &

# Start the frontend server
echo "Starting frontend server..."
cd /workspaces/spark-template
npm run dev