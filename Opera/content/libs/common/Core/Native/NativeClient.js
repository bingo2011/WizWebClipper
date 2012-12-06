'use strict';
Wiz.NativeClient = function () {
	this.__defineGetter__('client', this.getClient);
};

Wiz.NativeClient.APP_ID = 'wiz-local-app';

Wiz.NativeClient.prototype._nativeClient = null;


Wiz.NativeClient.prototype.isInstalled = function() {
	var bInstalled = false;
	if (this.client !== null) {
		bInstalled = true;
	}
	return bInstalled;
};

Wiz.NativeClient.prototype.getClient = function () {
	if (this._nativeClient === null) {
		this._nativeClient = this.get(Wiz.NativeClient.APP_ID);
	}
	return this._nativeClient;
};

Wiz.NativeClient.prototype.get = function (embedId) {
	var client = null;
	if (typeof embedId === 'string') {
		var embedElem = document.getElementById(embedId);
		var version = embedElem.Version;
		if (typeof version !== 'undefined') {
			client = embedElem;
		} else {
			console.warn('Wiz.NativeClient.get(): Can not get client version.');
		}
	} else {
		console.error('TypeError: Wiz.NativeClient.get(): elemId is not a string.');
	}
	return client;
};

Wiz.NativeClient.prototype.getCategory = function (userid) {
	var category = ""; //初始化为空字符串，否则容易导致前端显示错误
	if (typeof userid !== 'string') {
		console.warn('TypeError: Wiz.NativeClient.getCategory() userid is not a string.');
	}
	if (this.client !== null) {
		try {
			category = this.client.GetAllFolders(userid);
		} catch (err) {
			console.error('Wiz.NativeClient.getCategory() GetAllFolders Error: ' + err);
		}
	}
	return category;
};

Wiz.NativeClient.prototype.saveDocument = function (info) {
	if (this.isInstalled() === false) {
		console.error('Save Error: Wiz.NativeClient.saveDocument(). Can not use native clip , because client is not installed.');
	}
	try {
		this.client.Execute(info.params);
	} catch (err) {
		console.error('Wiz.NativeClient.saveDocument() Error: ' + err);
	}
};