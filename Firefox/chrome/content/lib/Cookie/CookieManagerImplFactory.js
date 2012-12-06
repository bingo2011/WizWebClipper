Wiz.CookieManagerImplFactory = {
	bBrowserType : function (navigator, browserName) {
		var uA = navigator.userAgent.toLowerCase();
		return uA.indexOf(browserName) > -1;
	},
	getManagerImpl : function (navigator) {
		if(Wiz.CookieManagerImplFactory.bBrowserType(navigator, "firefox")) {
			return new Wiz.MozillaCookieManagerImpl();
		}
	}
}