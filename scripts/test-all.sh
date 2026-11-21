#!/usr/bin/env bash
# Full verification: lint, types, production build, unit tests, then every browser suite.
# Browser suites use the Playwright that ships with the dev container: NODE_PATH=$(npm root -g)
set -u
cd "$(dirname "$0")/.."
export NODE_PATH="$(npm root -g)"
fail=0
step() { echo; echo "━━ $1"; shift; "$@" || fail=1; }

step "lint"       npx eslint .
step "typecheck"  npx tsc --noEmit
step "build"      npx next build
pkill -f next-server 2>/dev/null; sleep 1
(npx next start -p 3111 >/tmp/wd-server.log 2>&1 &)
for _ in $(seq 1 30); do curl -s -o /dev/null localhost:3111/ && break; sleep 0.5; done

step "unit: match-3 engine"  node --no-warnings e2e/match-logic.test.mjs
step "unit: bubble engine"   node --no-warnings e2e/bubble-logic.test.mjs
for s in platform layout rewards memory puzzle match tree snowman workshop delivery bubble lifecycle pwa; do
  step "e2e: $s" node e2e/$s.cjs
done
pkill -f next-server 2>/dev/null
echo; [ $fail -eq 0 ] && echo "✅ EVERYTHING PASSED" || echo "❌ SOMETHING FAILED"
exit $fail
