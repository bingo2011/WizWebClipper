// "use strict";
Wiz.ClipSender = function (clipManager) {
	this._clipManager = clipManager;
	this.initialize();
};

Wiz.ClipSender.prototype.initialize = function () {
};

Wiz.ClipSender.prototype.postDocument = function (docInfo) {
	Wiz.remote.postDocument(docInfo);
};