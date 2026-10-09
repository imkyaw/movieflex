# Frontend deploy role (GitHub Actions to S3 + CloudFront)

Used by `.github/workflows/frontend.yml`. Separate from the backend role, so it can only touch the
client bucket and one distribution. No stored AWS keys: GitHub assumes the role through OIDC.

The GitHub OIDC identity provider (`token.actions.githubusercontent.com`, audience `sts.amazonaws.com`)
already exists for the backend role. Reuse it.

## 1. Create the role

IAM > Roles > Create role > Web identity, then replace the trust policy with:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:imkyaw@47980082/movieflex@1328689604:environment:production"
      }
    }
  }]
}
```

The `sub` uses the repository's immutable subject (numeric IDs). It is the same value as the backend role.

## 2. Inline permissions policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::<FRONTEND_BUCKET>",
        "arn:aws:s3:::<FRONTEND_BUCKET>/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

## 3. GitHub settings (repo > Settings > Secrets and variables > Actions)

| Kind | Name | Value |
|---|---|---|
| Secret | `AWS_FRONTEND_DEPLOY_ROLE_ARN` | ARN of the role above |
| Variable | `FRONTEND_BUCKET` | client S3 bucket name |
| Variable | `CLOUDFRONT_DISTRIBUTION_ID` | distribution ID (starts with `E`) |
| Variable | `VITE_API_BASE_URL` | CloudFront origin, no `/api/v1`, e.g. `https://dxxxx.cloudfront.net` |
| Variable | `AWS_REGION` | already set for the backend (`ap-southeast-2`) |

The `production` environment already exists, and its approval gate applies to this deploy too.

## 4. Deploy

Merging a change under `client/**` into `master` builds, then waits for approval on the
`production` environment (Actions > the run > Review deployments > Approve). Pull requests only build.
To redeploy by hand: Actions > Frontend build and deploy > Run workflow > branch `master` > tick `deploy` > approve.

## Cache behavior

- `assets/*` (hashed filenames): `max-age=31536000, immutable`.
- Other static files: `max-age=3600`.
- `index.html`: `no-cache`, and `/index.html` is invalidated after every deploy.
- Old hashed files are not deleted, so a browser holding an older `index.html` still finds its bundles.
  Clean up the bucket occasionally if it grows.

## Prerequisite

CloudFront must map 403/404 to `/index.html` (200) for the client behavior only, so React routes work.
The `/api/*` behavior must not use that fallback.
