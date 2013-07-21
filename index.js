
// var highlight = require('peacock').highlight
// var compile = require('marked')
var rmdir = require('rmdir/sync')
var Batch = require('batch')
var https = require('https')
var path = require('path')
var ejs = require('ejs')
var fs = require('fs')
var ms = require('ms')

// TODO: render html locally
// compile.setOptions({
// 	gfm: true,
// 	pedantic: false,
// 	sanitize: false,
// 	tables: true,
// 	breaks: true,
// 	highlight: function(code, lang){
// 		if ('js' === lang) {
// 			try { return highlight(code, { linenos: false }) }
// 			catch (e) {}
// 		}
// 	}
// })

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

		fs.readFile(file, 'utf8', function(err, md){
			if (err) return next(err)
			https.request({
				hostname: 'api.github.com',
				path: '/markdown/raw',
				method: 'POST',
				headers: {
					'content-type': 'text/plain',
					'user-agent': 'connect-md'
				}
			}, function(gh){
				buffer(gh, function(e, content){
					var template = fs.readFileSync(__dirname + '/index.html', 'utf8')
					var html = ejs.render(template, {
						css: fs.readdirSync(cssDir).map(function(name){
							return fs.readFileSync(cssDir + '/' + name, 'utf8')
						}),
						markdown: content,
						title: req.url
					})
					res.end(html)
				})
			}).on('error', next)
				.end(md)
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