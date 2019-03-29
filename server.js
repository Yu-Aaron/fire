'use strict';

var http = require('http');
var httpProxy = require('http-proxy');

var express = require('express');
var compression = require('compression');
var config = require('./config');

var app = express();
var server = module.exports = require('http').Server(app);
var proxy = httpProxy.createProxyServer({
    target: config.host
});

//
// The following code is to debug response of the reversed proxy server
//
// proxy.on('proxyRes', function (proxyRes, req, res) {
//   console.log('proxyRes: ' + JSON.stringify(proxyRes.headers, null, 4));
// });

app.use(compression());
app.use(express.static(__dirname + '/www'));

app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/www');
app.set('view engine', 'html');

app.all('/:api*', function (req, res) {
    var request = req.params.api;
    if ('api' === request || 'sse' === request) {
        proxy.web(req, res);
    } else {
        res.render('index');
    }
});

server.on('upgrade', function (req, socket, head) {
    console.log('upgrade');
    proxy.ws(req, socket, head);
});