# StablePay AWS Amplify Deployment

This project is configured for deployment on AWS Amplify with DynamoDB backend integration for storing early access form data.

## 🚀 Quick Start

1. **Prerequisites**:
   - AWS Account
   - AWS CLI installed and configured
   - Node.js 18+
   - Git repository

2. **Deploy Backend**:
   ```bash
   ./deploy-amplify.sh
   ```

3. **Deploy Frontend**:
   - Go to AWS Amplify Console
   - Connect your Git repository
   - Set environment variable: `REACT_APP_API_URL`
   - Deploy

## 📁 Project Structure

```
stablepay-apy/
├── amplify/                          # AWS Amplify configuration
│   ├── backend/
│   │   ├── api/stablepayapi/         # API Gateway configuration
│   │   ├── function/stablepayapifunction/  # Lambda function
│   │   └── storage/stablepaydynamodb/      # DynamoDB configuration
│   └── backend-config.json
├── client/                           # React frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api-config.ts         # API endpoint configuration
│   │   │   └── early-access-api.ts   # API service functions
│   │   └── components/
│   │       └── admin-early-access-panel.tsx  # Admin panel
│   └── package.json
├── amplify.yml                       # Amplify build configuration
├── deploy-amplify.sh                 # Deployment script
└── AWS-AMPLIFY-DEPLOYMENT-GUIDE.md  # Detailed deployment guide
```

## 🔧 Features

### Backend (AWS)
- **DynamoDB**: Stores early access form submissions
- **Lambda Function**: Handles API requests
- **API Gateway**: Provides REST API endpoints
- **CORS**: Configured for frontend access

### Frontend (React)
- **Early Access Form**: Collects user information and calculations
- **Admin Panel**: View and manage submissions
- **Real-time Calculations**: Shows potential savings and returns
- **Responsive Design**: Works on all devices

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/early-access/submit` | Submit early access form |
| GET | `/api/early-access/submissions` | Get all submissions (admin) |
| GET | `/api/early-access/stats` | Get submission statistics |
| PUT | `/api/early-access/submissions/{id}` | Update submission (admin) |
| DELETE | `/api/early-access/submissions/{id}` | Delete submission (admin) |

## 🗄️ Database Schema

The DynamoDB table stores:

```json
{
  "email": "user@example.com",           // Primary key
  "id": "uuid",                         // Unique identifier
  "fullName": "John Doe",               // User's full name
  "phoneNumber": "+1234567890",         // Phone number
  "formType": "savings",                // Form type: savings/investment
  "walletAddress": "0x...",             // Wallet address (optional)
  "calculations": {                     // Calculated benefits
    "monthlyAmount": 2000,
    "totalSavings5Years": 12000,
    "totalYield5Years": 5000,
    "apy": 14
  },
  "submittedAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install
cd client && npm install

# Start development server
npm run dev
```

### Environment Variables
Create `client/.env.local`:
```
REACT_APP_API_URL=http://localhost:8080
```

## 📈 Monitoring

- **CloudWatch Logs**: Lambda function logs
- **DynamoDB Metrics**: Table usage and performance
- **API Gateway Metrics**: API usage and errors
- **Amplify Console**: Frontend deployment status

## 🔒 Security

- CORS configured for frontend access
- Input validation on all endpoints
- Email uniqueness validation
- Rate limiting (can be added)
- HTTPS enforced

## 💰 Cost Optimization

- DynamoDB on-demand billing
- Lambda pay-per-request
- API Gateway pay-per-request
- CloudWatch logs retention

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Check API Gateway CORS configuration
2. **Lambda Timeout**: Increase timeout in function configuration
3. **DynamoDB Permissions**: Verify IAM roles and policies
4. **Environment Variables**: Ensure all variables are set

### Useful Commands

```bash
# Check Amplify status
amplify status

# View logs
amplify logs

# Update backend
amplify push

# Remove resources
amplify remove api
```

## 📚 Documentation

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please:
1. Check the troubleshooting section
2. Review AWS documentation
3. Create an issue in the repository
4. Contact the development team

---

**Note**: This deployment uses AWS services which may incur costs. Monitor your usage and set up billing alerts to avoid unexpected charges.
