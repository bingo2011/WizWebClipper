if (typeof Wiz === 'undefined') {
	// 'use strict';
	var Wiz = {
		_maxthon : null,
		_storage : null,
		_notification : null
	};

	Wiz.getMaxthonAppRt = function () {
		if (!this._maxthon) {
			this._maxthon = new Wiz.Maxthon();
		}
		return this._maxthon;
	};
	Wiz.getStorage = function () {
		if(!this._maxthon) {
			this._maxthon = new Wiz.Maxthon();
		}
		if (!this._storage) {
			this._storage = new Wiz.Storage();
		}
		return this._storage;
	};
	Wiz.getNotification = function () {
		if (!this._notification) {
			this._notification = new Wiz.Notification();
		}
		return this._notification;
	};
}
Wiz.__defineGetter__('maxthon', Wiz.getMaxthonAppRt);
Wiz.__defineGetter__('storage', Wiz.getStorage);
Wiz.__defineGetter__('notification', Wiz.getNotification);
