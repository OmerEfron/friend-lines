# Morning Briefing Setup

The Morning Briefing feature sends daily push notifications to users with a summary of newsflashes from the last 24 hours.

## Deployment Options

### Option 1: Deploy Without Morning Briefing (Default)

Deploy without EventBridge permissions:

```bash
cd backend
sam deploy --config-env prod
```

The function will not be created, and deployment will succeed without EventBridge permissions.

### Option 2: Deploy With Morning Briefing

**Step 1: Add EventBridge Permissions**

Add the following IAM policy to your deployment user (see `docs/IAM_EVENTBRIDGE_POLICY.json`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "events:PutRule",
        "events:DeleteRule",
        "events:DescribeRule",
        "events:PutTargets",
        "events:RemoveTargets",
        "events:ListTargetsByRule"
      ],
      "Resource": "*"
    }
  ]
}
```

**Step 2: Deploy with Parameter**

```bash
cd backend
sam deploy --config-env prod --parameter-overrides EnableMorningBriefing=true
```

Or add to your `samconfig.prod.toml`:

```toml
[default.deploy.parameters]
parameter_overrides = "EnableMorningBriefing=true"
```

## Schedule

- **Cron**: `0 8 * * ? *` (8 AM UTC daily)
- **Function**: `MorningBriefingFunction`
- **Enabled**: Only when `EnableMorningBriefing=true`

## Manual Invocation

You can manually invoke the function for testing:

```bash
aws lambda invoke \
  --function-name friendlines-backend-prod-MorningBriefingFunction-XXXXX \
  --payload '{}' \
  response.json
```

