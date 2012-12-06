(function() {
    if ( typeof Wiz != "undefined" && typeof Wiz.ScriptLoader != "undefined" ) {
		Wiz.ScriptLoader.load([
			"chrome://wiznote-webclipper/content/lib/Remote/xmlrpc.js",
			"chrome://wiznote-webclipper/content/lib/Remote/Remote.js"
		]);
	}
})();