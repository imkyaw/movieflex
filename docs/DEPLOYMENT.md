# CloudFlex: Elastic Beanstalk console deployment

This guide deploys the existing Express API, not the React client. Do not create EC2 instances manually: Beanstalk creates and manages them. No AWS resources are created by the local packaging script.

## 1. Before launching (stop here until ready to incur charges)

- Choose **Asia Pacific (Sydney), ap-southeast-2** throughout.
- Confirm AWS Budget email alerts and credit expiry. This configuration launches **two t3.micro instances, an ALB and their disks/public IPv4 addresses**. RDS and other usage have separate costs; credits do not guarantee a zero bill.
- Resolve the runtime requirement: the original brief requires Node.js 20, but AWS lists its AL2023 platform retirement as August 13, 2026. Obtain team/lecturer approval for a supported Node.js platform (for example Node.js 22, if offered). Do not deploy an unsupported runtime just to match an old brief. No runtime upgrade is made by these files. Validate the approved major before launch.
- Verify both IAM roles in the console. The service role is `cloudflex-elastic-beanstalk-service-role`; the EC2 instance profile is `cloudflex-ec2-role`. The latter must actually exist as an instance profile with EC2 trust, not just an IAM role.
- Confirm the instance role has the Beanstalk WebTier policy and scoped poster GetObject/PutObject permission for `arn:aws:s3:::cloudflex-posters-team15xaut/posters/*`. Keep that bucket private.
- Copy the Cognito pool ID and ARN directly from its Overview. Compare the ARN with the role's AdminConfirmSignUp policy, including account ID and case. Do not rely on earlier manually transcribed screenshot values.
- Confirm Cognito client `2ajf2cncik71cagqn4ak4pj0dj` has no client secret and allows USER_PASSWORD_AUTH. Mandatory MFA is not supported by the current login flow.
- Follow [ENVIRONMENT.md](ENVIRONMENT.md). Do not upload `.env`, passwords, AWS keys or local databases.

## 2. Prepare networking and RDS

Reuse your existing resources if they match; do not create duplicate networks/databases.

1. In **VPC → Your VPCs**, select the project VPC. Enable DNS resolution and DNS hostnames.
2. In **Subnets**, identify two public edge subnets in different AZs for the ALB, and two public app subnets in those AZs for EC2. Each public subnet's route table needs `0.0.0.0/0` to the attached Internet Gateway. EC2 needs public IPv4 addresses for outbound npm downloads and AWS API access in this cost-conscious design. Public IP does not mean unrestricted inbound access.
3. Identify two private DB subnets in different AZs; create an RDS DB subnet group containing both. Even Single-AZ RDS needs a subnet group spanning two AZs. No public database access is required.
4. In **EC2 → Security Groups**, create/reuse `cloudflex-app-sg` in this VPC. Initially no inbound rules; permit outbound access for installation/AWS services and PostgreSQL. Attach this additional group to Beanstalk instances at step 5 below. This provides a stable RDS source group before EB exists.
5. Create/reuse `cloudflex-db-sg`: inbound PostgreSQL TCP **5432**, source **the cloudflex-app-sg security-group ID**, never `0.0.0.0/0` or your browser IP. Avoid other broad inbound rules.
6. In **RDS**, create/reuse a separate PostgreSQL database, not a database coupled to Beanstalk. For a small assignment, choose Single-AZ and a small supported instance such as `db.t3.micro`, 20 GiB gp3, encrypted storage, initial DB name `cloudflex`, automated backups and deletion protection. Check the console estimate/eligibility before creating; this is not a free-tier promise. Single-AZ is a cost trade-off and is not DB high availability.
7. Select your VPC, private DB subnet group, `cloudflex-db-sg`, and **Public access: No**. Record the endpoint, database name and port. Wait for Available before deploying the API.
8. If using the diagram's S3 gateway endpoint, associate it with app-subnet route tables. Its policy must also allow Beanstalk platform/deployment bucket traffic, not only poster traffic. It does not replace internet access for npm or Cognito.

## 3. Validate and package locally

From the repository root in PowerShell, with dependencies installed:

```powershell
npm ci
npm run lint
npm run prisma:generate:postgres --workspace=server
npm run build
powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/package-backend.ps1
```

