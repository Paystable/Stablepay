#!/bin/bash

# 🌐 Domain Setup Script for stablepay.global
# This script automates the process of connecting a custom domain to CloudFront

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"stablepay.global"}
WWW_DOMAIN="www.${DOMAIN}"
CLOUDFRONT_DISTRIBUTION_ID="E3V701VMI6JPFV"
REGION="us-east-1"

echo -e "${BLUE}🌐 Setting up domain: ${DOMAIN}${NC}"
echo -e "${BLUE}📡 CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command_exists aws; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 1: Request SSL Certificate
echo -e "${YELLOW}📜 Step 1: Requesting SSL certificate for ${DOMAIN}...${NC}"

CERT_ARN=$(aws acm request-certificate \
    --domain-name "$DOMAIN" \
    --subject-alternative-names "*.$DOMAIN" \
    --validation-method DNS \
    --region "$REGION" \
    --query 'CertificateArn' \
    --output text 2>/dev/null || echo "")

if [ -z "$CERT_ARN" ]; then
    echo -e "${RED}❌ Failed to request certificate. Check permissions.${NC}"
    echo -e "${YELLOW}💡 You may need to request the certificate manually in the AWS Console.${NC}"
    echo -e "${YELLOW}   Go to: https://console.aws.amazon.com/acm/home?region=us-east-1${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Certificate requested: ${CERT_ARN}${NC}"

# Wait for certificate to be issued (this is a simplified check)
echo -e "${YELLOW}⏳ Waiting for certificate validation...${NC}"
echo -e "${YELLOW}💡 You need to add the DNS validation records to your domain.${NC}"
echo -e "${YELLOW}   Check the ACM console for the required CNAME records.${NC}"

# Step 2: Create Route 53 Hosted Zone
echo -e "${YELLOW}🌍 Step 2: Creating Route 53 hosted zone...${NC}"

HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
    --name "$DOMAIN" \
    --caller-reference "stablepay-$(date +%s)" \
    --query 'HostedZone.Id' \
    --output text 2>/dev/null | sed 's|/hostedzone/||' || echo "")

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo -e "${YELLOW}⚠️  Hosted zone may already exist. Checking existing zones...${NC}"
    HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
        --query "HostedZones[?Name=='$DOMAIN.'].Id" \
        --output text | sed 's|/hostedzone/||' || echo "")
fi

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo -e "${RED}❌ Failed to create or find hosted zone. Check permissions.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Hosted zone ID: ${HOSTED_ZONE_ID}${NC}"

# Get name servers
NAME_SERVERS=$(aws route53 get-hosted-zone \
    --id "$HOSTED_ZONE_ID" \
    --query 'DelegationSet.NameServers' \
    --output text)

echo -e "${YELLOW}📋 Name servers for ${DOMAIN}:${NC}"
echo "$NAME_SERVERS" | tr '\t' '\n' | sed 's/^/   /'
echo -e "${YELLOW}💡 Update these name servers at your domain registrar.${NC}"
echo ""

# Step 3: Get CloudFront distribution domain
echo -e "${YELLOW}📡 Step 3: Getting CloudFront distribution details...${NC}"

CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' \
    --output text)

echo -e "${GREEN}✅ CloudFront domain: ${CLOUDFRONT_DOMAIN}${NC}"

# Step 4: Create DNS records
echo -e "${YELLOW}🔗 Step 4: Creating DNS records...${NC}"

# Create A record
cat > /tmp/dns-records.json << EOF
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "$DOMAIN",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "$CLOUDFRONT_DOMAIN",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        },
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "$DOMAIN",
                "Type": "AAAA",
                "AliasTarget": {
                    "DNSName": "$CLOUDFRONT_DOMAIN",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        },
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "$WWW_DOMAIN",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "$CLOUDFRONT_DOMAIN",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        }
    ]
}
EOF

aws route53 change-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --change-batch file:///tmp/dns-records.json

echo -e "${GREEN}✅ DNS records created${NC}"

# Step 5: Update CloudFront distribution
echo -e "${YELLOW}🔄 Step 5: Updating CloudFront distribution...${NC}"

# Get current distribution config
aws cloudfront get-distribution-config \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --query 'DistributionConfig' > /tmp/current-config.json

# Update the config to include custom domain
jq --arg domain "$DOMAIN" --arg cert "$CERT_ARN" '
    .Aliases = {
        "Quantity": 1,
        "Items": [$domain]
    } |
    .ViewerCertificate = {
        "ACMCertificateArn": $cert,
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021",
        "Certificate": $cert,
        "CertificateSource": "acm"
    }
' /tmp/current-config.json > /tmp/updated-config.json

# Update the distribution
aws cloudfront update-distribution \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --distribution-config file:///tmp/updated-config.json \
    --if-match "$(aws cloudfront get-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" --query 'ETag' --output text)"

echo -e "${GREEN}✅ CloudFront distribution updated${NC}"

# Cleanup
rm -f /tmp/dns-records.json /tmp/current-config.json /tmp/updated-config.json

echo ""
echo -e "${GREEN}🎉 Domain setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "1. ${YELLOW}Update name servers${NC} at your domain registrar with:"
echo "$NAME_SERVERS" | tr '\t' '\n' | sed 's/^/   /'
echo ""
echo -e "2. ${YELLOW}Validate SSL certificate${NC} by adding DNS records in ACM console"
echo -e "3. ${YELLOW}Wait for propagation${NC} (5-60 minutes)"
echo -e "4. ${YELLOW}Test your domain${NC}: https://$DOMAIN"
echo ""
echo -e "${BLUE}🔗 Useful URLs:${NC}"
echo -e "• ACM Console: https://console.aws.amazon.com/acm/home?region=us-east-1"
echo -e "• Route 53 Console: https://console.aws.amazon.com/route53/v2/hostedzones"
echo -e "• CloudFront Console: https://console.aws.amazon.com/cloudfront/v3/home"
echo ""
echo -e "${GREEN}✅ Your domain will be available at: https://$DOMAIN${NC}"
