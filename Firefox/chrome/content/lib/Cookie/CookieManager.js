// "use strict";
Wiz.CookieManager = function () {
	this.intialize();
};

Wiz.CookieManager.prototype.intialize = function () {
	this._impl = new Wiz.CookieManagerImplFactory.getManagerImpl(window.navigator);
};

Wiz.CookieManager.prototype.set = function (url, name, value, expires) {
	try {
		var cookie = this.createCookieObj(name, value, expires);
		if (this._impl) {
			this._impl.set(url, cookie);
		}
	} catch (err) {
		Wiz.logger.error('Wiz.CookieManager.set() Error : ' + err);
	}
};

Wiz.CookieManager.prototype.get = function (url, name) {
	try {
		var cookie = null;
		if (this._impl) {
			cookie = this._impl.get(url, name);
		}
		return cookie;
	} catch (err) {
		Wiz.logger.error('Wiz.CookieManager.get() Error : ' + err);
		return null;
	}
};

Wiz.CookieManager.prototype.remove = function (url, name) {
	try {
		if (this._impl) {
			this._impl.remove(url, name);
		}
	} catch (err) {
		Wiz.logger.error('Wiz.CookieManager.remove() Error : ' + err);
	}
};

Wiz.CookieManager.prototype.removeAll = function () {
	try {
		if (this._impl) {
			this._impl.removeAll();
		}
	} catch (err) {
		Wiz.logger.error('Wiz.CookieManager.removeAll() Error : ' + err);
	}
};
Wiz.CookieManager.prototype.createCookieObj = function (name, value, expires) {
	var cookieObj = {
		'name' : name,
		'value' : value
	};
	if (expires) {
		cookieObj.expires = Wiz.Cookie.getExpiresDate(expires);
	}
	return new Wiz.Cookie(cookieObj);
};