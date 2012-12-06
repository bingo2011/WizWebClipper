(function() {
    if ( typeof Wiz != "undefined" && typeof Wiz.ScriptLoader != "undefined" ) {
		Wiz.ScriptLoader.load([
			"chrome://wiznote-webclipper/content/lib/Modal/Document.js",
			"chrome://wiznote-webclipper/content/lib/Modal/User.js"
		]);
	}
})();