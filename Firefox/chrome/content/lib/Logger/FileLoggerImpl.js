/**
 * 使用XPCOM FILE I/O API来保存日志信息，方便以后查看
 */
// 'use strict';
Wiz.FileLoggerImpl = function () {
	// this.initialize();
};

Wiz.inherit(Wiz.FileLoggerImpl, Wiz.LoggerImpl, true);

Wiz.FileLoggerImpl.ENABLED = true;
Wiz.FileLoggerImpl.LOG_FILE_NAME = 'ff_wiz.log';

Wiz.FileLoggerImpl.prototype._file = null;

Wiz.FileLoggerImpl.prototype.initialize = function () {
	try {
		var profilePath = Components.classes[ "@mozilla.org/file/directory_service;1" ].getService( Components.interfaces.nsIProperties ).get( "ProfD", Components.interfaces.nsIFile ).path;

		 
		var file = Components.classes[ "@mozilla.org/file/local;1" ].createInstance( Components.interfaces.nsILocalFile );
        file.initWithPath(profilePath + Wiz.SLASH + this.constructor.LOG_FILE_NAME);

        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);		
		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x10, 0666, 0); 

		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		this._file = converter;
	} catch(err) {
		this.constructor.ENABLED = false;
	}
};

Wiz.FileLoggerImpl.prototype.debug = function (message) {
	this.write(this.parent.constructor.DEBUG_PREFIX + message);
};
Wiz.FileLoggerImpl.prototype.info = function (message) {
	this.write(this.parent.constructor.INFO_PREFIX + message);
};
Wiz.FileLoggerImpl.prototype.warn = function (message) {
	this.write(this.parent.constructor.WARN_PREFIX + message);
};
Wiz.FileLoggerImpl.prototype.error = function (message) {
	this.write(this.parent.constructor.ERROR_PREFIX + message);
};

Wiz.FileLoggerImpl.prototype.write = function (message) {
	this.initialize();
	if (!this.constructor.ENABLED ) {
		return;
	}
	var curTime = new Date(),
		msg = [curTime.toLocaleFormat(), " ", message, '\r\n'].join('');
	try{
		this._file.writeString(msg);
		this._file.flush();
		this._file.close();
	} catch (err) {
		this.constructor.ENABLED = false;
	}
};