Use the new ZIP path printed under `build/`. Each run creates a unique ZIP and does not overwrite an old release. Packaging is not a test: it does not prove migrations or cloud connectivity work. Run the full PostgreSQL migration history against a disposable PostgreSQL database before production. Do not use `migrate reset` on RDS. For an existing DB, back up first, check migration status and reconcile schema/history before deploying.

This is a source bundle: it contains root package manifests, server source/tsconfig, PostgreSQL schema/migrations, and the client workspace manifest only. At ZIP root are `Procfile`, `.ebextensions` and `.platform`. It excludes frontend source, `.env`, SQLite data, Git history and node_modules. The Linux prebuild hook runs locked dependency installation, generates PostgreSQL Prisma and builds the API. It retains dev tools so the migration CLI is available. This trades a slightly larger installation for a simple reproducible deployment.

The leader-only container command then runs `prisma migrate deploy` inside the VPC before the application starts. It does not seed, reset, or migrate on every process restart. Do not run concurrent deployments against the same DB. A rollback of application code does not undo database migrations: use backward-compatible migrations and RDS backups. The pending poster-column rename does not convert old local/remote URLs into S3 keys; re-upload legacy posters separately. Existing duplicate order/movie pairs can block the new unique index; audit before upgrading a populated DB.

If returning to SQLite development after validation, run `npm run prisma:generate --workspace=server` to restore its client.

### Configuration-update build safety

Environment-property changes (such as CLIENT_ORIGIN) use `.platform/confighooks`, not the normal application hooks. Both workflows now run the same prebuild script to install locked dependencies, generate PostgreSQL Prisma and compile the backend. Both also verify `server/dist/server.js` before promotion. Configuration hooks do not explicitly run migrations or seed/reset the database.

For recovery from the missing `server/dist/server.js` error, upload a newly packaged application version containing both hook directories through Beanstalk **Upload and deploy**. Do not just retry the environment-property update against the old ZIP. Wait for both targets to become healthy, then verify/reapply CLIENT_ORIGIN if the previous update rolled it back. Test a subsequent environment-property update to confirm the configuration workflow works on AWS. Local build success alone does not verify that lifecycle.

## 4. Start the console wizard

1. Open **Elastic Beanstalk → Applications → Create application** (or Create environment in an existing application).
2. Application name: `cloudflex`. Environment tier: **Web server**.
3. Environment name: `cloudflex-api-prod`. Choose an available domain prefix; save the resulting hostname later.
4. Platform: **Managed platform → Node.js → Amazon Linux 2023**, using the supported major approved in step 1 and its current recommended patch. Do not choose Docker.
5. Application code: **Upload your code → Local file**. Upload the generated ZIP. Give the application version a unique label such as `cloudflex-api-2026-10-02-01`.
6. Preset: **Custom configuration** or a load-balanced/high-availability preset. Do not choose Single instance; that omits the ALB and does not meet the final rubric.

## 5. Service access and networking

1. Service role: choose `cloudflex-elastic-beanstalk-service-role` (enhanced-health and managed-update permissions as applicable).
2. EC2 instance profile: choose `cloudflex-ec2-role`. If absent, fix the instance profile rather than creating static access keys.
3. Key pair: optional; omit if you do not need SSH. Do not allow public SSH to all IPs.
4. Networking: choose the VPC from step 2. Instance subnets: select the **two public app subnets**, and enable public IP addresses for instances.
5. Database integration: **do not enable** the wizard's attached database. Use the independently managed RDS instance.
6. Instance security groups: add `cloudflex-app-sg`. Leave Beanstalk's managed instance security group in place; it supplies ALB-to-instance access. Verify afterward that the combined groups permit HTTP80 only from the ALB group and do not expose 8080/5432 publicly.

## 6. Capacity, load balancer and deployment options

1. Environment type: **Load balanced**. Capacity: **On-Demand**, x86_64, instance type **t3.micro**, minimum **2**, maximum **4**. Select a gp3 root disk; review its size and price.
2. Scaling trigger: CPUUtilization, Average, Percent; upper **60**, lower **25**, period **5 minutes**, evaluation periods **1**, breach duration **5 minutes**, scale out **+1**, scale in **-1**, cooldown **300 seconds**.
3. Load balancer: **Application Load Balancer**, dedicated, **public/internet-facing**. Select the two public edge subnets across AZs.
4. Listener: HTTP **80**, forwarding to default process HTTP **80**. Nginx proxies locally to Node **8080**. Do not change the target process port to 8080.
5. Default process health check: `/health`, interval **5 seconds**, timeout **2 seconds**, success code **200**, healthy/unhealthy thresholds **3** each.
6. Enhanced health: enabled. Deployment policy: Rolling, fixed batch size **1**, command timeout **1200 seconds**. With two instances, a rolling deployment may temporarily leave one serving traffic.
7. Console settings override `.ebextensions` values. Compare the effective values after creation; uploading the files alone does not prove scaling is configured correctly.

