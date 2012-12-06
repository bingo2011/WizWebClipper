// "use strict";
Wiz.ClipNotificator = function(clipManager) {
	this.initialize();
	this._clipManager = clipManager;
	this.__defineGetter__('alertsService', this.getAlertService);
};

Wiz.ClipNotificator.prototype._alertsService = null;
Wiz.ClipNotificator.prototype._clipManager = null;

Wiz.ClipNotificator.prototype.initialize = function () {
	if (!this._alertsService) {
		this._alertsService = this.getAlertService();
	}
};

Wiz.ClipNotificator.prototype.showNotification = function (notifiImage, notifiTitle, notifiMsg) {
	if (this._alertsService) {
		this._alertsService.showAlertNotification(notifiImage, notifiTitle, notifiMsg);
	}
};

Wiz.ClipNotificator.prototype.showClipping = function (docTitle) {
	var clippingImageUrl = 'chrome://wiznote-webclipper/skin/images/scissors.png',
		clippingTitle = Wiz.i18n.getMessage('clipResult_clipping');
	this.showNotification(clippingImageUrl, clippingTitle, docTitle);
};

Wiz.ClipNotificator.prototype.showError = function (errorMsg) {
	var errorImageUrl = 'chrome://wiznote-webclipper/skin/images/warning.png',
		errorTitle = Wiz.i18n.getMessage('clipResult_error');
	this.showNotification(errorImageUrl, errorTitle, errorMsg);
};

Wiz.ClipNotificator.prototype.showClipSuccess = function (docTitle) {
	var clippingImageUrl = 'chrome://wiznote-webclipper/skin/images/check.png',
		clippingTitle = Wiz.i18n.getMessage('clipResult_success');
	this.showNotification(clippingImageUrl, clippingTitle, docTitle);
};

Wiz.ClipNotificator.prototype.getAlertService = function () {
	var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
	return alertsService;
};
