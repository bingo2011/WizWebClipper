/**
 * 用来存放简单的配置，如：当前用户、用户当前选项的内容(暂未添加)
 */
// 'use strict';
Wiz.PrefStorage = function () {
	this.__defineGetter__('prefService', this.getPrefService);
	this.initialize();
};
Wiz.PrefStorage.prototype._prefSrv = null;

Wiz.PrefStorage.prototype.initialize = function () {
	this._prefSrv = this.getPrefService();
}

Wiz.PrefStorage.prototype.getPrefService = function () {
	try {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.wiz.");
	    return prefs;
	} catch (err) {
		Wiz.logger.error('Wiz.PrefStorage.getPrefService() Error : ' + err);
	}
};

Wiz.PrefStorage.prototype.get = function (name, type) {
	var value = null;
	if (type) {
		try{
			switch (type) {
			case 'char':
				value = this._prefSrv.getCharPref(name);
				break;
			case 'boolean':
				value = this._prefSrv.getBoolPref(name);
				break;
			case 'int':
				value = this._prefSrv.getIntPref(name);
				break;
			}
		} catch (err) {
			Wiz.logger.error('Wiz.PrefStorage.get() Error : ' + err);
		}
	}
	return value;
};

Wiz.PrefStorage.prototype.set = function (name, value, type) {
	if (type) {
		try{
			switch (type) {
			case 'char':
				this._prefSrv.setCharPref(name, value);
				break;
			case 'boolean':
				this._prefSrv.setBoolPref(name, value);
				break;
			case 'int':
				this._prefSrv.setIntPref(name, value);
				break;
			}
		} catch (err) {
			Wiz.logger.error('Wiz.PrefStorage.set() Error : ' + err);
		}
	}
};

Wiz.PrefStorage.prototype.remove = function (name) {
	try{
		this._prefSrv.clearUserPref(name);
	} catch (err) {
		Wiz.logger.error('Wiz.PrefStorage.remove() Error : ' + err);
	}
};

Wiz.PrefStorage.prototype.removeAll = function () {

};