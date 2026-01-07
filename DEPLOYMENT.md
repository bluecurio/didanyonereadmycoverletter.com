# Serverless Deployment Guide

This guide walks you through deploying your application using AWS Amplify (static hosting) + API Gateway + Lambda (serverless backend).

## Architecture Overview

- **AWS Amplify**: Hosts static files (HTML, CSS, JS, images) from the `public/` folder
- **AWS Lambda**: Runs your API endpoints as serverless functions
- **API Gateway**: Exposes Lambda functions as HTTP endpoints
- **DynamoDB**: Stores visitor data and counter (already set up)

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Your DynamoDB table `didanyonereadmycoverletter.com` already created in `us-east-1`

## Step 1: Deploy Lambda Functions

### Option A: Using AWS Console (Recommended for beginners)

#### 1.1 Create IAM Role for Lambda

1. Go to **IAM Console** → **Roles** → **Create role**
2. Select **AWS service** → **Lambda**
3. Attach these policies:
   - `AWSLambdaBasicExecutionRole`
   - Create a custom inline policy for DynamoDB:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:GetItem",
           "dynamodb:PutItem",
           "dynamodb:UpdateItem",
           "dynamodb:Query"
         ],
         "Resource": "arn:aws:dynamodb:us-east-1:*:table/didanyonereadmycoverletter.com"
       }
     ]
   }
   ```
4. Name the role: `didanyonereadmycoverletter-lambda-role`

#### 1.2 Create Lambda Functions

You need to create **3 Lambda functions** (one for each endpoint):

##### Function 1: visit

1. Go to **Lambda Console** → **Create function**
2. Name: `didanyonereadmycoverletter-visit`
3. Runtime: **Node.js 18.x** or newer
4. Architecture: **x86_64**
5. Execution role: Use existing role → `didanyonereadmycoverletter-lambda-role`
6. Click **Create function**
7. In the code editor, replace the code with contents from `lambda/visit.mjs`
8. Under **Configuration** → **Environment variables**, add:
   - `AWS_REGION`: `us-east-1`
   - `DYNAMODB_TABLE`: `didanyonereadmycoverletter.com`
9. Click **Deploy**

##### Function 2: generate

1. Go to **Lambda Console** → **Create function**
2. Name: `didanyonereadmycoverletter-generate`
3. Runtime: **Node.js 18.x** or newer
4. Architecture: **x86_64**
5. Execution role: Use existing role → `didanyonereadmycoverletter-lambda-role`
6. Click **Create function**
7. In the code editor, replace the code with contents from `lambda/generate.mjs`
8. Under **Configuration** → **Environment variables**, add:
   - `WEBSITE_DOMAIN`: `didanyonereadmycoverletter.com` (your domain)
9. Click **Deploy**

##### Function 3: count

1. Go to **Lambda Console** → **Create function**
2. Name: `didanyonereadmycoverletter-count`
3. Runtime: **Node.js 18.x** or newer
4. Architecture: **x86_64**
5. Execution role: Use existing role → `didanyonereadmycoverletter-lambda-role`
6. Click **Create function**
7. In the code editor, replace the code with contents from `lambda/count.mjs`
8. Under **Configuration** → **Environment variables**, add:
   - `AWS_REGION`: `us-east-1`
   - `DYNAMODB_TABLE`: `didanyonereadmycoverletter.com`
9. Click **Deploy**

#### 1.3 Add Lambda Layer for Dependencies

All three functions need the AWS SDK and unique-names-generator dependencies.

**Option 1: Use Lambda Layers**

1. Create a deployment package locally:
   ```bash
   cd lambda
   mkdir -p nodejs
   npm install --prefix nodejs
   cd nodejs
   zip -r ../layer.zip .
   cd ..
   ```

2. Go to **Lambda Console** → **Layers** → **Create layer**
3. Name: `didanyonereadmycoverletter-deps`
4. Upload `lambda/layer.zip`
5. Compatible runtimes: **Node.js 18.x**
6. Click **Create**

7. For each Lambda function:
   - Go to the function
   - Scroll down to **Layers** → **Add a layer**
   - Select **Custom layers** → `didanyonereadmycoverletter-deps`
   - Click **Add**

**Option 2: Include dependencies in each function**

1. For each Lambda function:
   ```bash
   cd lambda
   npm install
   zip -r visit.zip visit.mjs node_modules package.json
   zip -r generate.zip generate.mjs node_modules package.json
   zip -r count.zip count.mjs node_modules package.json
   ```

2. Upload each zip file to its corresponding Lambda function in the Console

## Step 2: Create API Gateway

1. Go to **API Gateway Console** → **Create API**
2. Choose **HTTP API** (simpler and cheaper than REST API)
3. Click **Build**

### 2.1 Add Integrations

1. Click **Add integration**
2. Integration type: **Lambda**
3. AWS Region: **us-east-1**
4. Lambda function: **didanyonereadmycoverletter-visit**
5. Integration name: `visit-integration`
6. Repeat for `generate` and `count` functions

### 2.2 Configure Routes

Create the following routes:

| Method | Route | Integration |
|--------|-------|-------------|
| GET | `/visit` | visit-integration |
| GET | `/generate` | generate-integration |
| GET | `/count` | count-integration |

### 2.3 Configure CORS

1. Go to **CORS** in the left sidebar
2. Configure:
   - **Access-Control-Allow-Origin**: `*` (or your specific domain like `https://didanyonereadmycoverletter.com`)
   - **Access-Control-Allow-Headers**: `Content-Type`
   - **Access-Control-Allow-Methods**: `GET, OPTIONS`
