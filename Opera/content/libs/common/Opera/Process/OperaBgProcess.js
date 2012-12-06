/**
 * popup页面调用bgProcess封装
 */
'use strict';
Wiz.OperaBgProcess = function () {
	this.__defineGetter__('process', this.getbgProcess);
	this.__defineGetter__('toolbarBtn', this.getToolbarButton);
	this.__defineGetter__('popup', this.getPopup);
};
Wiz.OperaBgProcess.prototype._bgProcess = null;
Wiz.OperaBgProcess.prototype._toolbarBtn = null;
Wiz.OperaBgProcess.prototype._popup = null;

Wiz.OperaBgProcess.prototype.getbgProcess = function () {
	if (this._bgProcess === null) {
		try {
			this._bgProcess = opera.extension.bgProcess;
		} catch (err) {
			console.error('Wiz.OperaBgProcess.getbgProcess() Error: ' + err);
		}
	}
	return this._bgProcess;
};

Wiz.OperaBgProcess.prototype.getToolbarButton = function () {
	if (this._toolbarBtn === null) {
		this._toolbarBtn = this.process.toolbarButton;
	}
	return this._toolbarBtn;
};
Wiz.OperaBgProcess.prototype.getPopup = function () {
	if (this._popup === null) {
		this._popup = this.toolbarBtn.popup;
	}
	return this._popup;
};

Wiz.OperaBgProcess.prototype.resizePopup = function(width, height) {
	if (typeof width !== 'number' || typeof height !== 'number') {
		console.error('Format Error: Wiz.OperaBgProcess.resizePopup(). width or height is not a number object');
		return;
	}
	this.popup.width = width;
	this.popup.height = height;
};