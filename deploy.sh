#!/bin/bash

# StablePay APY - Google Cloud Deployment Script
# This script deploys the StablePay application to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=""
REGION="us-central1"
SERVICE_NAME="stablepay-apy"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if gcloud is installed and authenticated
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        print_status "Visit: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_error "No active gcloud authentication found."
        print_status "Please run: gcloud auth login"
        exit 1
    fi
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "PROJECT_ID is not set. Please set your Google Cloud Project ID."
        print_status "You can set it by running: export PROJECT_ID=your-project-id"
        exit 1
    fi
    
    # Set the project
    gcloud config set project $PROJECT_ID
    
    print_success "Prerequisites check passed"
}

# Function to enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    gcloud services enable secretmanager.googleapis.com
    
    print_success "APIs enabled successfully"
}

# Function to build and push the Docker image
build_and_push() {
    print_status "Building and pushing Docker image..."
    
    # Build the image
    docker build -t $IMAGE_NAME:latest .
    
    # Configure Docker to use gcloud as a credential helper
    gcloud auth configure-docker
    
    # Push the image
    docker push $IMAGE_NAME:latest
    
    print_success "Docker image built and pushed successfully"
}

# Function to deploy to Cloud Run
deploy_to_cloud_run() {
    print_status "Deploying to Google Cloud Run..."
    
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME:latest \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 8080 \
        --memory 2Gi \
        --cpu 2 \
        --max-instances 10 \
        --min-instances 1 \
        --concurrency 100 \
        --timeout 300 \
        --set-env-vars NODE_ENV=production \
        --set-env-vars PORT=8080
    
    print_success "Deployment to Cloud Run completed"
}

# Function to set up environment variables and secrets
setup_environment() {
    print_status "Setting up environment variables and secrets..."
    
    # Create secrets in Secret Manager (you'll need to set these values)
    print_warning "Please set up the following secrets in Google Secret Manager:"
    echo "1. MONGODB_URI"
    echo "2. CASHFREE_API_KEY"
    echo "3. CASHFREE_SECRET_KEY"
    echo "4. SESSION_SECRET"
    echo ""
    print_status "You can create secrets using:"
    echo "gcloud secrets create secret-name --data-file=-"
    echo ""
    
    # Example of how to create a secret (uncomment and modify as needed):
    # echo "your-mongodb-uri" | gcloud secrets create mongodb-uri --data-file=-
    # echo "your-cashfree-api-key" | gcloud secrets create cashfree-api-key --data-file=-
    # echo "your-cashfree-secret-key" | gcloud secrets create cashfree-secret-key --data-file=-
    # echo "your-session-secret" | gcloud secrets create session-secret --data-file=-
    
    print_success "Environment setup instructions provided"
}

# Function to get the service URL
get_service_url() {
    print_status "Getting service URL..."
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    
    print_success "Service deployed successfully!"
    print_status "Service URL: $SERVICE_URL"
    print_status "Health check: $SERVICE_URL/health"
}

# Function to run health check
health_check() {
    print_status "Running health check..."
    
    if [ -z "$SERVICE_URL" ]; then
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    fi
    
    # Wait a moment for the service to be ready
    sleep 10
    
    # Check health endpoint
    if curl -f -s "$SERVICE_URL/health" > /dev/null; then
        print_success "Health check passed!"
    else
        print_warning "Health check failed. The service might still be starting up."
        print_status "You can check the logs with: gcloud run logs read $SERVICE_NAME --region=$REGION"
    fi
}

# Main deployment function
main() {
    print_status "Starting StablePay APY deployment to Google Cloud..."
    
    check_prerequisites
    enable_apis
    build_and_push
    deploy_to_cloud_run
    setup_environment
    get_service_url
    health_check
    
    print_success "Deployment completed successfully!"
    print_status "Your StablePay APY application is now running on Google Cloud Run"
    print_status "Remember to configure your environment variables and secrets"
}

# Check if PROJECT_ID is provided as argument
if [ $# -eq 1 ]; then
    PROJECT_ID=$1
fi

# Run main function
main
