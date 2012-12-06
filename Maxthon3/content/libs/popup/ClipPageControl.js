/**
 * @author rechie
 */
var cookieUrl = 'http://service.wiz.cn/web',
	cookieName = 'wiz-clip-auth',
	cookieExpiredays = 14 * 24 * 60 * 60,
	updateClientUrl = 'http://www.wiz.cn/wiznote_web_clipper_chrome';

function ClipPageControl() {
	// 'use strict';
	
	var saveType = localStorage['saveType'],
		_isNative = (saveType && saveType === 'save_to_native') ? true : false,
		_hasNative = null,
		_isOpened = false;							//通过_isOpened来判断是否已经加载过监听事件

	function initClipPageListener() {
		PopupView.hideWaiting();
		$('body').bind('keyup', keyDownHandler);
		$('#submit-type').change(changeSubmitTypehandler);
		$('#note_submit').click(noteSubmit);
		$('#comment-info').bind('focus', resizeCommentHeight);
		$('#category_info').bind('click', changeCategoryLoadingStatus);
		$('#wiz_clip_detail').show(initClipPageInfo);
		initNativeDiv();
	}

	function initNativeDiv() {
		var isWin = isWinPlatform();
		if (isWin) {
			initSaveType();
			$('#save_type_sel').change(changeSaveTypehandler);
		} else {
			$('#save_type_sel').hide();
			$('#native').remove();
		}
	}

	function initSaveType() {
		if (_isNative) {
			$('#save_type_sel')[0].options[1].selected = true;
		}
	}

	/**
	 * 保存到本地监听事件
	 * @param  {[type]} evt [description]
	 * @return {[type]}     [description]
	 */
	function changeSaveTypehandler(evt) {
		var selectedOption = $('option:selected', '#save_type_sel'),
			type = selectedOption.attr('id');
		if ('save_to_native' === type && !checkNativeStatus()) {
			evt.preventDefault();
			return ;
		}
		setSaveType(type);
	}

	function setSaveType(type) {
		if (type === 'save_to_native') {
			_isNative = true;
		} else if (type === 'save_to_server') {
			_isNative = false;
		}
		localStorage['saveType'] = type;
	}


	function resizeCommentHeight(evt) {
		$('#comment-info').animate({
			height: '80px'
		}, 500);
	}

	function showClipPage(params) {
		// PopupView.showClipPage();
		// console.log(_isOpened);
		// if (_isOpened === false) {
		// 	initClipPageListener();
		// 	_isOpened = true;
		// } else {
		// 	initClipPageInfo();
		// }
		if (params) {
			setNativeStatus(params.hasNative);
		}
	}

	/**
	 * 是否windows系统
	 * @return {Boolean} [description]
	 */
	function isWinPlatform() {
		var platform = window.navigator.platform,
			isMac = (platform.toLowerCase().indexOf('mac') === 0),//(platform === "Mac68K") || (platform === "MacPPC") || (platform === "Macintosh");
			isLinux = (platform.toLowerCase().indexOf('linux') === 0);
		if (isMac || isLinux) {
			return false;
		}
		return true;
	}



	/**
	 *修改保存的类型
	 * @param {Object} model
	 */

	function changeSubmitTypehandler(evt) {
		var selectedOption = $('option:selected', '#submit-type'),
			cmd = selectedOption.attr('id'),
			portName = ('native' === cmd) ? 'save-native' : 'preview';
		if ('native' === cmd) {
			if (!checkNativeStatus()) {
				evt.preventDefault();
				return ;
			}
			noteSubmit();
		} else {
			Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {'name': 'preview', 'op': cmd});
			//改变页面显示
			PopupView.changeSubmitDisplayByType();
		}
	}


	function initSubmitGroup(clipPageResponse) {
		var clipArticle = clipPageResponse.info.article,
			clipSelection = clipPageResponse.info.selection;
		if (clipSelection == true) {
			$('#submit-type')[0].options[1].selected = true;
		} else if (clipArticle == true) {
			$('#submit-type')[0].options[0].selected = true;
		} else {
			$('#submit-type')[0].options[2].selected = true;
		}


		PopupView.showClipPage();
		if (_isOpened === false) {
			initClipPageListener();
			_isOpened = true;
		} else {
			initClipPageInfo();
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
		$('#note_submit').html(type);
	}

	/**
	 * 加载当前页面的是否能智能截取、是否有选择的信息，并根据该信息显示
	 */

	function requestPageStatus() {
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {'name': 'preview', 'op': 'getInfo'});	
	}

	//初始化剪辑页面信息


	function initClipPageInfo(evt) {
		initTitle();
		initLogoutLink();
		initDefaultCategory();
		requestCategory();
	}

	function initTitle() {
		var currentTab = Wiz.maxthon.browser.tabs.getCurrentTab();
		if (currentTab) {
			setTitle(currentTab.title);
		}
	}

	function initLogoutLink() {
		var logoutText = Wiz.Message.get('logout');
		// $('#header_user').show();
		$('#logout_control').html(logoutText).bind('click', cmdLogout);
	}

	function cmdLogout() {
		//注销时，清除所有当前用户相关信息
		localStorage.removeItem(Wiz.Constant.Default.AUTH_COOKIE);
		localStorage.removeItem('wiz-clip-auth');
		localStorage.removeItem(Wiz.Constant.Default.COOKIE_CATEGORY);
		localStorage.removeItem['last-category'];
		PopupView.showLogin();
		PopupView.showLogoffDiv();

		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {'name': 'preview', 'op': 'clear'});
	}

	function setTitle(title) {
		$('#wiz_note_title').val(title);
	}



	/**
	 * 加载并显示默认文件夹---上次选择的文件夹
	 */

	function initDefaultCategory() {
		var lastCategory = localStorage['last-category'];
		if (lastCategory) {
			var array = lastCategory.split('*'),
				displayName = array[0],
				location = array[1];
			$('#category_info').html(displayName).attr('location', location);
		}
	}

	/**
	 *加载中
	 */
	function changeCategoryLoadingStatus() {
		var isLoading = isCategoryLoading();
		// console.log('changeCategoryLoadingStatus: ' + isLoading);
		if (isLoading) {
			PopupView.hideCategoryLoading();
		} else {
			var categoryLoadingMsg = Wiz.Message.get('category_loading');
			PopupView.showCategoryLoading(categoryLoadingMsg);
		}
	}

	function isCategoryLoading() {
		var visible = $('#category_loading').is(':visible');
		return visible;
	}
	/**
	 *对目录信息进行处理
	 * @param {Object} categoryStr
	 */

	function parseWizCategory(params) {
		// console.log('ClipPageControl.parseWizCategory() Start');
		// console.log(params);
		var categoryStr = params.category;
		if (typeof categoryStr !== 'string') {
			//TODO 错误
			return;
		}

		localStorage['category'] = categoryStr;
		initZtree();
		var visible = isCategoryLoading();
		if (visible) {
			//用户已经点击展开文件夹树，此时，需要直接显示文件夹树即可
			PopupView.showCategoryTreeFromLoading(500);
		}
		//重新绑定category-info的click事件
		$('#category_info').unbind('click');
		$('#category_info').click(switchCategoryTreeVisible);
	}

	function initZtree() {
		var categoryString = localStorage['category'];
		var ztreeJson = ztreeControl.parseDate(categoryString);
		ztreeControl.setNodes(ztreeJson);
		ztreeControl.initTree('ztree');
	}

	/**
	 *显示树
	 */

	function switchCategoryTreeVisible() {
		var visible = $('#ztree_container').is(':visible');
		if (visible) {
			$('#ztree_container').hide(500);
		} else {
			$('#ztree_container').show(500);
		}
	}

	/**
	 *加载文件夹信息
	 */

	function requestCategory() {
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.SERVICE, {'name': 'requestCategory'});
	}

	function keyDownHandler(evt) {
		var target = evt.target,
			skipTypes = ['input', 'select', 'textarea'],
			skipIndex;
		for (skipIndex = 0; skipIndex < skipTypes.length; skipIndex++) {
			if (evt.srcElement.nodeName.toLowerCase() == skipTypes[skipIndex]) {
				console.log(skipTypes[skipIndex]);
				return;
			}
		}
		var keycode = evt.keyCode;
		if (13 == keycode) {
			requestSubmit();
			return;
		}

		var opCmd = getNudgeOp(keycode, evt);
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {'name': 'preview', 'op': 'keydown',  'opCmd': opCmd});
	}

	function getNudgeOp(key, evt) {
		var returnValue = null,
			KEY_ALT = 18,
			KEY_CTRL = 17,
			keyMap = {
			27: 'cancle',
			38: 'expand',
			// up
			40: 'shrink',
			// down
			37: 'left',
			39: 'right',

			56: 'topexpand',
			// alt + up
			58: 'topshrink',
			// alt + down
			57: 'bottomexpand',
			// ctrl + down
			55: 'bottomshrink'
			// ctrl + up
		};

		if (keyMap[key]) {
			if (evt && evt.altKey == true) { // 18
				returnValue = keyMap[key + KEY_ALT];
			} else if (evt && evt.ctrlKey == true) { // 17
				returnValue = keyMap[key + KEY_CTRL];
			} else {
				returnValue = keyMap[key];
			}
			return returnValue;
		}
	}

	/**
	 * 保存文档处理
	 * @param {Event} e
	 */

	function noteSubmit(evt) {
		requestSubmit();
		//发送请求后关闭页面
		popupClose();
	}

	function requestSubmit() {
		var type = $('option:selected', '#submit-type').attr('id'),
			title = $('#wiz_note_title').val(),
			category = $('#category_info').attr('location'),
			comment = $('#comment-info').val(),
			userid = localStorage['wiz-clip-auth'],
			info = {
				title: title,
				category: category,
				comment: comment,
				userid : userid,
				isNative : _isNative
			};

		console.log(info);
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {
			name: 'preview',
			op: 'submit',
			info: info,
			type: type
		});
	}

	function initUserLink(token) {
		var user_id = localStorage['wiz-clip-auth'];
		$('#header_username').html('(' + user_id + ')').bind('click', function (evt) {
			window.open(mainUrl + '/?t=' + token);
		});
	}

	function checkNativeStatus() {
		if (!hasNativeClient()) {
			var installNotifyMsg = Wiz.Message.get('install_client_notify');
			if (window.confirm(installNotifyMsg)) {
				window.open(updateClientUrl);
			}
		}
		return hasNativeClient();
	}

	function popupClose() {
		Wiz.WindowManager.close();
	}

	function hasNativeClient() {
		return _hasNative;
	}

	function setNativeStatus(hasNative) {
		_hasNative = hasNative;
	}

	this.setNativeStatus = setNativeStatus;
	this.showClipPage = showClipPage;
	this.initSubmitGroup = initSubmitGroup;
	this.parseWizCategory = parseWizCategory;
	this.requestPageStatus = requestPageStatus;
}