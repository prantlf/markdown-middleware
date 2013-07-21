
test: node_modules
	@node test.js

node_modules: package.json
	@npm install
	@npm dedupe
	@touch node_modules

.PHONY: test