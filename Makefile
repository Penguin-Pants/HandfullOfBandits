.PHONY: install test check start

install:
	cd sim && npm ci

test:
	cd sim && npm test

check:
	cd sim && npm run check

start:
	cd sim && npm start
