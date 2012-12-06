(function() {
    if ( typeof Wiz != "undefined" && typeof Wiz.ScriptLoader != "undefined" ) {
		Wiz.ScriptLoader.load([
			"chrome://wiznote-webclipper/content/lib/Logger/LoggerImpl.js",
			"chrome://wiznote-webclipper/content/lib/Logger/FileLoggerImpl.js",
			"chrome://wiznote-webclipper/content/lib/Logger/MozillaLoggerImpl.js",
			"chrome://wiznote-webclipper/content/lib/Logger/LoggerManager.js"
		]);
	}
})();