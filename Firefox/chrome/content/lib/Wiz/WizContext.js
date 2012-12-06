// 'use strict';

Wiz.Context = function () {
	this.__defineSetter__('token', this.setToken);
	this.__defineGetter__('token', this.getToken);
	this.__defineSetter__('user', this.setUser);
	this.__defineGetter__('user', this.getUser);
	this.__defineSetter__('category', this.setCategory);
	this.__defineGetter__('category', this.getCategory);
};

Wiz.Context.prototype._token = null;
Wiz.Context.prototype._user = null;
Wiz.Context.prototype._category = null;

Wiz.Context.prototype.getToken = function () {
	//token具有时效性，所以每次都需要重新获取，如果过期则不可使用
	this._token = null;
	var cookie = Wiz.getTokenCookie();
	if (cookie && cookie.value) {
		this._token = cookie.value;
	}
	Wiz.logger.debug('Wiz.Context.getToken(): ' + this._token);
	return this._token;
};

Wiz.Context.prototype.setToken = function (token) {
	this._token = token;
};

Wiz.Context.prototype.getUser = function () {
	return this._user;
};
Wiz.Context.prototype.setUser = function (user) {
	if(user instanceof Wiz.User) {
		this._user= user;
	}
};
Wiz.Context.prototype.getCategory = function () {
	return this._category;
};
Wiz.Context.prototype.setCategory = function (category) {
	this._category = category;
};