/**
 * 使用sessionStorage和localStorage分别来存储不同功能的信息
 */
'use strict';
Wiz.StorageManager = function () {
	this.intialize();
};

Wiz.StorageManager.prototype._hasSessionStorage = true;
Wiz.StorageManager.prototype._hasLocalStorage = true;

Wiz.StorageManager.prototype.intialize = function () {
	if (window.sessionStorage) {
		this._hasSessionStorage = true;
	}
	if (window.localStorage) {
		this._hasSessionStorage = true;
	}
};

Wiz.StorageManager.prototype.set = function (key, value, bSession) {
	try {
		if (bSession && this._hasSessionStorage) {
			window.sessionStorage.setItem(key, value);
			console.error('sessionStorage');
		} else if (this._hasLocalStorage) {
			console.error('localStorage');
			window.localStorage.setItem(key, value);
		}
		console.error('Wiz.StorageManager.set() key: ' + key + ';value: ' + value);
	} catch (err) {
		console.error('Wiz.StorageManager.set() Error: ' + err);
	}
};

Wiz.StorageManager.prototype.get = function (key, bSession) {
	var storageValue = null;
	try {
		if (bSession && this._hasSessionStorage) {
			console.error('sessionStorage');
			storageValue = window.sessionStorage.getItem(key);
		} else if (this._hasLocalStorage) {
			console.error('localStorage');
			storageValue = window.localStorage.getItem(key);
		}
	} catch (err) {
		console.error('Wiz.StorageManager.get() Error: ' + err);
	}
	console.error('Wiz.StorageManager.get() key: ' + key + ';value: ' + storageValue + ';bSession: ' + bSession);
	return storageValue;
};

Wiz.StorageManager.prototype.remove = function (key) {
	try {
		window.localStorage.removeItem(key);
		window.sessionStorage.removeItem(key);
	} catch (err) {
		console.error('Wiz.StorageManager.remove() Error: ' + err);
	}
};
