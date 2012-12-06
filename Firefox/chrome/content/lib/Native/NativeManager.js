// 'use strict';
Wiz.NativeManager = function () {
	this.__defineGetter__('mozillaCtrl', this.getMozillaClient);
};

Wiz.NativeManager.SAVE_CONTENT = 'save_content';
Wiz.NativeManager.SAVE_FULLPAGE = 'save_all';
Wiz.NativeManager.SAVE_SELECTION = 'save_sel';
Wiz.NativeManager.SAVE_URL = 'save_url';
//本地调用XPCOM的client
Wiz.NativeManager.prototype._MozillaNativeCtrl = null;
//dom中调用的client
Wiz.NativeManager.prototype._DOMNativeCtrl = null;

Wiz.NativeManager.prototype.startNativeClip = function (info) {
	if (info) {
		info.cmd = this.getCmdByClipType(info.clipType);
		Wiz.logger.debug('Wiz.NativeManager.startNativeClip ' + info.cmd);
	}
	this.mozillaCtrl.startClip(info);
};

Wiz.NativeManager.prototype.initDOMNativeController = function (win, embedId) {
	this._DOMNativeCtrl = new Wiz.DOMNativeController(win, embedId);
}

Wiz.NativeManager.prototype.getCmdByClipType = function (cliptype) {
	var cmd = null;
	switch (cliptype) {
	case 'fullPage' :
		cmd = Wiz.NativeManager.SAVE_FULLPAGE;
		break;
	case 'article' :
		cmd = Wiz.NativeManager.SAVE_CONTENT;
		break;
	case 'selection' :
		cmd = Wiz.NativeManager.SAVE_SELECTION ;
		break;
	case 'url' :
		cmd = Wiz.NativeManager.SAVE_URL;
		break;
	}
	return cmd;
};

Wiz.NativeManager.prototype.getMozillaClient = function () {
	if (!this._MozillaNativeCtrl) {
		this._MozillaNativeCtrl = new Wiz.MozillaNativeController();
	}
	return this._MozillaNativeCtrl;
};

Wiz.NativeManager.prototype.getDOMClient = function () {

	return this._DOMNativeCtrl;
};

Wiz.NativeManager.prototype.bInstall = function () {
	return this.mozillaCtrl.bInstall();
};

Wiz.NativeManager.prototype.hasNativeClient = function () {
	if (this._DOMNativeCtrl) {
		return this._DOMNativeCtrl.hasNativeClient();
	}
	Wiz.logger.error('Wiz.NativeManager.hasNativeClient() Error: _DOMNativeCtrl not initialize');
};

Wiz.NativeManager.prototype.getNativeCategoryStr = function () {
	var nowUserName = Wiz.prefStorage.get(Wiz.Pref.NOW_USER, 'char');
	if (this._DOMNativeCtrl) {
		return this._DOMNativeCtrl.getNativeCategory(nowUserName);
	}
	Wiz.logger.error('Wiz.NativeManager.getNativeCategoryStr() Error: _DOMNativeCtrl not initialize');
};