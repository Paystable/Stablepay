#!/bin/bash

echo "🚀 Starting Static Deployment for StablePay..."

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

# Create S3 bucket for hosting
BUCKET_NAME="stablepay-$(date +%s)"
print_status "Creating S3 bucket for hosting: $BUCKET_NAME"

aws s3 mb s3://$BUCKET_NAME --region us-east-1

if [ $? -eq 0 ]; then
    print_success "S3 bucket created successfully"
else
    print_error "Failed to create S3 bucket"
    exit 1
fi

# Upload frontend files
print_status "Uploading frontend files to S3..."
aws s3 sync client/dist/ s3://$BUCKET_NAME --region us-east-1

if [ $? -eq 0 ]; then
    print_success "Frontend files uploaded successfully"
else
    print_error "Failed to upload frontend files"
    exit 1
fi

# Configure bucket for website hosting
print_status "Configuring S3 bucket for website hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public read
print_status "Setting bucket policy for public access..."
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

print_success "🎉 Static deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "======================"
echo "🌐 Website URL: $WEBSITE_URL"
echo "📊 Admin Panel: $WEBSITE_URL/admin-early-access"
echo "🗄️ Database: Not configured (frontend only)"
echo "⚡ Backend: Not configured (frontend only)"
echo ""
echo "🔧 Next Steps:"
echo "1. Visit your website: $WEBSITE_URL"
echo "2. Test the early access form (will show errors without backend)"
echo "3. Access admin panel: $WEBSITE_URL/admin-early-access"
echo "4. To add backend, follow DEPLOYMENT-PERMISSIONS-REQUIRED.md"
echo ""
echo "💡 To update the website, run: aws s3 sync client/dist/ s3://$BUCKET_NAME"
echo ""

print_success "Static deployment complete! Your StablePay frontend is now live on AWS S3!"
