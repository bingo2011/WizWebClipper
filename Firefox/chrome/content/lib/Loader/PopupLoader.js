(function() {
    if ( typeof Wiz != "undefined" && typeof Wiz.ScriptLoader != "undefined" ) {
		Wiz.ScriptLoader.load([
			"chrome://wiznote-webclipper/content/lib/Popup/scripts/WizObject.js",
			"chrome://wiznote-webclipper/content/lib/Popup/scripts/ZtreeController.js",
			"chrome://wiznote-webclipper/content/lib/Popup/scripts/PopupView.js",
			"chrome://wiznote-webclipper/content/lib/Popup/scripts/NotePageControl.js",
			"chrome://wiznote-webclipper/content/lib/Popup/scripts/LoginControl.js", 
			"chrome://wiznote-webclipper/content/lib/Popup/Popup.js"
		]);
	}
})();