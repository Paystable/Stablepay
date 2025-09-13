#!/bin/bash

echo "🚀 Starting Manual AWS Deployment for StablePay..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

print_success "AWS CLI and credentials verified"

# Create DynamoDB table
print_status "Creating DynamoDB table..."
aws dynamodb create-table \
    --table-name EarlyAccessSubmissions \
    --attribute-definitions \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=email,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

if [ $? -eq 0 ]; then
    print_success "DynamoDB table created successfully"
else
    print_warning "DynamoDB table might already exist or creation failed"
fi

# Wait for table to be active
print_status "Waiting for DynamoDB table to be active..."
aws dynamodb wait table-exists --table-name EarlyAccessSubmissions --region us-east-1
print_success "DynamoDB table is active"

# Create Lambda function
print_status "Creating Lambda function..."

# Create deployment package
mkdir -p lambda-package
cp -r amplify/backend/function/stablepayapifunction/* lambda-package/
cd lambda-package
npm install --production
zip -r ../stablepay-api.zip .
cd ..
rm -rf lambda-package

# Create IAM role for Lambda
print_status "Creating IAM role for Lambda..."
aws iam create-role \
    --role-name StablePayLambdaRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }' || print_warning "Role might already exist"

# Attach policies to role
aws iam attach-role-policy \
    --role-name StablePayLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
    --role-name StablePayLambdaRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Wait for role to be ready
sleep 10

# Create Lambda function
aws lambda create-function \
    --function-name stablepay-api \
    --runtime nodejs18.x \
    --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/StablePayLambdaRole \
    --handler index.handler \
    --zip-file fileb://stablepay-api.zip \
    --timeout 30 \
    --memory-size 256 \
    --region us-east-1

if [ $? -eq 0 ]; then
    print_success "Lambda function created successfully"
else
    print_warning "Lambda function might already exist"
fi

# Create API Gateway
print_status "Creating API Gateway..."
REST_API_ID=$(aws apigateway create-rest-api \
    --name stablepay-api \
    --description "StablePay API Gateway" \
    --region us-east-1 \
    --query 'id' --output text)

if [ $? -eq 0 ]; then
    print_success "API Gateway created with ID: $REST_API_ID"
else
    print_error "Failed to create API Gateway"
    exit 1
fi

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id $REST_API_ID \
    --region us-east-1 \
    --query 'items[0].id' --output text)

# Create /api resource
API_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $REST_API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part api \
    --region us-east-1 \
    --query 'id' --output text)

# Create /api/early-access resource
EARLY_ACCESS_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $REST_API_ID \
    --parent-id $API_RESOURCE_ID \
    --path-part early-access \
    --region us-east-1 \
    --query 'id' --output text)

# Create /api/early-access/submit resource
SUBMIT_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $REST_API_ID \
    --parent-id $EARLY_ACCESS_RESOURCE_ID \
    --path-part submit \
    --region us-east-1 \
    --query 'id' --output text)

# Get Lambda function ARN
LAMBDA_ARN=$(aws lambda get-function \
    --function-name stablepay-api \
    --region us-east-1 \
    --query 'Configuration.FunctionArn' --output text)

# Add Lambda permission for API Gateway
aws lambda add-permission \
    --function-name stablepay-api \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:$(aws sts get-caller-identity --query Account --output text):$REST_API_ID/*/*" \
    --region us-east-1

# Create POST method for submit endpoint
aws apigateway put-method \
    --rest-api-id $REST_API_ID \
    --resource-id $SUBMIT_RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE \
    --region us-east-1

# Create integration for submit endpoint
aws apigateway put-integration \
    --rest-api-id $REST_API_ID \
    --resource-id $SUBMIT_RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
    --region us-east-1

# Deploy API
print_status "Deploying API Gateway..."
aws apigateway create-deployment \
    --rest-api-id $REST_API_ID \
    --stage-name prod \
    --region us-east-1

if [ $? -eq 0 ]; then
    print_success "API Gateway deployed successfully"
else
    print_error "Failed to deploy API Gateway"
    exit 1
fi

# Get API URL
API_URL="https://$REST_API_ID.execute-api.us-east-1.amazonaws.com/prod"
print_success "API URL: $API_URL"

# Build frontend
print_status "Building frontend..."
cd client
npm install
npm run build
cd ..

if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Create environment file for production
cat > client/.env.production << EOF
REACT_APP_API_URL=$API_URL
EOF

print_success "Environment file created with API URL: $API_URL"

# Create S3 bucket for hosting
BUCKET_NAME="stablepay-$(date +%s)"
print_status "Creating S3 bucket for hosting: $BUCKET_NAME"

aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Upload frontend files
print_status "Uploading frontend files to S3..."
aws s3 sync client/dist/ s3://$BUCKET_NAME --region us-east-1

# Configure bucket for website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public read
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
        }
    ]
}'

WEBSITE_URL="http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"

print_success "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "======================"
echo "🌐 Website URL: $WEBSITE_URL"
echo "🔗 API URL: $API_URL"
echo "📊 Admin Panel: $WEBSITE_URL/admin-early-access"
echo "🗄️ Database: DynamoDB (EarlyAccessSubmissions)"
echo "⚡ Lambda: stablepay-api"
echo "🚪 API Gateway: $REST_API_ID"
echo ""
echo "🔧 Next Steps:"
echo "1. Visit your website: $WEBSITE_URL"
echo "2. Test the early access form"
echo "3. Access admin panel: $WEBSITE_URL/admin-early-access"
echo "4. Check AWS Console for monitoring"
echo ""
echo "💡 To update the website, run: aws s3 sync client/dist/ s3://$BUCKET_NAME"
echo ""

# Clean up
rm -f stablepay-api.zip

print_success "Deployment complete! Your StablePay platform is now live on AWS!"
