// "use strict";
Wiz.Cookie = function (obj) {
	this.initialize(obj);
};

Wiz.Cookie.prototype.name = null;
Wiz.Cookie.prototype.value = null;
Wiz.Cookie.prototype.path = null;
Wiz.Cookie.prototype.host = null;
Wiz.Cookie.prototype.expires = null;
Wiz.Cookie.prototype.isSecure = null;
Wiz.Cookie.prototype.isDomain = null;

Wiz.Cookie.prototype.initialize = function (obj) {
	if (obj && typeof obj === 'object'){
		for (var key in obj){
			this[key] = obj[key];
		}
	}
};
Wiz.Cookie.getExpiresDate = function (expiresSec) {
	var now = new Date();
	now.setSeconds(now.getSeconds() + expiresSec);
	return now;
}