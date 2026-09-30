#!/usr/bin/env bash
set -euo pipefail

# t3.micro has 1 GB RAM and no swap; npm ci / tsc get OOM-killed without it.
# Idempotent: skipped if swap is already active (deploys and config updates reuse it).
if ! swapon --show | grep -q '/swapfile'; then
  if [ ! -f /swapfile ]; then
    dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile
fi

# Executed in the bundle root by Beanstalk before container_commands.
# Keep the workspace lockfile; do not ship Windows node_modules.
export PRISMA_SKIP_POSTINSTALL_GENERATE=true
npm ci --include=dev --workspace=server --include-workspace-root
npm run prisma:generate:postgres --workspace=server
# CI ships a prebuilt server/dist; only compile on the instance as a fallback.
if [ ! -s server/dist/server.js ]; then
  npm run build --workspace=server
fi

# Fail deployment here instead of starting a process with no entry point.
test -s server/dist/server.js
node --check server/dist/server.js

# Retain Prisma CLI for the subsequent leader-only migration command.
