
/*

Note that the router is the "director" library:
https://github.com/flatiron/director


*/

var ducktape = require("./ducktape");

// Créé un serveur proxy vers le Journal de Montreal!
var JDM = ducktape({
	host: "www.journaldemontreal.com",
	port: "80"
});

/*
	Cet exemple untilise un patch en JSDOM/jQuery et enlève les script et styles d'une page en particulier
*/
JDM.router.get("/2013/03/03/adele-en-panne-dinspiration", function () {
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
})

/*
	Cet exemple log les accès à la page des sports et laisse le proxy passer

	NOTE SPECIAL : Quand il y à usage de "this.pass()", il faut aussi spécified { stream: true }

*/
JDM.router.get("/sports", { stream: true }, function () {
	console.log("SECTION DES SPORTS!!!! Mais on fait rien avec...");
	this.pass();
})


/*
	Cet exemple intercepte un url pour répondre quelque-chose de custom
*/
JDM.router.get("/custom", function () {
	this.res.write("Some custom page!!!");
	this.res.end();
})

/*
	Cet exemple intercepte un url pour répondre quelque-chose de custom
*/
JDM.router.get("/custom/:id", function (id) {
	this.res.write("Some custom page with id : " + id + " !!!");
	this.res.end();
})

/*
	Cet exemple utilise un patch en "string" et remplace TOUS les url hard-codé par les url locaux
*/
JDM.router.get("/", function () {
	console.log("Remplacement des URLs");
	this.patch(function (err, body) {
		// Replace all occurence of the domain name
		// Aussi il trim des whitespace non-conformes pour que le browser reconnaisse le contenu html!!!
		newBody = body.replace(/http:\/\/www.journaldemontreal.com\//g, "http://localhost:8080/").trim();
		// Write a "success" header
	    this.res.writeHead(200)
	    // Send back the new content to the browser
	    this.res.end(newBody);
	});
})



JDM.listen("8080");
console.log("Listening on localhost:8080");
