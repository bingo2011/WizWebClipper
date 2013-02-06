// 'use strict';
Wiz.LoggerManager = function () {
	this.__defineGetter__('mozillaLogger', this.getMozillaLogger);
	this.__defineGetter__('fileLogger', this.getFileLogger);
};

Wiz.LoggerManager.DEBUG_LEVEL = 0;
Wiz.LoggerManager.INFO_LEVEL = 1;
Wiz.LoggerManager.WARN_LEVEL = 2;
Wiz.LoggerManager.ERROR_LEVEL = 3;

//发布之前需要修改
Wiz.LoggerManager.prototype._level = Wiz.LoggerManager.WARN_LEVEL;

Wiz.LoggerManager.prototype._mozillaLogger = null;
Wiz.LoggerManager.prototype._fileLogger = null;

Wiz.LoggerManager.prototype.getMozillaLogger = function () {
	if (!this._mozillaLogger) {
		this._mozillaLogger = new Wiz.MozillaLoggerImpl();
	}
	return this._mozillaLogger;
};

Wiz.LoggerManager.prototype.getFileLogger = function () {
	if (!this._fileLogger) {
		this._fileLogger = new Wiz.FileLoggerImpl();
	}
	return this._fileLogger;
};

Wiz.LoggerManager.prototype.debug = function (message) {
	if (this._level <= this.constructor.DEBUG_LEVEL) {
		this.mozillaLogger.debug(message);
		this.fileLogger.debug(message);
	}
};
Wiz.LoggerManager.prototype.info = function (message) {
	if (this._level <= this.constructor.INFO_LEVEL) {
		this.mozillaLogger.info(message);
		this.fileLogger.info(message);
	}
};
Wiz.LoggerManager.prototype.warn = function (message) {
	if (this._level <= this.constructor.WARN_LEVEL) {
		this.mozillaLogger.warn(message);
		this.fileLogger.warn(message);
	}
};
Wiz.LoggerManager.prototype.error = function (message) {
	if (this._level <= this.constructor.ERROR_LEVEL) {
		this.mozillaLogger.error(message);
		this.fileLogger.error(message);
	}
};