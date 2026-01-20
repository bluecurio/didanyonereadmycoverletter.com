# Quick Start Guide

Get your visitor tracker running on AWS in minutes!

## Prerequisites

- AWS Account
- AWS CLI configured (`aws configure`)
- Node.js 18+ installed

## Local Testing (5 minutes)

1. **Install dependencies**:
   ```bash
   cd didanyonereadmycoverletter.com
   npm install
   ```

2. **Create DynamoDB table**:
   ```bash
   ./setup-dynamodb.sh
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults are fine for most cases)
   ```

4. **Run locally**:
   ```bash
   npm start
   ```

5. **Test**: Visit http://localhost:3000

## Deploy to AWS Amplify (10 minutes)

### Step 1: Push to Git

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GIT_URL
git push -u origin main
```

### Step 2: Create Amplify App

1. Go to https://console.aws.amazon.com/amplify/
2. Click "New app" → "Host web app"
3. Choose your Git provider and repository
4. Authorize access if prompted

### Step 3: Configure Build

1. Amplify auto-detects `amplify.yml` - click "Next"
2. Review settings and click "Save and deploy"

### Step 4: Add Environment Variables

1. In Amplify app, go to "Environment variables" (left sidebar)
2. Add these variables:
   - `AWS_REGION` = `us-east-1`
   - `DYNAMODB_TABLE` = `didanyonereadmycoverletter.com`
   - `NODE_ENV` = `production`
3. Click "Save"

### Step 5: Configure IAM Permissions

1. Go to "App settings" → "General"
2. Click "Edit" on Service role
3. Go to IAM Console → Find the Amplify role
4. Click "Add permissions" → "Create inline policy"
5. Paste this JSON:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:GetItem",
           "dynamodb:PutItem",
           "dynamodb:UpdateItem"
         ],
         "Resource": "arn:aws:dynamodb:us-east-1:*:table/didanyonereadmycoverletter.com"
       }
     ]
   }
   ```
6. Name it "DynamoDBAccess" and save
7. Return to Amplify and redeploy

### Step 6: Test Your Site

1. Wait for deployment to complete
2. Click on the provided URL
3. Click "Generate New Link"
4. Share the link and watch the counter increment!

## Troubleshooting

**Counter stays at 0?**
- Check IAM permissions are set correctly
- Verify environment variables in Amplify
- Check CloudWatch logs for errors

**Can't connect to DynamoDB locally?**
- Run `aws configure` to set up credentials
- Make sure table was created: `aws dynamodb list-tables`

**Build fails on Amplify?**
- Check `amplify.yml` exists
- Verify Node.js version in build settings (should be 18+)

## What's Next?

- Share generated links to track visitors
- Monitor your count in real-time
- View visitor IDs in DynamoDB console
- Customize the UI in `public/styles.css`

For detailed documentation, see [README.md](README.md).
