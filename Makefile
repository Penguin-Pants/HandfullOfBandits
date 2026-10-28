.PHONY: install test check start schema validate

install:
	cd sim && npm ci

test:
	cd sim && npm test

check:
	cd sim && npm run check

start:
	cd sim && npm start

schema:
	cd sim && npm run schema

# Usage: make validate DIR=<package-dir>
validate:
	cd sim && npm run --silent sim -- validate "$(abspath $(DIR))"
