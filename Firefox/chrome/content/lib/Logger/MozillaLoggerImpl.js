/**
 * 使用consoleService API来保存日志，输出在控制台
 */
// 'use strict';
Wiz.MozillaLoggerImpl = function () {
	this.__defineGetter__('console', this.getConsoleLogger);
};

Wiz.inherit(Wiz.MozillaLoggerImpl, Wiz.LoggerImpl, true);

Wiz.MozillaLoggerImpl.prototype._consoleService = null;

Wiz.MozillaLoggerImpl.prototype.getConsoleLogger = function () {
	if (!this._consoleService) {
		this._consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    }
    return this._consoleService;
};

Wiz.MozillaLoggerImpl.prototype.debug = function (message) {
	this.console.logStringMessage(this.parent.constructor.DEBUG_PREFIX + message);
};
Wiz.MozillaLoggerImpl.prototype.info = function (message) {
	this.console.logStringMessage(this.parent.constructor.INFO_PREFIX + message);
};
Wiz.MozillaLoggerImpl.prototype.warn = function (message) {
	this.console.logStringMessage(this.parent.constructor.WARN_PREFIX + message);
};
Wiz.MozillaLoggerImpl.prototype.error = function (message) {
	this.console.logStringMessage(this.parent.constructor.ERROR_PREFIX + message);
};