(function() {
	if ( typeof Wiz != "undefined" && typeof Wiz.ScriptLoader != "undefined" ) {
		Wiz.ScriptLoader.load([
			"chrome://wiznote-webclipper/content/lib/Preview/ContentVeil.js",
			"chrome://wiznote-webclipper/content/lib/Preview/hatena-extract-content/extract-content-all.js",
			"chrome://wiznote-webclipper/content/lib/Preview/PageInfo.js",
			"chrome://wiznote-webclipper/content/lib/Preview/Preview.js",
			"chrome://wiznote-webclipper/content/lib/Preview/GlobalUtils.js"
		]);
	}
})();