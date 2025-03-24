#!/bin/bash

# JMeter Compare Tool Startup Script

echo "Starting JMeter Compare Tool..."
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js (v14.x or later)."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm (v6.x or later)."
    exit 1
fi

# Install dependencies if node_modules directory doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "Dependencies installed."
fi

# Start the application
echo "Starting development server..."
npm start

exit 0 