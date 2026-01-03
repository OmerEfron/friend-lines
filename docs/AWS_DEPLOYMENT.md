# AWS Deployment Guide

Deploy the Friendlines backend to AWS using SAM CLI.

## Prerequisites

- AWS CLI v2 configured with credentials
- AWS SAM CLI installed
- Node.js 20+
- Docker Desktop (for building)

## Environments

| Environment | Config File | Stack Name | API Stage |
|-------------|-------------|------------|-----------|
| Development | `samconfig.toml` | friendlines-backend-dev | dev |
| Production | `samconfig.prod.toml` | friendlines-backend-prod | prod |

## Production Deployment

### Step 1: Create JWT Secret in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name friendlines/jwt-secret \
  --secret-string "your-secure-production-jwt-secret-here" \
  --region us-east-1 \
  --no-cli-pager
```

Note the ARN from the output (format: `arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:friendlines/jwt-secret-XXXXXX`).

### Step 2: Update Production Config

Edit `backend/samconfig.prod.toml` and replace `ACCOUNT_ID` in `JwtSecretArn` with your actual AWS account ID and secret suffix.

### Step 3: Build the Application

```bash
cd backend
sam build
```

### Step 4: Deploy to Production

```bash
sam deploy --config-file samconfig.prod.toml
```

Review the changeset when prompted, then confirm to deploy.

### Step 5: Get API Endpoint

After deployment, the API endpoint URL is shown in the outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name friendlines-backend-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --region us-east-1 \
  --no-cli-pager
```

## Development Deployment (AWS)

For deploying a dev environment to AWS (not local):

```bash
cd backend
sam build
sam deploy  # Uses samconfig.toml by default
```

## Local Development

Local development uses Docker containers and doesn't deploy to AWS.

See [LOCAL_DEV.md](./LOCAL_DEV.md) for local setup instructions.

Quick start:
```bash
./scripts/setup-local-backend.sh
cd backend && sam local start-api --docker-network friendlines-net
```

## Frontend Configuration

After deploying, update the frontend API URL in `src/config/api.ts`:

```typescript
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod';
  }
  // Local development URLs...
};
```

## Useful Commands

```bash
# Validate template
cd backend && sam validate

# View deployed resources
aws cloudformation describe-stack-resources \
  --stack-name friendlines-backend-prod \
  --no-cli-pager

# View logs for a function
sam logs -n AuthFunction --stack-name friendlines-backend-prod --tail

# Delete stack (WARNING: destroys all data)
sam delete --stack-name friendlines-backend-prod --region us-east-1
```

## Troubleshooting

### Build Fails
- Ensure Docker Desktop is running
- Run `npm install` in backend directory
- Check Node.js version: `node --version` (needs 20+)

### Deployment Fails
- Check AWS credentials: `aws sts get-caller-identity`
- Verify Secrets Manager secret exists
- Review CloudFormation events in AWS Console

### API Returns 500
- Check CloudWatch logs for the Lambda function
- Verify DynamoDB tables were created
- Ensure JWT_SECRET was resolved correctly

