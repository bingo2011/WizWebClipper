/**
 * @author rechie
 */
// 'use strict';
Wiz.NotePageControl = function (popup) {
	this._popup = popup;
	// $('wiz_clip_detail').show($.proxy(this.initialize, this));
};

Wiz.NotePageControl.prototype._popup = null;
Wiz.NotePageControl.STORAGE_SAVE_TYPE = 'save_type';

Wiz.NotePageControl.prototype.initialize = function () {
	this.initNotePageListener();
	this.initNotePageInfo();
};

Wiz.NotePageControl.prototype.initNotePageListener = function () {
	$('#submit-type').change($.proxy(this.changeSubmitTypehandler, this));
	$('#note_submit').click($.proxy(this.noteSubmit, this));
	$('#comment-info').focus($.proxy(this.resizeCommentHeight, this));
	$('#category_info').click($.proxy(this.changeCategoryLoadingStatus, this));
};

Wiz.NotePageControl.prototype.resizeCommentHeight = function (evt) {
	$('#comment-info').animate({
		height: '80px'
	}, 500);
};


Wiz.NotePageControl.prototype.changeSubmitTypehandler = function (evt) {
	var selectedOption = $('option:selected', '#submit-type'),
		cmd = selectedOption.attr('id');
	this._popup.switchPreview(cmd);
	//改变页面显示
	Wiz.PopupView.changeSubmitDisplayByType();
};


Wiz.NotePageControl.prototype.initSubmitGroup = function () {
	var clipPageResponse = this._popup.getClipInfo(),
		clipArticle = clipPageResponse.article,
		clipSelection = clipPageResponse.selection;
	if (clipSelection == true) {
		$('#submit-type')[0].options[1].selected = true;
	} else if (clipArticle == true) {
		$('#submit-type')[0].options[0].selected = true;
	} else {
		$('#submit-type')[0].options[2].selected = true;
	}

	//用户没有选择时，禁止选择该'保存选择'
	if (clipSelection == false) {
		$('#submit-type option[id="selection"]').attr('disabled', '');
	}

	//用户有选择或者不可以智能提取时，禁止选择'保存文章'
	if (clipArticle == false || clipSelection == true) {
		$('#submit-type option[id="article"]').attr('disabled', '');
	}
	var type = $('#submit-type').val();
	$('#note_submit').text(type);
};

Wiz.NotePageControl.prototype.initNotePageInfo = function() {
	Wiz.PopupView.hideCreateDiv();

	this.initNativeDiv();

	this.initLogoutLink();

	this.initDefault();
	this.initSubmitGroup();
	this.initUserLink();

	this.requestTitle();
	this.requestCategory();
	//TODO save category
};


Wiz.NotePageControl.prototype.initLogoutLink = function () {
	var logoutText = Wiz.i18n.getMessage('logout');
	$('#header_user').show();
	$('#logout_control').text(logoutText).bind('click', $.proxy(this.cmdLogout, this));
};

Wiz.NotePageControl.prototype.cmdLogout = function () {
	this._popup.logout();
};

Wiz.NotePageControl.prototype.requestTitle = function () {
	var title = this._popup.getTitle();
	Wiz.PopupView.setDocTitle(title);
};

Wiz.NotePageControl.prototype.initDefault = function () {
	// this.initDefaultCategory();
	this.initDefaultSaveType();
};

Wiz.NotePageControl.prototype.initDefaultCategory = function () {
	var defaultCategory = Wiz.cookieManager.get(Wiz.AUTH_COOKIE_URL, Wiz.Pref.DEFAULT_CATEGORY);
	Wiz.logger.debug('Wiz.NotePageControl.initDefaultCategory(): ' + defaultCategory);
	if ((typeof defaultCategory === 'string') && defaultCategory.length > 0) {
		
		Wiz.logger.debug(defaultCategory);

		var array = defaultCategory.split('*'),
			displayName = array[0],
			location = array[1];
		$('#category_info').text(displayName).attr('location', location);
	}
};

Wiz.NotePageControl.prototype.initDefaultSaveType = function () {
	var defaultSavetype = Wiz.prefStorage.get(Wiz.Pref.DEFAULT_SAVETYPE, 'char');
	//暂时只有本地或服务端保存类型
	// if ((typeof defaultSavetype === 'string') && defaultSavetype.length > 0) {
	if ('save_to_native' === defaultSavetype) {
		$('#save_type_sel')[0].options[1].selected = true;
	}
	// }
};


Wiz.NotePageControl.prototype.changeCategoryLoadingStatus = function () {
	var visible = this.isCategoryLoading();
	if (visible) {
		Wiz.PopupView.hideCategoryLoading();
	} else {
		var categoryLoadingMsg = Wiz.i18n.getMessage('category_loading');
		Wiz.PopupView.showCategoryLoading(categoryLoadingMsg);
	}
};

Wiz.NotePageControl.prototype.isCategoryLoading = function () {
	var visible = $('#category_loading').is(':visible');
	return visible;
};
Wiz.NotePageControl.prototype.parseWizCategory = function (categoryStr) {

	this.initZtree(categoryStr);
	var visible = this.isCategoryLoading();
	if (visible) {
		//用户已经点击展开文件夹树，此时，需要直接显示文件夹树即可
		Wiz.PopupView.showCategoryTreeFromLoading(500);
	}
	$('#category_info').unbind('click');
	$('#category_info').click($.proxy(this.switchCategoryTreeVisible, this));
};

Wiz.NotePageControl.prototype.initZtree = function (categoryString) {
	var ztreeControl = new ZtreeController(),
		ztreeJson = ztreeControl.parseDate(categoryString);
	ztreeControl.setNodes(ztreeJson);
	ztreeControl.initTree('ztree');
};


