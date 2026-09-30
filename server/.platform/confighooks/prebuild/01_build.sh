#!/usr/bin/env bash
set -euo pipefail

# Environment-property updates use confighooks, not application hooks.
# Rebuild in the staging directory before Beanstalk restarts the process.
# Reuse the same dependency installation and PostgreSQL generation steps.
bash .platform/hooks/prebuild/01_build.sh
