(function() {
    if ( typeof Wiz != "undefined" && typeof Wiz.ScriptLoader != "undefined" ) {
		Wiz.ScriptLoader.load([
			"chrome://wiznote-webclipper/content/lib/Native/MozillaNativeController.js",
			"chrome://wiznote-webclipper/content/lib/Native/DOMNativeController.js",
			"chrome://wiznote-webclipper/content/lib/Native/NativeManager.js"
		]);
	}
})();