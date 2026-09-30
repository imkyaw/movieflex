#!/usr/bin/env bash
set -euo pipefail
test -s server/dist/server.js
node --check server/dist/server.js
