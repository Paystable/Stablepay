#!/bin/bash

# StablePay APY - Google Cloud Secrets Setup Script
# This script helps you set up secrets in Google Secret Manager

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=""
SERVICE_NAME="stablepay-apy"
REGION="us-central1"

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
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

# Function to enable Secret Manager API
enable_secret_manager() {
    print_status "Enabling Secret Manager API..."
    
    gcloud services enable secretmanager.googleapis.com
    
    print_success "Secret Manager API enabled"
}

# Function to create secrets interactively
create_secrets() {
    print_status "Creating secrets in Google Secret Manager..."
    
    # MongoDB URI
    echo ""
    print_warning "MongoDB URI is required for database connectivity."
    read -p "Enter your MongoDB URI (or press Enter to skip): " mongodb_uri
    
    if [ ! -z "$mongodb_uri" ]; then
        echo "$mongodb_uri" | gcloud secrets create mongodb-uri --data-file=-
        print_success "MongoDB URI secret created"
    else
        print_warning "Skipping MongoDB URI (you can create it later)"
    fi
    
    # Cashfree API Key
    echo ""
    print_warning "Cashfree API Key is required for KYC services."
    read -p "Enter your Cashfree API Key (or press Enter to skip): " cashfree_api_key
    
    if [ ! -z "$cashfree_api_key" ]; then
        echo "$cashfree_api_key" | gcloud secrets create cashfree-api-key --data-file=-
        print_success "Cashfree API Key secret created"
    else
        print_warning "Skipping Cashfree API Key (you can create it later)"
    fi
    
    # Cashfree Secret Key
    echo ""
    print_warning "Cashfree Secret Key is required for KYC services."
    read -p "Enter your Cashfree Secret Key (or press Enter to skip): " cashfree_secret_key
    
    if [ ! -z "$cashfree_secret_key" ]; then
        echo "$cashfree_secret_key" | gcloud secrets create cashfree-secret-key --data-file=-
        print_success "Cashfree Secret Key secret created"
    else
        print_warning "Skipping Cashfree Secret Key (you can create it later)"
    fi
    
    # Session Secret
    echo ""
    print_warning "Session Secret is required for secure session management."
    read -p "Enter a secure session secret (32+ characters, or press Enter to generate): " session_secret
    
    if [ -z "$session_secret" ]; then
        session_secret=$(openssl rand -base64 32)
        print_status "Generated session secret"
    fi
    
    echo "$session_secret" | gcloud secrets create session-secret --data-file=-
    print_success "Session Secret created"
    
    # Exchange Rate API Key (optional)
    echo ""
    print_warning "Exchange Rate API Key is optional but recommended for real-time rates."
    read -p "Enter your Exchange Rate API Key (or press Enter to skip): " exchange_rate_key
    
    if [ ! -z "$exchange_rate_key" ]; then
        echo "$exchange_rate_key" | gcloud secrets create exchange-rate-api-key --data-file=-
        print_success "Exchange Rate API Key secret created"
    else
        print_warning "Skipping Exchange Rate API Key"
    fi
    
    # Sentry DSN (optional)
    echo ""
    print_warning "Sentry DSN is optional but recommended for error tracking."
    read -p "Enter your Sentry DSN (or press Enter to skip): " sentry_dsn
    
    if [ ! -z "$sentry_dsn" ]; then
        echo "$sentry_dsn" | gcloud secrets create sentry-dsn --data-file=-
        print_success "Sentry DSN secret created"
    else
        print_warning "Skipping Sentry DSN"
    fi
}

# Function to grant permissions to Cloud Run service
grant_permissions() {
    print_status "Granting permissions to Cloud Run service..."
    
    # Get the default compute service account
    SERVICE_ACCOUNT=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")-compute@developer.gserviceaccount.com
    
    # Grant access to secrets
    secrets=("mongodb-uri" "cashfree-api-key" "cashfree-secret-key" "session-secret" "exchange-rate-api-key" "sentry-dsn")
    
    for secret in "${secrets[@]}"; do
        if gcloud secrets describe $secret &> /dev/null; then
            gcloud secrets add-iam-policy-binding $secret \
                --member="serviceAccount:$SERVICE_ACCOUNT" \
                --role="roles/secretmanager.secretAccessor" &> /dev/null
            print_success "Granted access to $secret"
        fi
    done
}

# Function to update Cloud Run service with secrets
update_cloud_run() {
    print_status "Updating Cloud Run service with secrets..."
    
    # Build the command with available secrets
    SECRET_ARGS=""
    
    if gcloud secrets describe mongodb-uri &> /dev/null; then
        SECRET_ARGS="$SECRET_ARGS --set-secrets=MONGODB_URI=mongodb-uri:latest"
    fi
    
    if gcloud secrets describe cashfree-api-key &> /dev/null; then
        SECRET_ARGS="$SECRET_ARGS --set-secrets=CASHFREE_API_KEY=cashfree-api-key:latest"
    fi
    
    if gcloud secrets describe cashfree-secret-key &> /dev/null; then
        SECRET_ARGS="$SECRET_ARGS --set-secrets=CASHFREE_SECRET_KEY=cashfree-secret-key:latest"
    fi
    
    if gcloud secrets describe session-secret &> /dev/null; then
        SECRET_ARGS="$SECRET_ARGS --set-secrets=SESSION_SECRET=session-secret:latest"
    fi
    
    if gcloud secrets describe exchange-rate-api-key &> /dev/null; then
        SECRET_ARGS="$SECRET_ARGS --set-secrets=EXCHANGE_RATE_API_KEY=exchange-rate-api-key:latest"
    fi
    
    if gcloud secrets describe sentry-dsn &> /dev/null; then
        SECRET_ARGS="$SECRET_ARGS --set-secrets=SENTRY_DSN=sentry-dsn:latest"
    fi
    
    if [ ! -z "$SECRET_ARGS" ]; then
        gcloud run services update $SERVICE_NAME \
            --region=$REGION \
            $SECRET_ARGS
        
        print_success "Cloud Run service updated with secrets"
    else
        print_warning "No secrets found to update"
    fi
}

# Function to list created secrets
list_secrets() {
    print_status "Listing created secrets..."
    
    gcloud secrets list --filter="name:mongodb-uri OR name:cashfree-api-key OR name:cashfree-secret-key OR name:session-secret OR name:exchange-rate-api-key OR name:sentry-dsn"
}

# Function to show next steps
show_next_steps() {
    print_success "Secrets setup completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Deploy your application: ./deploy.sh $PROJECT_ID"
    echo "2. Test the deployment: curl https://your-service-url/health"
    echo "3. Check logs: gcloud run logs read $SERVICE_NAME --region=$REGION"
    echo ""
    print_status "Your secrets are now securely stored in Google Secret Manager"
}

# Main function
main() {
    print_status "Starting secrets setup for StablePay APY..."
    
    check_prerequisites
    enable_secret_manager
    create_secrets
    grant_permissions
    update_cloud_run
    list_secrets
    show_next_steps
}

# Check if PROJECT_ID is provided as argument
if [ $# -eq 1 ]; then
    PROJECT_ID=$1
fi

# Run main function
main
