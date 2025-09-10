# StablePay APY - Google Cloud Deployment Guide

This guide will help you deploy the StablePay APY application to Google Cloud Platform using Cloud Run.

## Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account with billing enabled
2. **Google Cloud CLI**: Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install [Docker](https://docs.docker.com/get-docker/)
4. **Node.js**: Version 20 or higher

## Quick Start

### 1. Set up Google Cloud Project

```bash
# Set your project ID
export PROJECT_ID=your-project-id

# Authenticate with Google Cloud
gcloud auth login

# Set the project
gcloud config set project $PROJECT_ID
```

### 2. Run the Deployment Script

```bash
# Make the script executable (if not already done)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh $PROJECT_ID
```

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Build and Push Docker Image

```bash
# Build the image
docker build -t gcr.io/$PROJECT_ID/stablepay-apy:latest .

# Configure Docker to use gcloud
gcloud auth configure-docker

# Push the image
docker push gcr.io/$PROJECT_ID/stablepay-apy:latest
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy stablepay-apy \
    --image gcr.io/$PROJECT_ID/stablepay-apy:latest \
    --region us-central1 \
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
```

## Environment Variables and Secrets

### Required Secrets

You need to set up the following secrets in Google Secret Manager:

1. **MONGODB_URI**: Your MongoDB connection string
2. **CASHFREE_API_KEY**: Your Cashfree API key
3. **CASHFREE_SECRET_KEY**: Your Cashfree secret key
4. **SESSION_SECRET**: A secure random string for session management

### Setting up Secrets

```bash
# Create secrets
echo "your-mongodb-connection-string" | gcloud secrets create mongodb-uri --data-file=-
echo "your-cashfree-api-key" | gcloud secrets create cashfree-api-key --data-file=-
echo "your-cashfree-secret-key" | gcloud secrets create cashfree-secret-key --data-file=-
echo "your-session-secret" | gcloud secrets create session-secret --data-file=-

# Grant access to the Cloud Run service account
gcloud secrets add-iam-policy-binding mongodb-uri \
    --member="serviceAccount:your-service-account@your-project.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Environment Variables

The following environment variables are automatically set:

- `NODE_ENV=production`
- `PORT=8080`
- `HOST=0.0.0.0`

## Configuration Files

### Dockerfile

The application uses a multi-stage Docker build for optimal production deployment:

- **Builder stage**: Installs dependencies and builds the application
- **Production stage**: Creates a minimal runtime image with security best practices

### Cloud Build Configuration

The `cloudbuild.yaml` file configures automated builds and deployments:

- Builds the Docker image
- Pushes to Container Registry
- Deploys to Cloud Run with optimized settings

## Monitoring and Logging

### View Logs

```bash
# View recent logs
gcloud run logs read stablepay-apy --region=us-central1

# Follow logs in real-time
gcloud run logs tail stablepay-apy --region=us-central1
```

### Health Check

The application includes a health check endpoint at `/health` that returns the service status.

### Monitoring

- **Cloud Run Metrics**: Available in the Google Cloud Console
- **Application Logs**: Available through Cloud Logging
- **Error Tracking**: Configure Sentry DSN for error monitoring

## Scaling Configuration

The deployment is configured with:

- **Memory**: 2GB
- **CPU**: 2 vCPUs
- **Min Instances**: 1 (always running)
- **Max Instances**: 10 (auto-scales based on traffic)
- **Concurrency**: 100 requests per instance
- **Timeout**: 300 seconds

## Security Features

- **Non-root user**: Application runs as non-root user
- **Secrets management**: Sensitive data stored in Secret Manager
- **HTTPS**: Automatic HTTPS termination
- **CORS**: Configurable CORS settings
- **Health checks**: Built-in health monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are properly installed
   - Verify the Dockerfile syntax
   - Ensure all required files are present

2. **Deployment Failures**
   - Verify your Google Cloud authentication
   - Check that required APIs are enabled
   - Ensure you have sufficient permissions

3. **Runtime Errors**
   - Check the application logs
   - Verify environment variables are set correctly
   - Ensure secrets are accessible

### Debug Commands

```bash
# Check service status
gcloud run services describe stablepay-apy --region=us-central1

# View service configuration
gcloud run services describe stablepay-apy --region=us-central1 --format="export"

# Test the health endpoint
curl https://your-service-url/health
```

## Cost Optimization

- **Min instances**: Set to 1 to avoid cold starts
- **Max instances**: Limit based on expected traffic
- **Memory/CPU**: Adjust based on actual usage patterns
- **Region**: Choose the region closest to your users

## Updates and Rollbacks

### Updating the Application

```bash
# Build and deploy new version
./deploy.sh $PROJECT_ID

# Or manually
docker build -t gcr.io/$PROJECT_ID/stablepay-apy:latest .
docker push gcr.io/$PROJECT_ID/stablepay-apy:latest
gcloud run deploy stablepay-apy --image gcr.io/$PROJECT_ID/stablepay-apy:latest --region=us-central1
```

### Rollback

```bash
# List previous revisions
gcloud run revisions list --service=stablepay-apy --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic stablepay-apy --to-revisions=REVISION_NAME=100 --region=us-central1
```

## Support

For issues related to:

- **Google Cloud**: Check the [Google Cloud documentation](https://cloud.google.com/docs)
- **Application**: Check the application logs and this documentation
- **Deployment**: Verify your configuration and permissions

## Next Steps

After successful deployment:

1. Configure your custom domain (optional)
2. Set up monitoring and alerting
3. Configure backup strategies
4. Set up CI/CD pipeline for automated deployments
5. Implement proper logging and monitoring
