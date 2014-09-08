'use strict';

var log = require('./logging.js').getLogger('server.js');
var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var path = require('path');

var mongoDriver = require('./mongoDriver.js');
var config = require('./config.js');

var rosterControllerModule = require('./RosterController.js');

var app = express();

app.disable('view cache');

// Static data
app.use(express.static(path.join(process.cwd(), 'build', 'client')));

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}

	var roster= new rosterControllerModule.RosterController(mongoDriver);

	app.get('/', function(req, res) {res.redirect('/search')});
	app.get('/search', function (req,res){roster.search(req,res)});
	app.get('/roster/:id', bodyParser.json(), function(req, res){roster.roster(req, res);});

// Static data
//	app.use(express.static(path.join(process.cwd(), 'build', 'client')));

//	app.all('/my*',fsCtrl2.handle);
	
	app.use(express.static(__dirname + '/public'));
	app.use(errorhandler({ dumpExceptions: true, showStack: true }));
	
	log.verbose('Configuring photos sub applicaction');

	if (process.env.REGISTRIES_PRODUCTION || true) {
		// We are in production environment, use only http port

		var port = config.webserverPort;
		var host = config.webserverHost;

		// Create an HTTP service.
		http.createServer(app)
		.listen(port, host, function() {
			log.info('Http server listening at %s:%s', host, port);
		});
	} else {
		// We are NOT in production environment, use https port

		var port = config.webserverSecurePort;
		var host = config.webserverHost;

		var sslKey =fs.readFileSync(path.join(process.cwd(), 'build', 'server', 'ssl', 'server.key'));
		var sslCert =fs.readFileSync(path.join(process.cwd(), 'build', 'server', 'ssl', 'server.crt'));

		var ssl = {
				key: sslKey.toString(),
				cert: sslCert.toString(),
				passphrase: 'changeit'
		};

		// Create an HTTPS service identical to the HTTP service.
		https.createServer(ssl, app)
		.listen(port, host, function(){
			log.info('Https (secure) server listening at %s:%s', host, port);
		});
	}
});