Wiz.NotePageControl.prototype.switchCategoryTreeVisible = function() {
	var visible = $('#ztree_container').is(':visible');
	if (visible) {
		$('#ztree_container').hide(500);
    	Wiz.PopupView.setPopupHeight(300);
	} else {
		$('#ztree_container').show(500);
    	Wiz.PopupView.setPopupHeight(480);
	}
};

Wiz.NotePageControl.prototype.requestCategory = function() {
	//获取目录信息
	//1、首先判断是否有安装PC客户端，如果有，则从客户端获取信息
	
	var categoryStr = Wiz.nativeManager.getNativeCategoryStr();

	if (categoryStr && categoryStr.length > 0) {
		this.initCategoryTree(categoryStr);
		return;
	}
	//2、未安装客户端，从localStorage或保存的其他地方获取，
	//不能存到cookie中，否则过大造成无法访问(暂未实现，存储方式未定)
	//3、如果都为获取到，则从服务器请求
	this._popup.requestCategory($.proxy(this.initCategoryTree, this), function (err) {
		Wiz.logger.error('Wiz.NotePageControl.requestCategory() Error: '+ err);
	});
};

//根据目录信息初始化目录树
Wiz.NotePageControl.prototype.initCategoryTree = function (params) {
	if (params.categories) {
		this.parseWizCategory(params.categories);
	} else {
		this.parseWizCategory(params);
	}
};

Wiz.NotePageControl.prototype.noteSubmit = function () {
	this.requestSubmit();
	//顺序不能乱，应该先提交申请，后关闭popup页面
	//否则关闭页面后，页面内所有object被设为null，无法正确获取文档内容
	this._popup.closePopup();
};

Wiz.NotePageControl.prototype.initNativeDiv = function () {
	var isWin = this.isWinPlatform();
	if (isWin) {
		// this.initSaveType();
		$('#save_type_sel').change($.proxy(this.changeSaveTypehandler, this));
	} else {
		$('#save_type_sel').hide();
		$('#native').remove();
	}
};

Wiz.NotePageControl.prototype.initSaveType = function () {
	Wiz.logger.debug('Wiz.NotePageControl.initSaveType(): ' + saveType);
};

Wiz.NotePageControl.prototype.isWinPlatform = function () {
	var platform = window.navigator.platform,
		isMac = (platform.toLowerCase().indexOf('mac') === 0),//(platform === "Mac68K") || (platform === "MacPPC") || (platform === "Macintosh");
		isLinux = (platform.toLowerCase().indexOf('linux') === 0);
	if (isMac || isLinux) {
		return false;
	}
	return true;
};

Wiz.NotePageControl.prototype.requestSubmit = function () {
	var docInfo = this.prepareAndGetDocInfo();
	if (docInfo) {
		Wiz.notificator.showClipping(docInfo.title);
		//TODO 解决popup页面关闭导致ajax被中止，造成无法显示成功或失败信息的问题
		//暂时用该方法解决，应改为使用firefox Sandboxed Http Connections来处理
		//https://developer.mozilla.org/en-US/docs/Creating_Sandboxed_HTTP_Connections
		window.overlay.arguments[0].clipManager.saveClip(docInfo);
		// this._popup.requestSubmit(docInfo);
	}
};

/**
 * 准备文档数据，并返回
 * @return {[type]} [description]
 */
Wiz.NotePageControl.prototype.prepareAndGetDocInfo = function () {
	try {
		var clipType = $('option:selected', '#submit-type').attr('id'),
			saveType = $('option:selected', '#save_type_sel').attr('id'),
			isNative = ('save_to_native' === saveType) ? true : false,
			title = $('#wiz_note_title').val(),
			category = $('#category_info').attr('location'),
			comment = $('#comment-info').val(),
			userid = Wiz.prefStorage.get(Wiz.Pref.NOW_USER, 'char'),
			content = this._popup.getDocBody(clipType, isNative),
			info = {
				title: title,		//文档标题
				category: category,	//文档目录
				comment: comment,	//文档评论
				content: content,	//文档内容 
				saveType: saveType,	//保存类型
				clipType: clipType,	//剪辑类型
				isNative: isNative,	//是否本地保存
				userid: userid		//当前用户名
			};
	} catch (err) {
		Wiz.logger.error('Wiz.NotePageControl.prepareAndGetNoteInfo() Error : ' + err);
		return null;
	}
	return info;
};

Wiz.NotePageControl.prototype.initUserLink = function () {
	var nowUserName = Wiz.prefStorage.get(Wiz.Pref.NOW_USER, 'char'),
		token = Wiz.context.token;
	if (nowUserName && nowUserName.length > 0) {
		$('#header_username').text('(' + nowUserName + ')').bind('click', function (evt) {
			window.open(Wiz.AUTH_COOKIE_URL + '/?t=' + token);
		});
	}
};



Wiz.NotePageControl.prototype.changeSaveTypehandler = function (evt) {
	var selectedOption = $('option:selected', '#save_type_sel'),
		type = selectedOption.attr('id'),
		hasNativeClient = Wiz.nativeManager.bInstall();
	if ('save_to_native' === type && !hasNativeClient) {
		evt.preventDefault();
		this.nativeConfirm();
		// return ;
	}
	Wiz.prefStorage.set(Wiz.Pref.DEFAULT_SAVETYPE, type, 'char');
};

Wiz.NotePageControl.prototype.nativeConfirm = function () {
	var installNotifyMsg = Wiz.i18n.getMessage('install_client_notify');
	if (window.confirm(installNotifyMsg)) {
		window.open(updateClientUrl);
	}
}