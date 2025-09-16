# 🔧 Admin Panel Access Guide

## Overview
The StablePay admin panel provides access to early access submissions, analytics, and management tools.

## Access Methods

### 1. Direct URL Access
- **URL**: `http://stablepay-1757693761.s3-website-us-east-1.amazonaws.com/admin-early-access`
- **Navigation**: Click "Admin Panel" in the main navigation menu

### 2. Authentication
- **Default Password**: `StablePay2024!`
- **Security**: Change this password in production
- **Session**: Authentication persists in browser localStorage

## Features

### 📊 Dashboard Overview
- Total submissions count
- Savings calculations
- Growth metrics
- System status indicators

### 📋 Submissions Management
- View all early access submissions
- Filter by form type (Savings/Investment)
- Search by name, email, or phone
- Export data to CSV
- View detailed submission information

### 🔧 Admin Controls
- Refresh data from API
- Delete submissions
- View real-time statistics
- Monitor API health

## Troubleshooting

### Common Issues

1. **"Failed to fetch submissions"**
   - Check API endpoint connectivity
   - Verify DynamoDB permissions
   - Use the "Retry" button in error messages

2. **Authentication Issues**
   - Clear browser localStorage
   - Use correct password: `StablePay2024!`
   - Check browser console for errors

3. **Empty Data**
   - Verify API is returning data
   - Check network connectivity
   - Ensure submissions exist in database

### API Endpoints
- **Stats**: `https://zz0i3vbr6b.execute-api.us-east-1.amazonaws.com/prod/early-access/stats`
- **Submissions**: `https://zz0i3vbr6b.execute-api.us-east-1.amazonaws.com/prod/early-access/submissions`

## Security Notes

⚠️ **Important**: 
- Change the default password before production deployment
- Consider implementing proper authentication (JWT, OAuth, etc.)
- Add IP whitelisting for additional security
- Implement rate limiting for admin actions

## Quick Start

1. Navigate to the admin panel URL
2. Enter password: `StablePay2024!`
3. Click "Access Dashboard"
4. View submissions and analytics
5. Use filters and search as needed

## Support

For technical issues:
1. Check browser console for errors
2. Verify API connectivity
3. Review server logs
4. Contact development team
