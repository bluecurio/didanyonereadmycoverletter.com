# Visitor Tracker

A simple visitor tracking website with unique funny-word identifiers. Track when people follow your links!

## Features

- **Unique Visitor Tracking**: Each visitor gets a unique, memorable ID (e.g., "happy-penguin-42")
- **Global Counter**: Tracks total unique visitors across all generated links
- **One-time Counting**: Each unique ID only increments the counter once
- **Easy Link Generation**: Generate shareable links with a single click
- **Clean UI**: Modern, responsive design with gradient styling

## How It Works

1. Click "Generate New Link" to create a unique tracking URL
2. Share the generated URL with someone
3. When they visit, the counter increments (only once per unique ID)
4. Revisiting with the same ID doesn't increment the counter again

## Technology Stack

- **Backend**: Node.js + Express
- **Storage**: AWS DynamoDB (serverless NoSQL database)
- **Hosting**: AWS Amplify
- **ID Generator**: unique-names-generator (creates funny word combinations)

## Local Development

### Prerequisites

- Node.js 18.x or later
- AWS Account (for deployment)
- AWS CLI configured with credentials

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file):
```env
AWS_REGION=us-east-1
DYNAMODB_TABLE=visitor-tracker
PORT=3000
```

3. Create DynamoDB table locally or use AWS:
```bash
# See "DynamoDB Setup" section below
```

4. Run the development server:
```bash
npm run dev
```

5. Visit `http://localhost:3000`

## DynamoDB Setup

### Create Table via AWS Console

1. Go to AWS DynamoDB Console
2. Click "Create table"
3. Configuration:
   - **Table name**: `visitor-tracker`
   - **Partition key**: `id` (String)
   - **Table settings**: Default settings (On-demand pricing)
4. Click "Create table"

### Create Table via AWS CLI

```bash
aws dynamodb create-table \
  --table-name visitor-tracker \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Table Schema

The table uses a simple key-value structure:

| id | Other Attributes |
|----|------------------|
| `global_counter` | `count: Number` |
| `visited:happy-penguin-42` | `timestamp: String, visited: Boolean` |
| `visited:dancing-robot-7` | `timestamp: String, visited: Boolean` |

## AWS Amplify Deployment

### Option 1: Deploy via Amplify Console (Recommended)

1. **Push code to Git repository** (GitHub, GitLab, Bitbucket, etc.)

2. **Go to AWS Amplify Console**:
   - Navigate to https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"
   - Connect your Git repository

3. **Configure build settings**:
   - Amplify should auto-detect the `amplify.yml` configuration
   - Review and confirm settings

4. **Add environment variables**:
   - Go to App settings → Environment variables
   - Add the following:
     ```
     AWS_REGION=us-east-1
     DYNAMODB_TABLE=visitor-tracker
     NODE_ENV=production
     ```

5. **Configure IAM Role**:
   - Go to App settings → General
   - Edit "Service role"
   - Ensure the role has DynamoDB permissions (see below)

6. **Deploy**:
   - Click "Save and deploy"
   - Amplify will build and deploy your app
   - You'll get a URL like: `https://main.d1234567890ab.amplifyapp.com`

### Option 2: Deploy via Amplify CLI

1. **Install Amplify CLI**:
```bash
npm install -g @aws-amplify/cli
amplify configure
```

2. **Initialize Amplify**:
```bash
cd visitor-tracker
amplify init
# Follow prompts:
# - Environment: production
# - Editor: your choice
# - App type: nodejs
# - Configuration: default
```

3. **Add hosting**:
```bash
amplify add hosting
# Choose: Hosting with Amplify Console
# Choose: Manual deployment
```

4. **Deploy**:
```bash
amplify publish
```

### IAM Permissions for Amplify

The Amplify service role needs DynamoDB access. Attach this policy:

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
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/visitor-tracker"
    }
  ]
}
```

**To add this policy:**
1. Go to IAM Console → Roles
2. Find your Amplify service role (e.g., `amplifyconsole-backend-role`)
3. Click "Add permissions" → "Create inline policy"
4. Paste the JSON above
5. Name it "DynamoDBVisitorTrackerAccess"
6. Save

## Project Structure

```
visitor-tracker/
├── server.js              # Express server with API routes
├── lib/
│   └── storage.js         # DynamoDB operations
├── public/
│   ├── index.html         # Main page
│   ├── styles.css         # Styling
│   └── app.js             # Frontend JavaScript
├── package.json
├── amplify.yml            # Amplify build configuration
└── README.md
```

## API Endpoints

### GET /api/visit?id={visitorId}
Track a visitor and increment counter if new.

**Response:**
```json
{
  "count": 42,
  "newVisit": true,
  "id": "happy-penguin-42"
}
```

### GET /api/generate
Generate a new unique ID and shareable URL.

**Response:**
```json
{
  "id": "dancing-robot-7",
  "url": "https://your-domain.com?id=dancing-robot-7"
}
```

### GET /api/count
Get current visitor count.

**Response:**
```json
{
  "count": 42
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T12:00:00.000Z"
}
```

## Cost Estimate

With AWS Free Tier:
- **Amplify**: First 12 months free (15 GB storage, 5 GB served/month)
- **DynamoDB**: Free tier includes:
  - 25 GB storage
  - 25 read/write capacity units
  - Enough for ~200K reads and writes per month

**Expected monthly cost**: $0 (within free tier for small usage)

After free tier: ~$1-5/month for moderate traffic

## Monitoring

### Check Visitor Count
Visit your deployed URL without any ID parameter to see current count.

### DynamoDB Console
1. Go to AWS DynamoDB Console
2. Select `visitor-tracker` table
3. Click "Explore table items" to see all visitors

### CloudWatch Logs
Amplify automatically sends logs to CloudWatch:
1. Go to AWS CloudWatch Console
2. Navigate to Log groups
3. Find your Amplify app logs

## Troubleshooting

### Counter not incrementing
- Check CloudWatch logs for errors
- Verify IAM role has DynamoDB permissions
- Confirm environment variables are set in Amplify

### "Internal server error"
- Check DynamoDB table exists and is accessible
- Verify AWS region matches table location
- Check CloudWatch logs for detailed error messages

### Local development not working
- Ensure AWS CLI is configured: `aws configure`
- Verify credentials have DynamoDB access
- Check `.env` file has correct table name and region

## Customization

### Change ID Format
Edit `server.js` line ~33 to customize the ID generation:

```javascript
const uniqueId = uniqueNamesGenerator({
  dictionaries: [colors, animals, numberDictionary], // Change dictionaries
  separator: '-',
  length: 3, // Change number of words
  style: 'lowerCase' // or 'upperCase', 'capital'
});
```

Available dictionaries: `adjectives`, `colors`, `animals`, `names`, `countries`

### Change Styling
Edit `public/styles.css` to customize colors, fonts, and layout.

### Add Analytics
You could extend this to track:
- Timestamps of visits
- Geographic locations (via IP lookup)
- Referrer information
- User agents

## Security Considerations

- No authentication required (by design for simplicity)
- Rate limiting not implemented (consider adding for production)
- IDs are public and guessable (not suitable for sensitive tracking)
- No HTTPS enforcement in code (Amplify handles this)

## License

MIT

## Support

For issues or questions, check:
- DynamoDB table is created and accessible
- IAM permissions are correctly configured
- Environment variables are set in Amplify
- CloudWatch logs for error details