3. Click **Save**

### 2.4 Create Stage and Deploy

1. Go to **Stages** → **Create**
2. Stage name: `prod`
3. Click **Create**
4. Note your **Invoke URL** (something like: `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

## Step 3: Update Frontend Configuration

1. Open `public/config.js`
2. Replace `YOUR_API_GATEWAY_URL_HERE` with your API Gateway URL:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost'
     ? 'http://localhost:3000/api'
     : 'https://abc123.execute-api.us-east-1.amazonaws.com/prod';
   ```
3. Commit and push this change

## Step 4: Deploy to Amplify

1. Go to **AWS Amplify Console**
2. Connect your Git repository (GitHub, etc.)
3. Amplify will automatically detect `amplify.yml`
4. Deploy settings should show:
   - **Build command**: `echo "Preparing static files for deployment"`
   - **Base directory**: `public`
5. Click **Save and deploy**

## Step 5: Configure Custom Domain (Route53)

Since you mentioned Route53 is already set up:

### In Amplify:
1. Go to your Amplify app → **Domain management**
2. Click **Add domain**
3. Select your domain from Route53
4. Amplify will automatically configure the DNS records
5. Wait for SSL certificate provisioning (takes ~15 minutes)

### Update API Config (Optional - for cleaner URLs):
If you want to use a custom domain for your API as well:
1. In API Gateway, go to **Custom domain names**
2. Create custom domain (e.g., `api.didanyonereadmycoverletter.com`)
3. Add API mapping to your `prod` stage
4. Update Route53 with the provided target domain
5. Update `public/config.js` to use your custom API domain

## Step 6: Test Your Deployment

1. Visit your Amplify URL or custom domain
2. Open browser console (F12)
3. Check that:
   - Static files load correctly
   - API calls to Lambda functions work
   - Counter increments properly
   - Link generation works

## Troubleshooting

### Static site deploys but shows blank page
- Check browser console for errors
- Verify all files are in `public/` folder
- Check that `amplify.yml` has `baseDirectory: public`

### API calls fail with CORS errors
- Verify CORS is configured in API Gateway
- Check Lambda functions return proper CORS headers
- Make sure `Access-Control-Allow-Origin` matches your domain

### Counter doesn't increment
- Check Lambda function CloudWatch logs for errors
- Verify DynamoDB table name is correct in environment variables
- Ensure Lambda IAM role has DynamoDB permissions

### 403 errors from API Gateway
- Check API Gateway routes are correctly mapped to Lambda functions
- Verify Lambda functions are deployed in the same region as API Gateway

## Cost Estimate

With this serverless architecture:
- **Amplify Hosting**: ~$0.15/GB storage + $0.15/GB served (first 1GB free)
- **Lambda**: 1M requests free tier, then $0.20 per 1M requests
- **API Gateway**: 1M requests free tier (first 12 months), then $1.00 per 1M requests
- **DynamoDB**: 25GB storage + 25 write/read units free tier

For a low-traffic personal site, you'll likely stay within free tier.

## Alternative: Using AWS SAM or Serverless Framework

For easier deployment, you can use infrastructure-as-code tools:

### Using AWS SAM:
Create a `template.yaml` and deploy everything with one command:
```bash
sam build
sam deploy --guided
```

### Using Serverless Framework:
Create a `serverless.yml` and deploy:
```bash
serverless deploy
```

Would you like me to create these configuration files for automated deployment?
