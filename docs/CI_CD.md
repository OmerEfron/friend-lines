# CI/CD Pipeline

Automated deployment pipeline using GitHub Actions for the Friendlines backend.

## Overview

The pipeline automatically deploys the backend to AWS Production when changes are pushed to the `main` branch.

| Trigger | Action |
|---------|--------|
| Push to `main` (backend changes) | Deploy to Production |
| Manual dispatch | Deploy to Production |

## Setup Instructions

### 1. Add GitHub Secrets

Go to your GitHub repository: **Settings > Secrets and variables > Actions**

Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM User Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Access Key |

### 2. Create GitHub Environment (Optional)

For additional protection, create a `production` environment:

1. Go to **Settings > Environments**
2. Click **New environment**
3. Name it `production`
4. Add protection rules (e.g., required reviewers)

## How It Works

```
Push to main (backend/**)
         │
         ▼
   Checkout Code
         │
         ▼
  Setup Node.js 20
         │
         ▼
   Setup SAM CLI
         │
         ▼
Configure AWS Credentials
         │
         ▼
  npm ci (Install deps)
         │
         ▼
     sam build
         │
         ▼
    sam deploy
         │
         ▼
  Output API Endpoint
```

## Manual Deployment

To trigger a deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy Backend to AWS**
3. Click **Run workflow**
4. Select branch `main`
5. Click **Run workflow**

## Monitoring Deployments

### View Workflow Runs
- Go to **Actions** tab to see all workflow runs
- Click on a run to see detailed logs

### View Deployment Summary
- Each successful deployment shows the API endpoint in the job summary

### Check AWS CloudFormation
```bash
aws cloudformation describe-stacks \
  --stack-name friendlines-backend-prod \
  --region us-east-1 --no-cli-pager
```

## Troubleshooting

### Deployment Fails with Credentials Error
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets are set
- Check IAM user has required permissions (see `docs/AWS_DEPLOYMENT.md`)

### Deployment Fails with SAM Build Error
- Check build logs for TypeScript errors
- Run locally: `cd backend && sam build`

### No Deployment Triggered
- Ensure changes are in `backend/` directory
- Check workflow is enabled in Actions tab
- Verify pushing to `main` branch

## Files

- `.github/workflows/deploy-backend.yml` - GitHub Actions workflow
- `backend/samconfig.prod.toml` - SAM deployment configuration

