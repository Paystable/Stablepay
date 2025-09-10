#!/bin/bash

# StablePay APY - Complete Google Cloud Deployment Script
# This script handles the entire deployment process from start to finish

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Function to check if gcloud is installed and authenticated
check_prerequisites() {
    print_step "Checking prerequisites..."
    
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
    print_step "Enabling required Google Cloud APIs..."
    
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    gcloud services enable secretmanager.googleapis.com
    
    print_success "APIs enabled successfully"
}

# Function to set up secrets
setup_secrets() {
    print_step "Setting up secrets..."
    
    # Check if secrets already exist
    if gcloud secrets describe mongodb-uri &> /dev/null; then
        print_warning "Secrets already exist. Skipping secret creation."
        print_status "If you need to update secrets, run: ./setup-secrets.sh $PROJECT_ID"
    else
        print_status "No secrets found. Please run the secrets setup script first:"
        print_status "./setup-secrets.sh $PROJECT_ID"
        print_warning "Continuing with deployment without secrets..."
    fi
}

# Function to build the application
build_application() {
    print_step "Building the application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    
    # Build the application
    print_status "Building client and server..."
    npm run build
    
    print_success "Application built successfully"
}

# Function to build and push the Docker image
build_and_push() {
    print_step "Building and pushing Docker image..."
    
    # Build the image
    print_status "Building Docker image..."
    docker build -t $IMAGE_NAME:latest .
    
    # Configure Docker to use gcloud as a credential helper
    gcloud auth configure-docker
    
    # Push the image
    print_status "Pushing Docker image to Container Registry..."
    docker push $IMAGE_NAME:latest
    
    print_success "Docker image built and pushed successfully"
}

# Function to deploy to Cloud Run
deploy_to_cloud_run() {
    print_step "Deploying to Google Cloud Run..."
    
    # Build the deployment command
    DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
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
        --set-env-vars PORT=8080"
    
    # Add secrets if they exist
    if gcloud secrets describe mongodb-uri &> /dev/null; then
        DEPLOY_CMD="$DEPLOY_CMD --set-secrets=MONGODB_URI=mongodb-uri:latest"
    fi
    
    if gcloud secrets describe cashfree-api-key &> /dev/null; then
        DEPLOY_CMD="$DEPLOY_CMD --set-secrets=CASHFREE_API_KEY=cashfree-api-key:latest"
    fi
    
    if gcloud secrets describe cashfree-secret-key &> /dev/null; then
        DEPLOY_CMD="$DEPLOY_CMD --set-secrets=CASHFREE_SECRET_KEY=cashfree-secret-key:latest"
    fi
    
    if gcloud secrets describe session-secret &> /dev/null; then
        DEPLOY_CMD="$DEPLOY_CMD --set-secrets=SESSION_SECRET=session-secret:latest"
    fi
    
    if gcloud secrets describe exchange-rate-api-key &> /dev/null; then
        DEPLOY_CMD="$DEPLOY_CMD --set-secrets=EXCHANGE_RATE_API_KEY=exchange-rate-api-key:latest"
    fi
    
    if gcloud secrets describe sentry-dsn &> /dev/null; then
        DEPLOY_CMD="$DEPLOY_CMD --set-secrets=SENTRY_DSN=sentry-dsn:latest"
    fi
    
    # Execute the deployment
    eval $DEPLOY_CMD
    
    print_success "Deployment to Cloud Run completed"
}

# Function to get the service URL
get_service_url() {
    print_step "Getting service URL..."
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    
    print_success "Service deployed successfully!"
    print_status "Service URL: $SERVICE_URL"
    print_status "Health check: $SERVICE_URL/health"
}

# Function to run health check
health_check() {
    print_step "Running health check..."
    
    if [ -z "$SERVICE_URL" ]; then
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    fi
    
    # Wait a moment for the service to be ready
    print_status "Waiting for service to be ready..."
    sleep 15
    
    # Check health endpoint
    print_status "Checking health endpoint..."
    if curl -f -s "$SERVICE_URL/health" > /dev/null; then
        print_success "Health check passed!"
        print_status "Your application is running successfully!"
    else
        print_warning "Health check failed. The service might still be starting up."
        print_status "You can check the logs with: gcloud run logs read $SERVICE_NAME --region=$REGION"
        print_status "Or visit the service URL manually: $SERVICE_URL"
    fi
}

# Function to show deployment summary
show_summary() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "📋 Deployment Summary:"
    echo "  • Project ID: $PROJECT_ID"
    echo "  • Service Name: $SERVICE_NAME"
    echo "  • Region: $REGION"
    echo "  • Service URL: $SERVICE_URL"
    echo ""
    print_status "🔧 Next Steps:"
    echo "  1. Test your application: $SERVICE_URL"
    echo "  2. Check health: $SERVICE_URL/health"
    echo "  3. View logs: gcloud run logs read $SERVICE_NAME --region=$REGION"
    echo "  4. Monitor metrics in Google Cloud Console"
    echo ""
    print_status "📚 Useful Commands:"
    echo "  • Update secrets: ./setup-secrets.sh $PROJECT_ID"
    echo "  • View service: gcloud run services describe $SERVICE_NAME --region=$REGION"
    echo "  • Delete service: gcloud run services delete $SERVICE_NAME --region=$REGION"
    echo ""
    print_warning "⚠️  Remember to:"
    echo "  • Configure your custom domain (optional)"
    echo "  • Set up monitoring and alerting"
    echo "  • Configure backup strategies"
    echo "  • Review security settings"
}

# Function to handle errors
handle_error() {
    print_error "Deployment failed at step: $1"
    print_status "You can try to continue from where it failed or start over."
    print_status "Check the logs above for more details."
    exit 1
}

# Main deployment function
main() {
    print_status "🚀 Starting complete StablePay APY deployment to Google Cloud..."
    echo ""
    
    # Set up error handling
    trap 'handle_error "Unknown"' ERR
    
    check_prerequisites
    enable_apis
    setup_secrets
    build_application
    build_and_push
    deploy_to_cloud_run
    get_service_url
    health_check
    show_summary
}

# Check if PROJECT_ID is provided as argument
if [ $# -eq 1 ]; then
    PROJECT_ID=$1
fi

# Check if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "StablePay APY - Complete Google Cloud Deployment Script"
    echo ""
    echo "Usage: $0 [PROJECT_ID]"
    echo ""
    echo "Arguments:"
    echo "  PROJECT_ID    Your Google Cloud Project ID"
    echo ""
    echo "Examples:"
    echo "  $0 my-project-id"
    echo "  export PROJECT_ID=my-project-id && $0"
    echo ""
    echo "Prerequisites:"
    echo "  • Google Cloud CLI installed and authenticated"
    echo "  • Docker installed"
    echo "  • Node.js 20+ installed"
    echo "  • Google Cloud Project with billing enabled"
    echo ""
    echo "This script will:"
    echo "  1. Check prerequisites"
    echo "  2. Enable required APIs"
    echo "  3. Set up secrets (if needed)"
    echo "  4. Build the application"
    echo "  5. Build and push Docker image"
    echo "  6. Deploy to Cloud Run"
    echo "  7. Run health checks"
    echo "  8. Show deployment summary"
    exit 0
fi

# Run main function
main
