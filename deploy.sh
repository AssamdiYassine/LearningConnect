#!/bin/bash

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Clean the dist directory if it exists
echo "Cleaning dist directory..."
rm -rf dist

# Build the application
echo "Building the application..."
npm run build

# Verify the build
if [ ! -f "dist/index.js" ]; then
    echo "Error: Build failed - dist/index.js not found"
    exit 1
fi

# Install PM2 globally if not installed
echo "Installing PM2..."
npm install -g pm2

# Stop any existing instances
echo "Stopping any existing instances..."
pm2 stop learning-connect || true
pm2 delete learning-connect || true

# Start the application with PM2 using the new config
echo "Starting application with PM2..."
pm2 start pm2.config.cjs

# Verify PM2 process
if ! pm2 list | grep -q "learning-connect"; then
    echo "Error: Application failed to start with PM2"
    exit 1
fi

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save --force

echo "Deployment completed!"
echo "To check the status of your application, run: pm2 status"
echo "To view logs, run: pm2 logs learning-connect" 