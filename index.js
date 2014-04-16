
var highlight = require('pygmentize-bundled')
var rmdir = require('rm-r/sync')
var compile = require('marked')
var Batch = require('batch')
var https = require('https')
var path = require('path')
var ejs = require('ejs')
var fs = require('fs')
var ms = require('ms')

var stat = fs.statSync(__dirname + '/css')
var age = Date.now() - stat.mtime

// update css if old

if (age > ms('5 days')) {
  get('https://github.com/aheckmann/greadme', function(e, body){
    if (e) throw e
    var r = /href=["']([^"']+\.css)/g
    var batch = new Batch
    var m
    while (m = r.exec(body)) add(m[1])
    function add(url){
      batch.push(function(done){ get(url, done) })
    }
    batch.end(function(e, files){
      if (e) throw e
      rmdir(__dirname + '/css')
      fs.mkdirSync(__dirname + '/css')
      files.forEach(function(css, i){
        var file = __dirname + '/css/' + i + '.css'
        fs.writeFileSync(file, css)
      })
    })
  })
}

module.exports = function(opts){
  var dir = path.resolve(opts.directory)
  var cssDir = __dirname + '/css'

  return function(req, res, next) {
    var file = req.url

    if (!(/\.m(?:d|arkdown)$/i).test(file)) return next()

    file = path.join(dir, file)

    fs.readFile(file, 'utf8', function(e, md){
      if (e) return next(e)
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
        res.end(ejs.render(template, {
          css: fs.readdirSync(cssDir).map(function(name){
            return fs.readFileSync(cssDir + '/' + name, 'utf8')
          }),
          markdown: html,
          title: path.relative(dir, file)
        }))
      })
    })
  }
}

function buffer(stream, cb){
  var buf = ''
  stream.on('readable', function(){
    buf += this.read() || ''
  }).on('end', function(){
    cb(null, buf)
  }).on('error', cb)
}

function get(url, cb){
  https.get(url, function(res){
    buffer(res, cb)
  })
}
