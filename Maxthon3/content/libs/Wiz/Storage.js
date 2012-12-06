// 'use strict';
Wiz.Storage = function () {
	this.__defineGetter__('impl', this.getMxImpl);
};

Wiz.Storage.prototype._mxImpl = null;

Wiz.Storage.prototype.getMxImpl = function () {
	if (!this._mxImpl) {
		this._mxImpl = Wiz.maxthon.storage;
	}
	return this._mxImpl;
};

Wiz.Storage.prototype.get = function (key) {
	var value = this.impl.getConfig(key);
	return value;
};

Wiz.Storage.prototype.set = function (key, value) {
	this.impl.setConfig(key, value);
};
