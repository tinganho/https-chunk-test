
var express = require('express')
  , http = require('http')
  , https = require('https')
  , fs = require('fs')
  , privateKey  = fs.readFileSync('sslcert/server.key', 'utf8')
  , certificate = fs.readFileSync('sslcert/server.crt', 'utf8')
  , credentials = { key: privateKey, cert: certificate };

var app = express();

var html = fs.readFileSync('index.html');
var privateKey = fs.readFileSync('sslcert/server.key');
var certificate = fs.readFileSync('sslcert/server.crt');

app.use(express.static(__dirname));

app.use(express.bodyParser({ uploadDir: __dirname + '/tmp' }));
app.use(express.logger('dev'));
app.use(express.query());
app.use(express.compress());
app.use(express.errorHandler());
app.use(express.cookieParser());
app.use(app.router);

app.post('/pictures', function(req, res) {
  setTimeout(function() {
    res.set('Connection', 'close');
    res.send('ok');
  }, 0);
});

var httpServer = http.createServer(app);
var httpsServer = http.createServer(app);

httpServer.listen(3300);
httpsServer.listen(3301);

console.log('Server started');
