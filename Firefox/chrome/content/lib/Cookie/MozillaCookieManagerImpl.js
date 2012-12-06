// "use strict";
Wiz.MozillaCookieManagerImpl = function MozillaCookieManagerImpl() {
	this.__defineGetter__("ioService", this.getIoService);
	this.__defineGetter__("cookieManagerService", this.getCookieManagerService);
	this.__defineGetter__("cookieService", this.getCookieService);
};
Wiz.inherit(Wiz.MozillaCookieManagerImpl, Wiz.CookieManagerImpl, true);

Wiz.MozillaCookieManagerImpl.prototype._ioSrv = null;
Wiz.MozillaCookieManagerImpl.prototype._cookieSrv = null;
Wiz.MozillaCookieManagerImpl.prototype._cookieManagerSrv = null;

Wiz.MozillaCookieManagerImpl.prototype.set = function (url, cookie) {
	try {
		var cookieURI = (typeof url === 'string') ? this.ioService.newURI(url, null, null) : null,
			cookieString = cookie.name + "=" + cookie.value + ";";
		cookieString = (cookie.expires) ? (cookieString + "expires=" +  cookie.expires + ";") : cookieString;
		this.cookieService.setCookieString(cookieURI, null, cookieString, null);
	    Wiz.logger.debug('Wiz.MozillaCookieManagerImpl.set() cookies: ' + cookieString);
	} catch (err) {
		Wiz.logger.error('Mozilla Set Cookie Error: ' + err);
	}
	return '';
};

Wiz.MozillaCookieManagerImpl.prototype.get = function (url, name) {
	try {
	    var cookies = [ ],
	    	uri = (url) ? this.ioService.newURI(url, null, null) : null;

	    for (var e = this.cookieManagerService.enumerator; e.hasMoreElements(); ) {
	        var cookie = e.getNext().QueryInterface( Components.interfaces.nsICookie );
	        if ( url && cookie.host == uri.host && cookie.name == name ) {
	            cookies.push( new Wiz.Cookie( cookie ) );
	        }
	    }
	    Wiz.logger.debug('Wiz.MozillaCookieManagerImpl.get() name: ' + name + ';cookies: ' + cookies);
	} catch(err) {
		Wiz.logger.error('Mozilla Get Cookie Error: ' + err);
	}
    return cookies;
};

Wiz.MozillaCookieManagerImpl.prototype.getAll = function(url) {
	try {
	    var cookies = [ ];
	    var uri = (url) ? this.ioService.newURI( url, null, null ) : null;

	    for ( var e = this.cookieManagerService.enumerator; e.hasMoreElements(); ) {
	        var cookie = e.getNext().QueryInterface( Components.interfaces.nsICookie );
	        if ( !url || uri.host == cookie.host ) {
	            cookies.push( new Wiz.Cookie( cookie ) );
	        }
	    }
	} catch(err) {
		Wiz.logger.error('Mozilla Get All Cookie Error: ' + err);
	}
    return cookies;
};

Wiz.MozillaCookieManagerImpl.prototype.remove = function(url, name) {
	try {
        var urlParts = url.split( "://", 2 );
        var domain = (urlParts.length == 2) ? urlParts[ 1 ] : urlParts[ 0 ];
        urlParts = domain.split( "/", 2 );
        var path = (urlParts.length == 2) ? urlParts[ 1 ] : null;

        this.cookieManagerService.remove( domain, name, path, false );
	    Wiz.logger.debug('Wiz.MozillaCookieManagerImpl.remove() name: ' + name);
    }
    catch ( e ) {
		Wiz.logger.error('Mozilla Remove Cookie Error: ' + err);
    }
    return '';
};

Wiz.MozillaCookieManagerImpl.prototype.removeAll = function(url) {
	if (!url) {
		this._cookieManagerSrv.removeAll();
	} else {
		var cookies = this.getAll( url );
        for ( var i = 0; i < cookies.length; i++ ) {
            this.remove( cookies[ i ].name, url );
        }
	}
	return '';
};

Wiz.MozillaCookieManagerImpl.prototype.getIoService = function () {
	if (!this._ioSrv) {
		this._ioSrv = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
	}
	return this._ioSrv;
};

Wiz.MozillaCookieManagerImpl.prototype.getCookieManagerService = function () {
	if (!this._cookieManagerSrv) {
		this._cookieManagerSrv = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
	}
	return this._cookieManagerSrv;
};

Wiz.MozillaCookieManagerImpl.prototype.getCookieService = function () {
	if (!this._cookieSrv) {
		this._cookieSrv = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
	}
	return this._cookieSrv;		
}