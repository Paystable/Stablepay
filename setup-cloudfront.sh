#!/bin/bash

# CloudFront CDN Setup Script
BUCKET_NAME="stablepay-1757693761"
REGION="us-east-1"

echo "🌐 Setting up CloudFront CDN for maximum performance..."

# Create CloudFront distribution
echo "📡 Creating CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --query 'Distribution.Id' \
  --output text \
  --region $REGION)

echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"

# Wait for distribution to be deployed
echo "⏳ Waiting for CloudFront distribution to be deployed..."
aws cloudfront wait distribution-deployed --id $DISTRIBUTION_ID --region $REGION

# Get distribution domain name
DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text \
  --region $REGION)

echo "✅ CloudFront distribution deployed!"
echo "🌐 CDN URL: https://$DISTRIBUTION_DOMAIN"
echo "📊 Distribution ID: $DISTRIBUTION_ID"

# Create invalidation for immediate cache refresh
echo "🔄 Creating cache invalidation..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --region $REGION

echo "✅ Cache invalidation created!"
echo "🎉 CloudFront CDN setup complete!"
echo "🌐 Use this URL for maximum performance: https://$DISTRIBUTION_DOMAIN"
