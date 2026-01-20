#!/bin/bash

# Setup script for creating DynamoDB table for didanyonereadmycoverletter.com

echo "Creating DynamoDB table for didanyonereadmycoverletter.com..."

TABLE_NAME="didanyonereadmycoverletter.com"
REGION="${AWS_REGION:-us-east-1}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed."
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials not configured."
    echo "Run 'aws configure' to set up your credentials."
    exit 1
fi

# Check if table already exists
if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &> /dev/null; then
    echo "Table '$TABLE_NAME' already exists in region $REGION"
    echo "Skipping creation."
    exit 0
fi

# Create the table
echo "Creating table '$TABLE_NAME' in region $REGION..."

aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" \
  --tags Key=Project,Value=didanyonereadmycoverletter.com

if [ $? -eq 0 ]; then
    echo "✓ Table created successfully!"
    echo ""
    echo "Waiting for table to become active..."
    aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
    echo "✓ Table is now active and ready to use!"
    echo ""
    echo "Table details:"
    aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" --query 'Table.[TableName,TableStatus,TableArn]' --output table
else
    echo "✗ Failed to create table"
    exit 1
fi