For early debugging you may intentionally override minimum to 1 in the console, but keep a load-balanced environment. This still incurs ALB/instance charges and is not the final rubric configuration. Restore min2/max4 before evidence capture and submission.

## 7. Enter environment properties and launch

1. In the software/environment-properties section, enter all values in [ENVIRONMENT.md](ENVIRONMENT.md). `DATABASE_URL`, `CLIENT_ORIGIN`, and verified Cognito values must be supplied; local `.env` is intentionally absent from the bundle.
2. Keep database credentials out of screenshots, shared documents and Git. URL-encode special characters in the username/password. Use the real RDS database name, not its instance identifier.
3. Review service role, profile, subnet IDs, security groups, database reachability, environment properties, capacity and cost estimate.
4. **Submit/Create environment starts chargeable provisioning.** Stop before this button if you are still in the preparation period. On deployment day, submit and watch Events until creation and deployment complete. Do not repeatedly submit new environments when an error occurs.

## 8. Verify and troubleshoot

1. Copy the EB domain from the environment Overview. Open `http://[EB-DOMAIN]/health`: expect status `ok` and database `connected`. Opening `/` may legitimately return 404.
2. Open `http://[EB-DOMAIN]/api/v1/movies`; it should return a list (possibly empty). Health checks prove connectivity, not that tables/data exist.
3. In EC2 → Target Groups, verify both targets are Healthy; in Auto Scaling Groups, verify min2/max4 and two running instances. Verify CPU alarms rather than the default NetworkOut alarms.
4. For failed deployment, use EB **Logs → Request logs → Full logs** and Events. Check `/var/log/eb-engine.log` for install/build/migration failures and web process logs for startup errors. Redact secrets before sharing logs.
5. Migration timeout: check RDS availability, URL, private routes and DB SG source. Prisma missing: check prebuild installation. Startup failure: check required env properties. HTTP502: check Node process/port. HTTP503 from health: check DB connectivity. HTTP413 on posters: check the packaged nginx upload configuration. S3/Cognito AccessDenied: check instance profile and exact resource ARNs.
6. Do not send real passwords or bearer tokens over the temporary HTTP EB URL. Complete the HTTPS frontend/API entry point before authentication/upload tests. This guide retains the diagram's CloudFront-to-ALB HTTP link, which is not end-to-end encryption. An HTTPS ALB origin requires a valid certificate/domain and is a separate architecture decision.

## 9. Connect the frontend and capture evidence

For the existing CloudFront design, set the private client S3 bucket as the default origin via OAC. Add the EB hostname as a custom HTTP origin, with `/api/*` behavior, all HTTP methods, caching disabled, and Authorization/query-string forwarding (for example AllViewerExceptHostHeader origin-request policy). Do not set an origin path that doubles `/api`. Set viewer protocol to Redirect HTTP to HTTPS. Update CLIENT_ORIGIN to the exact HTTPS distribution origin; build the client with VITE_API_BASE_URL set to that same origin, without `/api/v1`. Do not apply an SPA fallback that turns API errors into HTML. Full CloudFront/OAC setup is separate from this EB runbook.

Once HTTPS routing works, verify register/login, movie listing, admin upload and private presigned poster display. Do not assume existing local users also exist in Cognito. No automatic production seeding is included.

Capture: EB green health and URL; target-group health; autoscaling min/max and CPU triggers; instance-count change under authorized load; CloudWatch CPU graph; private RDS networking; poster objects/private bucket settings; scoped IAM JSON; successful deployment Events/version. Redact secrets and record actual values. GitHub Actions and its pipeline screenshot remain a separate task; these files do not create CI.

Leave the submission running through marking. Do not terminate the environment or delete RDS just after the deadline. Keep monitoring gross usage and remaining credits.

## AWS references

- [Console environment wizard](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/environments-create-wizard.html)
- [Platform retirement schedule](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-schedule.html)
- [Platform hooks](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.hooks.html)
- [Configuration options and scaling/health checks](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html)
- [Container commands and leader-only execution](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/customize-containers-ec2.html)
