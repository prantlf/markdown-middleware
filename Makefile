
test: node_modules
	@node test.js

node_modules: package.json
	@packin install --meta $< --folder $@

.PHONY: test
