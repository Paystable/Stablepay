# 🚀 StablePay APY - Google Cloud Deployment Guide

This comprehensive guide will help you deploy your StablePay APY application to Google Cloud Platform without errors.

## 📋 Quick Start (Recommended)

### 1. Prerequisites Setup

```bash
# Install Google Cloud CLI
# Visit: https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID
```

### 2. One-Command Deployment

```bash
# Run the complete deployment script
./deploy-complete.sh $PROJECT_ID
```

This single command will:
- ✅ Check prerequisites
- ✅ Enable required APIs
- ✅ Build the application
- ✅ Create and push Docker image
- ✅ Deploy to Cloud Run
- ✅ Run health checks
- ✅ Show deployment summary

## 🔧 Step-by-Step Deployment

If you prefer manual control, follow these steps:

### Step 1: Set Up Secrets

```bash
# Set up secrets interactively
./setup-secrets.sh $PROJECT_ID
```

This will guide you through creating:
- MongoDB URI
- Cashfree API credentials
- Session secrets
- Optional: Exchange rate API key, Sentry DSN

### Step 2: Deploy the Application

```bash
# Deploy using the main script
./deploy.sh $PROJECT_ID
```

### Step 3: Verify Deployment

```bash
# Get your service URL
gcloud run services describe stablepay-apy --region=us-central1 --format="value(status.url)"

# Test health endpoint
curl https://your-service-url/health
```

## 🏗️ Architecture Overview

Your application will be deployed with:

- **Google Cloud Run**: Serverless container platform
- **Container Registry**: Docker image storage
- **Secret Manager**: Secure credential storage
- **Cloud Logging**: Application logs
- **Cloud Monitoring**: Performance metrics

## 📁 Files Created for Deployment

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production container |
| `cloudbuild.yaml` | Automated build configuration |
| `deploy-complete.sh` | Complete deployment script |
| `deploy.sh` | Basic deployment script |
| `setup-secrets.sh` | Secrets management script |
| `.gcloudignore` | Files to exclude from deployment |
| `env.production` | Production environment template |

## 🔐 Security Features

- **Non-root user**: Application runs as non-root
- **Secrets management**: Sensitive data in Secret Manager
- **HTTPS**: Automatic SSL termination
- **CORS**: Configurable cross-origin policies
- **Health checks**: Built-in monitoring

## 📊 Performance Configuration

- **Memory**: 2GB
- **CPU**: 2 vCPUs
- **Min Instances**: 1 (always running)
- **Max Instances**: 10 (auto-scales)
- **Concurrency**: 100 requests per instance
- **Timeout**: 300 seconds

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check Docker is running
docker --version

# Clean build cache
docker system prune -a

# Rebuild from scratch
docker build --no-cache -t gcr.io/$PROJECT_ID/stablepay-apy:latest .
```

#### 2. Authentication Issues
```bash
# Re-authenticate
gcloud auth login
gcloud auth configure-docker

# Check current account
gcloud auth list
```

#### 3. Permission Issues
```bash
# Check project permissions
gcloud projects get-iam-policy $PROJECT_ID

# Ensure you have these roles:
# - Cloud Run Admin
# - Storage Admin
# - Secret Manager Admin
```

#### 4. Service Not Starting
```bash
# Check logs
gcloud run logs read stablepay-apy --region=us-central1

# Check service status
gcloud run services describe stablepay-apy --region=us-central1
```

### Debug Commands

```bash
# View service configuration
gcloud run services describe stablepay-apy --region=us-central1 --format="export"

# Check secrets
gcloud secrets list

# Test health endpoint
curl -v https://your-service-url/health

# View recent logs
gcloud run logs read stablepay-apy --region=us-central1 --limit=50
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Quick update
./deploy-complete.sh $PROJECT_ID

# Or manual update
docker build -t gcr.io/$PROJECT_ID/stablepay-apy:latest .
docker push gcr.io/$PROJECT_ID/stablepay-apy:latest
gcloud run deploy stablepay-apy --image gcr.io/$PROJECT_ID/stablepay-apy:latest --region=us-central1
```

### Updating Secrets

```bash
# Update specific secret
echo "new-secret-value" | gcloud secrets versions add secret-name --data-file=-

# Update service with new secrets
gcloud run services update stablepay-apy --region=us-central1 --set-secrets=SECRET_NAME=secret-name:latest
```

### Scaling

```bash
# Update scaling parameters
gcloud run services update stablepay-apy \
    --region=us-central1 \
    --min-instances=2 \
    --max-instances=20 \
    --memory=4Gi \
    --cpu=4
```

## 📈 Monitoring and Logging

### View Logs
```bash
# Real-time logs
gcloud run logs tail stablepay-apy --region=us-central1

# Historical logs
gcloud run logs read stablepay-apy --region=us-central1 --limit=100
```

### Monitor Performance
- Visit [Google Cloud Console](https://console.cloud.google.com)
- Navigate to Cloud Run → stablepay-apy
- View metrics, logs, and performance data

## 💰 Cost Optimization

### Tips to Reduce Costs

1. **Adjust Min Instances**: Set to 0 if you can tolerate cold starts
2. **Optimize Memory**: Monitor usage and adjust accordingly
3. **Set Max Instances**: Limit based on expected traffic
4. **Use Preemptible**: For non-critical workloads
5. **Monitor Usage**: Set up billing alerts

### Cost Estimation

For typical usage:
- **Min instances (1)**: ~$25/month
- **Memory (2GB)**: ~$15/month
- **CPU (2 vCPUs)**: ~$30/month
- **Requests**: $0.40 per million requests
- **Total**: ~$70-100/month for moderate usage

## 🔒 Security Best Practices

1. **Regular Updates**: Keep dependencies updated
2. **Secret Rotation**: Rotate secrets regularly
3. **Access Control**: Use least privilege principle
4. **Monitoring**: Set up security alerts
5. **Backup**: Regular data backups

## 📞 Support and Resources

### Documentation
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Cloud Build Docs](https://cloud.google.com/build/docs)
- [Secret Manager Docs](https://cloud.google.com/secret-manager/docs)

### Getting Help
- Check application logs first
- Review Google Cloud Console
- Consult Google Cloud documentation
- Contact Google Cloud support if needed

## 🎯 Next Steps After Deployment

1. **Custom Domain**: Set up your own domain
2. **SSL Certificate**: Configure custom SSL
3. **CDN**: Set up Cloud CDN for better performance
4. **Monitoring**: Configure alerts and dashboards
5. **CI/CD**: Set up automated deployments
6. **Backup**: Implement data backup strategy

## ✅ Deployment Checklist

Before deploying:
- [ ] Google Cloud account with billing enabled
- [ ] Google Cloud CLI installed and authenticated
- [ ] Docker installed and running
- [ ] Node.js 20+ installed
- [ ] Project ID set

After deployment:
- [ ] Service is running and accessible
- [ ] Health check passes
- [ ] Secrets are properly configured
- [ ] Logs are being generated
- [ ] Monitoring is set up

---

**🎉 Congratulations!** Your StablePay APY application is now running on Google Cloud Platform with enterprise-grade reliability, security, and scalability.
