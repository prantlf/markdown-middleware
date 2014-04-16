
var connect = require('connect')
var md = require('./')

var app = connect()

app.use(md({
  directory: __dirname
}))

app.listen(3000, function(){
  console.log('listening on %d', 3000)
})
