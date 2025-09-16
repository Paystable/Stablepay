#!/bin/bash

# Script to create SPA routes for S3 static hosting
# This ensures all client-side routes work properly

echo "Creating SPA routes for S3 static hosting..."

# Define all the routes that need to be created
routes=(
    "early-access"
    "admin-early-access"
    "dashboard"
    "p2p"
    "investors"
    "kyc"
    "travel-rule"
)

# Create directories and copy index.html for each route
for route in "${routes[@]}"; do
    echo "Creating route: /$route"
    mkdir -p "dist/public/$route"
    cp "dist/public/index.html" "dist/public/$route/index.html"
done

echo "SPA routes created successfully!"
echo "Routes created:"
for route in "${routes[@]}"; do
    echo "  - /$route"
done
