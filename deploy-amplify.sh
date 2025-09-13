#!/bin/bash

# AWS Amplify Deployment Script for StablePay
echo "🚀 Starting AWS Amplify deployment for StablePay..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "❌ AWS Amplify CLI is not installed. Please install it first."
    echo "Run: npm install -g @aws-amplify/cli"
    exit 1
fi

# Check if user is logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Initialize Amplify if not already initialized
if [ ! -d "amplify" ]; then
    echo "🔧 Initializing Amplify..."
    amplify init --yes
else
    echo "✅ Amplify already initialized"
fi

# Add API if not exists
if ! amplify status | grep -q "stablepayapi"; then
    echo "🔧 Adding API Gateway..."
    amplify add api --yes
else
    echo "✅ API Gateway already exists"
fi

# Add storage if not exists
if ! amplify status | grep -q "stablepaydynamodb"; then
    echo "🔧 Adding DynamoDB storage..."
    amplify add storage --yes
else
    echo "✅ DynamoDB storage already exists"
fi

# Add function if not exists
if ! amplify status | grep -q "stablepayapifunction"; then
    echo "🔧 Adding Lambda function..."
    amplify add function --yes
else
    echo "✅ Lambda function already exists"
fi

# Deploy backend
echo "🚀 Deploying backend services..."
amplify push --yes

# Get API URL
echo "🔍 Getting API URL..."
API_URL=$(amplify status | grep "stablepayapi" | grep "https" | awk '{print $3}')

if [ -z "$API_URL" ]; then
    echo "❌ Could not retrieve API URL. Please check the deployment."
    exit 1
fi

echo "✅ Backend deployed successfully!"
echo "🌐 API URL: $API_URL"

# Update frontend environment
echo "🔧 Updating frontend configuration..."
echo "REACT_APP_API_URL=$API_URL" > client/.env.production

echo "✅ Frontend configuration updated"

# Build frontend
echo "🔨 Building frontend..."
cd client
npm install
npm run build
cd ..

echo "✅ Frontend built successfully"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Go to AWS Amplify Console"
echo "2. Connect your Git repository"
echo "3. Set environment variable: REACT_APP_API_URL=$API_URL"
echo "4. Deploy the frontend"
echo ""
echo "API Endpoints available:"
echo "- POST $API_URL/api/early-access/submit"
echo "- GET $API_URL/api/early-access/submissions"
echo "- GET $API_URL/api/early-access/stats"
echo "- PUT $API_URL/api/early-access/submissions/{id}"
echo "- DELETE $API_URL/api/early-access/submissions/{id}"
echo ""
echo "Admin panel will be available at: https://your-domain.com/admin-early-access"
