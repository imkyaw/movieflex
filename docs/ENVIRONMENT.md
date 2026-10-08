# Production environment checklist

Enter these as Beanstalk environment properties; do not copy your development `.env` into the ZIP. Values marked TEAM are unresolved, not literal values to paste. This checklist contains no passwords or AWS keys.

- `NODE_ENV=production`
- `PORT=8080`
- `NODE_OPTIONS=--max-old-space-size=512`
- `IDENTITY_PROVIDER=cognito`
- `AWS_REGION=ap-southeast-2`
- `POSTER_BUCKET_NAME=cloudflex-posters-team15xaut`
- `COGNITO_USER_POOL_ID=[TEAM: copy exact pool ID from Cognito Overview]`
- `COGNITO_CLIENT_ID=2ajf2cncik71cagqn4ak4pj0dj`
- `CLIENT_ORIGIN=https://[TEAM: CloudFront distribution hostname]` (no trailing slash/path)
- `ADMIN_EMAILS=admin@movieflex.com` (comma-separated; these accounts get the ADMIN role when they register or next log in)
- `DATABASE_URL=postgresql://[USER]:[URL-ENCODED-PASSWORD]@[RDS-ENDPOINT]:5432/cloudflex?sslmode=require`

Confirm the actual DB name and role. TLS is required in this example; certificate validation can be strengthened with the RDS CA and Prisma SSL parameters according to the chosen deployment. Avoid logging or sharing this value. For initial health-only deployment before CloudFront exists, CLIENT_ORIGIN can remain `http://localhost:5173`; replace before frontend testing. Never use placeholder URLs as final settings.

AWS credentials come from the EC2 instance profile. Do not set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY or AWS_SESSION_TOKEN in the deployed config. LOCAL_JWT_SECRET is not needed with Cognito. Region, bucket and production-mode defaults are already in `.ebextensions`; the console may override them.

Frontend build-time setting (not an EB backend setting):

```dotenv
VITE_API_BASE_URL=https://[TEAM: CloudFront distribution hostname]
```

The client appends `/api/v1` itself. Vite values are public in the browser bundle: never put passwords or AWS credentials in a VITE variable. Rebuild after changing this value. No Cognito client secret belongs in the browser.

Before launch, confirm the Cognito app client's auth flow/no-secret configuration and compare the role's Cognito ARN against the console, not screenshot transcriptions. Verify S3/Cognito runtime operations after deployment; populated settings alone do not prove access.
