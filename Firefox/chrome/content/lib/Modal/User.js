// 'use strict';
Wiz.User = function (username) {
	this.initialize(username);
	this.__defineGetter__('name', this.getUserName);
	this.__defineSetter__('name', this.setUserName);
};

Wiz.User.prototype._username = null;

Wiz.User.prototype.initialize = function (username) {
	this._username = username;
};
Wiz.User.prototype.getUserName = function () {
	if (this._username) {
		return _username;
	}
	return null;
};
Wiz.User.prototype.setUserName = function (username) {
	this._username = username;
};


