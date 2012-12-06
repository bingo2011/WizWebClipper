(function() {
    if ( typeof Wiz != "undefined" && typeof Wiz.ScriptLoader != "undefined" ) {
		Wiz.ScriptLoader.load([
			"chrome://wiznote-webclipper/content/lib/Clip/ContentClipper.js",
			"chrome://wiznote-webclipper/content/lib/Clip/ClipSender.js",
			"chrome://wiznote-webclipper/content/lib/Clip/ClipNotificator.js",
			"chrome://wiznote-webclipper/content/lib/Clip/ClipManager.js"
		]);
	}
})();