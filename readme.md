# ducktappe.js

Ducktape.js is a specialized proxy server that can be used to patch/modify a live site into something else.

## Usage scenarios
- Creating usable prototypes for new layouts or design changes
- Testing frontend optimization scenarios
- Test a bug fixes directly on production servers

# Installation

    npm install ducktape

# Usage

First create a proxy server. The proxy server is created with [node-http-proxy|https://github.com/nodejitsu/node-http-proxy] :

    var ducktape = require("./ducktape");
    var JDM = ducktape({
        host: "www.journaldemontreal.com",
        port: "80"
    });

The add routes for the url you want to capture. Any uncaught url's will be simply proxyed. The router used is created with [Director|https://github.com/flatiron/director] :

    JDM.router.get("/sports", function () {
        ...
    });

# Helpers

Inside each route handlers you have access to the request, the response and a few helpers making modifications.

## this.pass 

The .pass() helper will simply pass on the request to the proxy. This can be usefull for simple changes headers or logging. When using .pass you must also tell director to stream the request:

    JDM.router.get("/sports", { stream: true }, function () {
        this.pass();
    });


## this.patch 

The .patch() handler return the body of the page as a string for you to modify and send back.

    JDM.router.get("/sports", function () {
        console.log("Remplacement des URLs");
        this.patch(function (err, body) {
            // Replace all occurence of the domain name
            newBody = body.replace(/http:\/\/www.journaldemontreal.com\//g, "http://localhost:8080/").trim();
            // Write a "success" header
            this.res.writeHead(200)
            // Send back the new content to the browser
            this.res.end(newBody);
        });
    });



## this.patchDOM

The .patchDOM() will return a JSDOM instance with jQuery already loaded in the dom. This allows you to transform the page as if you we're in a browser.

You are still reponsible for sending back the request.

    JDM.router.get("/sports", function () {
        this.patchDOM(function (err, window) {
            console.log("Removing all scripts");

            // Remove all scripts and stylesheets
            window.$("script").remove();
            window.$("link[rel='stylesheet']").remove();
            // Read the modified html source from the dom
            var newHTML = window.document.innerHTML;
            // Add back the doctype lost by JSDOM
            newHTML = "<!DOCTYPE html>" + newHTML;
            // Write a "success" header
            this.res.writeHead(200)
            // Send back the new content to the browser
            this.res.end(newHTML);
        });
    });

## Without helpers

You can also handle the request and response without any helpers:

    JDM.router.get("/custom", function () {
        this.res.write("Some custom page!!!");
        this.res.end();
    })

# Feature Roadmap

- Helper to return the content
- Helper to path to local files
- Better handling of mimetypes
- Automatic re-use of Doctype when using .patchDOM
- Use helpers to create routes instead of using the router directly.

# Credits and License

Mathieu Sylvain, http://nurun.com

Released under BSD!



