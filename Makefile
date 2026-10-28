.PHONY: install test check start schema

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
