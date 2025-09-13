# 🔐 AWS Permissions Required for Deployment

## ❌ **Current Issue**

Your AWS user `AdministratorAccess` doesn't have the necessary permissions to create the required AWS resources. This is a common security restriction in AWS organizations.

## 🔧 **Required Permissions**

Your AWS user needs these additional permissions:

### **IAM Permissions**
- `iam:CreateRole`
- `iam:AttachRolePolicy`
- `iam:PassRole`

### **Lambda Permissions**
- `lambda:CreateFunction`
- `lambda:AddPermission`
- `lambda:GetFunction`

### **API Gateway Permissions**
- `apigateway:POST` (Create REST API)
- `apigateway:GET` (Get resources)
- `apigateway:PUT` (Create methods/integrations)
- `apigateway:CREATE` (Create deployments)

### **DynamoDB Permissions**
- `dynamodb:CreateTable`
- `dynamodb:DescribeTable`

### **S3 Permissions**
- `s3:CreateBucket`
- `s3:PutObject`
- `s3:PutBucketPolicy`
- `s3:PutBucketWebsite`

## 🚀 **Solution Options**

### **Option 1: Request Additional Permissions (Recommended)**

Ask your AWS administrator to attach these policies to your user:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PassRole",
                "lambda:*",
                "apigateway:*",
                "dynamodb:*",
                "s3:*"
            ],
            "Resource": "*"
        }
    ]
}
```

### **Option 2: Use AWS Console (Manual Deployment)**

1. **Go to AWS Console**: https://console.aws.amazon.com/
2. **Create DynamoDB Table**:
   - Go to DynamoDB → Tables → Create table
   - Table name: `EarlyAccessSubmissions`
   - Partition key: `email` (String)
   - Create table

3. **Create Lambda Function**:
   - Go to Lambda → Functions → Create function
   - Function name: `stablepay-api`
   - Runtime: Node.js 18.x
   - Create function
   - Upload the code from `amplify/backend/function/stablepayapifunction/src/index.js`

4. **Create API Gateway**:
   - Go to API Gateway → Create API → REST API
   - API name: `stablepay-api`
   - Create API
   - Create resources and methods as needed

5. **Deploy Frontend to S3**:
   - Create S3 bucket
   - Upload `client/dist/` contents
   - Enable static website hosting

### **Option 3: Use AWS Amplify Console (Easiest)**

1. **Go to AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. **Create New App**:
   - Connect to your Git repository
   - Or upload a ZIP file of your project
3. **Configure Build Settings**:
   - Build command: `cd client && npm run build`
   - Base directory: `client`
   - Output directory: `client/dist`
4. **Add Environment Variables**:
   - `REACT_APP_API_URL`: Your API Gateway URL
5. **Deploy**

## 📋 **Quick Manual Setup Steps**

### **Step 1: Create DynamoDB Table**
```bash
aws dynamodb create-table \
    --table-name EarlyAccessSubmissions \
    --attribute-definitions \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=email,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

### **Step 2: Build and Deploy Frontend**
```bash
cd client
npm install
npm run build
# Upload dist/ folder to S3 or use Amplify Console
```

### **Step 3: Test Locally**
Your local server is already running at http://localhost:8080

## 🎯 **Recommended Next Steps**

1. **Contact your AWS administrator** to request the additional permissions
2. **Or use the AWS Console** to manually create the resources
3. **Or use AWS Amplify Console** for the easiest deployment

## 💡 **Alternative: Use a Different AWS Account**

If you have access to a different AWS account with full permissions, you can:
1. Configure new credentials: `aws configure`
2. Run the deployment script again

## 📞 **Need Help?**

- **AWS Support**: Contact your AWS administrator
- **Documentation**: Check AWS IAM documentation for permission details
- **Console**: Use AWS Console for manual resource creation

---

**The project is 100% ready - we just need the right AWS permissions to deploy it!**
