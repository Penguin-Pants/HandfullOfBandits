.PHONY: install test check start schema validate rules e2e ux rulebook

install:
	cd sim && npm ci

test:
	cd sim && npm test

check:
	cd sim && npm run check

start:
	cd sim && npm run build && npm start

schema:
	cd sim && npm run schema

# Usage: make validate DIR=<package-dir>
validate:
	cd sim && npm run --silent sim -- validate "$(abspath $(DIR))"

# Usage: make rules DIR=<package-dir>. Rewrites rules.yaml from the research documents (P4-08).
rules:
	cd sim && npm run --silent sim -- rules "$(abspath $(DIR))"

# IC-2 Playwright smoke. Needs Playwright with Chromium on the machine.
e2e:
	cd sim && npm run build && node e2e/smoke.mjs

# Browser UX, viewport and dense-state checks. Same optional Playwright setup as e2e.
ux:
	cd sim && npm run build && node e2e/ux.mjs

# A4 portrait reading edition of the current playable prototype.
rulebook:
	python3 docs/rules/build-rulebook.py
