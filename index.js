
var highlight = require('pygmentize-bundled')
var ms = require('parse-duration')
var fs = require('lift-result/fs')
var rmdir = require('rm-r/sync')
var get = require('solicit').get
var compile = require('marked')
var map = require('map/async')
var path = require('path')
var ejs = require('ejs')

var css = __dirname + '/css'

if (fs.existsSync(css)) {
  var stat = fs.statSync(css)
  var age = Date.now() - stat.mtime
} else {
  fs.mkdirSync(css)
  var age = Infinity
}

// update css if old

if (age > ms('5 days')) {
  var urls = get('https://github.com/aheckmann/greadme').then(function(body){
    var r = /href=["']([^"']+\.css)/g
    var arr = []
    var m
    while (m = r.exec(body)) arr.push(m[1])
    return arr
  })
  rmdir(css)
  fs.mkdirSync(css)
  var stylesheets = map(map(urls, get), function(css, i){
    var name = css + '/' + i + '.css'
    fs.writeFile(name, css)
    return css
  })
} else {
  var stylesheets = map(fs.readdir(css), function(name){
    return fs.readFile(css + '/' + name, 'utf8')
  })
}

module.exports = function(opts){
  var dir = path.resolve(opts.directory)

  return function(req, res, next){
    var file = req.url

    if (!(/\.m(?:d|arkdown)$/i).test(file)) return next()

    file = path.join(dir, file)

    fs.readFile(file, 'utf8').read(function(md){
      var template = fs.readFileSync(__dirname + '/index.html', 'utf8')
      compile(md, {
        gfm: true,
        pedantic: false,
        tables: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        highlight: function(code, lang, done){
          highlight({lang: lang, format: 'html'}, code, done)
        }
      }, function(e, html){
        if (e) return next(e)
        stylesheets.then(function(css){
          res.end(ejs.render(template, {
            title: path.relative(dir, file),
            markdown: html,
            css: css
          }))
        }).read(null, next)
      })
    }, next)
  }
}
