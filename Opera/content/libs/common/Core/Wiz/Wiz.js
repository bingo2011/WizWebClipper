if (typeof Wiz === 'undefined') {
	'use strict';
	var Wiz = {
		_notification: null,
		_context: null,
		_storageManager: null,
		_remote: null,
		_native: null,
		_background: null
	};
	Wiz.SERVER_URL = 'http://webclip.openapi.wiz.cn/wizkm';
	Wiz.XMLRPC_URL = Wiz.SERVER_URL + '/xmlrpc';
	Wiz.POST_DOCUMENT_URL = Wiz.SERVER_URL + '/a/web/post?';

	Wiz.getNotification = function () {
		if (this._notification === null) {
			this._notification = new Wiz.Notification();
		}
		return this._notification;
	};

	Wiz.getContext = function () {
		if (this._context === null) {
			this._context = new Wiz.Context();
		}
		return this._context;
	};

	Wiz.setContext = function (context) {
		if (context instanceof Wiz.Context) {
			this._context = context;
		}
	};
	Wiz.getStorageManager = function () {
		if (this._storageManager === null) {
			this._storageManager = new Wiz.StorageManager();
		}
		return this._storageManager;
	};
	Wiz.getRemote = function () {
		if (this._remote === null) {
			this._remote = new Wiz.Remote();
		}
		return this._remote;
	};
	Wiz.getNative = function () {
		if (this._native === null) {
			this._native = new Wiz.NativeClient();
		}
		return this._native;
	};
	Wiz.getBackground = function () {
		if (this._background === null) {
			this._background = new Wiz.OperaBackground();
		}
		return this._background;
	};
}
Wiz.__defineGetter__('notificator', Wiz.getNotification);
Wiz.__defineGetter__('context', Wiz.getContext);
Wiz.__defineSetter__('context', Wiz.setContext);
Wiz.__defineGetter__('storageManager', Wiz.getStorageManager);
Wiz.__defineGetter__('remote', Wiz.getRemote);
Wiz.__defineGetter__('native', Wiz.getNative);
Wiz.__defineGetter__('background', Wiz.getBackground);
