# AWS Amplify Deployment Setup

## Prerequisites Setup

To deploy this project to AWS Amplify, you need to complete these steps:

### 1. AWS Account Setup
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create an AWS account if you don't have one
3. Sign in to your AWS account

### 2. Configure AWS CLI
Run these commands in your terminal:

```bash
# Configure AWS CLI with your credentials
aws configure

# You'll be prompted to enter:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (use: us-east-1)
# - Default output format (use: json)
```

### 3. Get AWS Credentials
1. Go to AWS Console → IAM → Users
2. Create a new user or use existing user
3. Attach policies: `AdministratorAccess-Amplify`, `AdministratorAccess`
4. Create access key for the user
5. Use these credentials in `aws configure`

### 4. Deploy the Project
Once AWS CLI is configured, run:

```bash
# Make the script executable
chmod +x deploy-amplify.sh

# Run the deployment
./deploy-amplify.sh
```

## Alternative: Manual Deployment

If you prefer to deploy manually:

### Step 1: Initialize Amplify
```bash
amplify init
# Follow the prompts:
# - Project name: stablepayapy
# - Environment: dev
# - Default editor: Visual Studio Code
# - App type: javascript
# - Framework: react
# - Source directory: client/src
# - Distribution directory: client/dist
# - Build command: cd client && npm run build
# - Start command: cd client && npm start
```

### Step 2: Add Backend Services
```bash
# Add API Gateway
amplify add api
# Choose: REST
# API name: stablepayapi
# Path: /api
# Lambda function: stablepayapifunction
# Enable CORS: Yes

# Add DynamoDB
amplify add storage
# Choose: DynamoDB
# Table name: stablepaydynamodb
# Partition key: email (String)

# Add Lambda function
amplify add function
# Name: stablepayapifunction
# Runtime: Node.js 18.x
# Template: Serverless ExpressJS function
```

### Step 3: Deploy Backend
```bash
amplify push
```

### Step 4: Deploy Frontend
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Set build settings:
   - Build command: `cd client && npm run build`
   - Base directory: `client`
   - Output directory: `client/dist`
5. Add environment variable: `REACT_APP_API_URL` = your API URL
6. Deploy

## Current Project Status

✅ **Completed:**
- AWS Amplify configuration files created
- DynamoDB table schema defined
- Lambda function code written
- API Gateway configuration ready
- Frontend updated to use AWS API
- Admin panel configured for DynamoDB
- Deployment scripts created

🔄 **Next Steps:**
1. Set up AWS credentials
2. Run deployment script
3. Configure frontend environment variables
4. Test the deployment

## Project Structure

```
stablepay-apy/
├── amplify/                          # AWS Amplify configuration
│   ├── backend/
│   │   ├── api/stablepayapi/         # API Gateway
│   │   ├── function/stablepayapifunction/  # Lambda function
│   │   └── storage/stablepaydynamodb/      # DynamoDB
│   └── backend-config.json
├── client/                           # React frontend
│   ├── src/lib/
│   │   ├── api-config.ts            # API configuration
│   │   └── early-access-api.ts      # API services
│   └── components/admin-early-access-panel.tsx
├── amplify.yml                       # Build configuration
├── deploy-amplify.sh                 # Deployment script
└── AWS-AMPLIFY-DEPLOYMENT-GUIDE.md  # Detailed guide
```

## API Endpoints (After Deployment)

- `POST /api/early-access/submit` - Submit early access form
- `GET /api/early-access/submissions` - Get all submissions (admin)
- `GET /api/early-access/stats` - Get submission statistics
- `PUT /api/early-access/submissions/{id}` - Update submission (admin)
- `DELETE /api/early-access/submissions/{id}` - Delete submission (admin)

## Support

If you encounter any issues:
1. Check AWS credentials are properly configured
2. Ensure you have the necessary permissions
3. Review the detailed deployment guide
4. Check AWS CloudFormation for any errors

The project is fully configured and ready for deployment once AWS credentials are set up!
