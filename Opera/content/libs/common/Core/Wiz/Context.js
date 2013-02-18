/**
 * 存放Wiz上下文信息，如：token、当前用户信息，以及以后可能会增加的kb相关信息
 */
'use strict';
Wiz.Context = function () {
	this.__defineGetter__('token', this.getToken);
	this.__defineSetter__('token', this.setToken);
	this.__defineGetter__('userId', this.getUserId);
	this.__defineSetter__('userId', this.setUserId);
	this.__defineGetter__('authority', this.getAuthority);
	this.__defineSetter__('authority', this.setAuthority);
	this.__defineGetter__('kbGuid', this.getKbGuid);
	this.__defineSetter__('kbGuid', this.setKbGuid);

};

Wiz.Context.prototype._token = '';
Wiz.Context.prototype._userId = '';
Wiz.Context.prototype._authority = '';//userid + '*' + md5.password
Wiz.Context.prototype._kbGuid = '';

Wiz.Context.prototype.getToken = function () {
	//不能返回null，xmlrpc会报错
	return this._token;
};

Wiz.Context.prototype.setToken = function (token) {
	if (typeof token !== 'string') {
		console.error('TypeError: Wiz.Context.setToken() token is not a string object');
		return;
	} 
	this._token = token;
};

Wiz.Context.prototype.getUserId = function () {
	if (this._userId === '') {
		return null;
	}
	return this._userId;
};

Wiz.Context.prototype.setUserId = function (userId) {
	if (typeof userId !== 'string') {
		console.error('TypeError: Wiz.Context.setUserId() userId is not a string object');
		return;;
	}
	this._userId = userId;
};

Wiz.Context.prototype.getAuthority = function () {
	if (this._authority === '') {
		return null;
	}
	return this._authority;
};

Wiz.Context.prototype.setAuthority = function (authority) {
	if (typeof authority !== 'string') {
		console.error('TypeError: Wiz.Context.setAuthority() authority is not a string object');
		return;;
	}
	this._authority = authority;
};

Wiz.Context.prototype.getKbGuid = function () {
	return this._kbGuid;
};

Wiz.Context.prototype.setKbGuid = function (kbGuid) {
	if (typeof kbGuid === 'string') {
		this._kbGuid = kbGuid;
	}
};