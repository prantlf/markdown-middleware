
# markdown-middleware

  middleware for serving markdown files as rendered HTML. It makes an effort to render a closely as possible to the style of github but stops short of actually using githubs API to keep performance snappy.

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