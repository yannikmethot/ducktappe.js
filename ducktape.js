
var http = require('http');
var httpProxy = require('http-proxy');
var director = require('director');
var request = require("request");
var jsdom = require("jsdom");


module.exports = function (options) {

	// Create an instance of the url router
	var router = new director.http.Router();

	// create an instance of a server
	var server = http.createServer(onRequest);

	// create a routing proxy
	var proxy = new httpProxy.HttpProxy({
		target: {
			host: options.host,
			port: options.port
		},
		enable : {
			xforward: false // disable X-Forwarded-For headers
		}
		// Broken because the "80" default port is also added
		// changeOrigin: true, // changes the origin of the host header to the target URL
	});


	router.attach(function () {
		// Attach a proxy helper to pass on the request to the default proxy mechanism
    	// this.proxy = proxy;
    	this.patch = patch.bind(this);
    	this.patchDOM = patchDOM.bind(this);
    	this.pass = onPass.bind(this);
  	});

	router.configure({
		notfound: onProxy,
		before: beforeRoute
	})

	function beforeRoute() {
		var req = this.req;
		var res = this.res;
		console.log([req.method, "ROUTED", req.url].join(" - "));
	}

	// Attach the router to the server
	server.router = router;

	// Helper for patching a page with JSDOM
	function patchDOM(callback) {
		var req = this.req;
		var res = this.res;
		var requestOptions = {
			uri: "http://" + options.host + ":" + options.port + req.url
		}
		var boundCallback = callback.bind(this);
		request(requestOptions, function(err, response, body) {
			jsdom.env(body,
				["http://code.jquery.com/jquery.js"],
				function(err, window) {
					boundCallback(err, window);
				}
			);
		})

	}

	// Helper for patching a remote page with the body as a string
	function patch(callback) {
		var uri = "http://" + options.host + ":" + options.port + this.req.url;
		var boundCallback = callback.bind(this);
		request({ uri: uri }, function(err, response, body) {
			boundCallback(err, body);
		});
	}

	// Called when not route is matched
	function onPass() {
		console.log([this.req.method, "PASS", this.req.url].join(" - "));
		proxy.proxyRequest(this.req, this.res);
	}

	// Called when not route is matched
	function onProxy() {
		console.log([this.req.method, "PROXY", this.req.url].join(" - "));
		proxy.proxyRequest(this.req, this.res);
	}

	function onRequest(req, res) {
		//Fake the origin host name to prevent detection and redirections
		req.headers.host = options.host;
		// Dispacth the request to the router
		router.dispatch(req, res);
	}

	console.log("Created a proxy to " + options.host + ":" + options.port);
	return server;
}




