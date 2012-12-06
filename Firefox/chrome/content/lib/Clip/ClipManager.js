// "use strict";
Wiz.ClipManager = function() {
	this.__defineGetter__("sender", this.getSender);
	this.__defineGetter__("clipper", this.getClipper);
	this.__defineGetter__("tab", this.getTab);
	this.initialize();
};

Wiz.ClipManager.prototype.initialize = function () {
	this._clipper = new Wiz.ContentClipper();
	this._sender = new Wiz.ClipSender(this);
};
Wiz.ClipManager.prototype.startClip = function (rootElement, contextMenuClipType) {
	Wiz.logger.debug('Wiz.ClipManager.startClip start. rootElement: ' + rootElement + '---' + 'contextMenuClipType' + contextMenuClipType);
	var token = Wiz.context.token;
	//右键保存
	if (contextMenuClipType === 'CLIP_ACTION_FULL_PAGE') {
		if (Wiz.nativeManager && Wiz.nativeManager.bInstall()) {
			Wiz.nativeManager.startNativeClip();
		} else {
			Wiz.logger.debug('Wiz.ClipManager.startClip token: ' + token);
			if (token) {
				//右键菜单保存时，无本地客户端，要判断用户是否手动选择
				try {
					if (this.tab.getSelection() && this.tab.getSelection().rangeCount > 0 && this.tab.getSelection().getRangeAt(0).toString() !== '') {
						Wiz.logger.debug('Wiz.ClipManager.startClip clip selection');
						this.contenxtMenuClipSelection();
					} else {
						Wiz.logger.debug('Wiz.ClipManager.startClip clip fullpage');
						this.contenxtMenuClipFullpage();
					}
				} catch (err) {
					Wiz.logger.error('Wiz.ClipManager.startClip() Error: ' + err);
				}
			} else {
				this._clipper.openPopup();
			}
		}
		return ;
	} else {
		this._clipper.openPopup();
	}
};
Wiz.ClipManager.prototype.contenxtMenuClipFullpage = function () {
	try {
		var docContent = this._clipper.getFullpageHTML(this.tab),
			doc = Wiz.Document.createContextMenuDoc(this.tab, docContent);
	} catch (err) {
		Wiz.logger.error('Wiz.ClipManager.contenxtMenuClipFullpage() Error : ' + err);
	}
	this.postDocument(doc.getDocInfo());
};

Wiz.ClipManager.prototype.contenxtMenuClipSelection = function () {
	try {
		var docContent = this._clipper.getSelectedHTML(this.tab),
			doc = Wiz.Document.createContextMenuDoc(this.tab, docContent);		
	} catch (err) {
		Wiz.logger.error('Wiz.ClipManager.contenxtMenuClipSelection() Error : ' + err);
	}
	this.postDocument(doc.getDocInfo());
};

Wiz.ClipManager.prototype.contenxtMenuClipUrl = function () {
	try {
		var docContent = this.getUrlBody(this.tab),
			doc = Wiz.Document.createContextMenuDoc(this.tab, docContent);
	} catch (err) {
		Wiz.logger.error('Wiz.ClipManager.contenxtMenuClipUrl() Error : ' + err);
	}
	this.postDocument(doc.getDocInfo());
};

/**
 * popup页面请求保存
 * @param  {[type]} info [description]
 * @return {[type]}      [description]
 */
Wiz.ClipManager.prototype.saveClip = function (info) {
	if (!info) {
		Wiz.logger.error('Wiz.ClipManager.saveClip() Error: can not find info obj');
		return;
	}
	if (info.isNative === true) {
		Wiz.nativeManager.startNativeClip(info);
	} else {
		this.postDocument(info);
	}
};


Wiz.ClipManager.prototype.postDocument = function (info) {
	this._sender.postDocument(info);
};

Wiz.ClipManager.prototype.getUrlBody = function () {
	var url = this.tab.location.href,
		docContent = "<a href='" + url + "'>" + url + "</a>";
	return docContent;
};


Wiz.ClipManager.prototype.getClipper = function () {
	try {
		if (!this._clipper) {
			this._clipper = new Wiz.ContentClipper();
		}
		return this._clipper;
	} catch (err) {
		Wiz.logger.error('Wiz.ClipManager.getClipper() Error : ' + err);
	}
};
Wiz.ClipManager.prototype.getTab = function () {
	this._tab = (content) ? content : window.overlay.arguments[0].content;
	return this._tab;
};
Wiz.ClipManager.prototype.getSender = function () {
	try {
		if (!this._sender) {
			this._sender = new Wiz.ClipSender();
		}
		return this._sender;
	} catch (err) {
		Wiz.logger.error('Wiz.ClipManager.getSender() Error : ' + err);
	}
};

Wiz.ClipManager.prototype.getClipDocumentBody = function (clipType, preview) {
	var body = null;
	//获取页面信息之前首先要补全img的src路径，否则会无法保存图片
	this._clipper.completeImgSrc(this.tab);
	switch (clipType) {
	case 'article':
		body = this._clipper.getArticleHTML(this.tab, preview);
		break;
	case 'selection':
		body = this._clipper.getSelectedHTML(this.tab);
		break;
	case 'fullPage':
		body = this._clipper.getFullpageHTML(this.tab);
		break;
	case 'url':
		body = this.getUrlBody(this.tab);
		break;
	default : 
		body = "";
	}
	return body;
};

