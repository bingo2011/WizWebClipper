(function(){
	if ( typeof Wiz != "undefined" && typeof Wiz.ScriptLoader != "undefined" ) {
		Wiz.ScriptLoader.load([
			"chrome://wiznote-webclipper/content/lib/Cookie/Cookie.js",
			"chrome://wiznote-webclipper/content/lib/Cookie/CookieManagerImpl.js",
			"chrome://wiznote-webclipper/content/lib/Cookie/MozillaCookieManagerImpl.js",
			"chrome://wiznote-webclipper/content/lib/Cookie/CookieManagerImplFactory.js",
			"chrome://wiznote-webclipper/content/lib/Cookie/CookieManager.js"
		]);
	}
})();