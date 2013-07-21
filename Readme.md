
# markdown-middleware

  middleware for serving markdown files as rendered HTML. Currently it uses githubs API to do the rendering but will switch to local rendering when I find something that can handle the syntax highlighting of all github's languages.

## Installation

	$ npm install markdown-middleware --save

then in your app:

```js
var markdown = require('markdown-middleware')
```

## Usage

just make sure you `use` it before static or similar middleware

```js
app.use(markdown({
  // files will be looked for relative to
  // to this path
  directory: __dirname + '/public'
}))
```

## Running the tests

```bash
$ make test
```