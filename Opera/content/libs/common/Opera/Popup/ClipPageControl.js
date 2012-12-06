/**
 * @author rechie
 */
var updateClientUrl = 'http://www.wiz.cn/wiznote_web_clipper_chrome';

function ClipPageControl(bgProcess, clipResult) {
	'use strict';


	var saveType = localStorage['saveType'],
		isNative = (saveType && saveType === 'save_to_native') ? true : false,
		_hasNative = bgProcess.Wiz.native.isInstalled();

	function initClipPageListener() {
		//必须要加判断，否则会多次绑定时间
		PopupView.hideLogoffDiv();
		$('body').bind('keyup', keyDownHandler);
		$('#submit-type').change(changeSubmitTypehandler);
		$('#note_submit').click(noteSubmit);
		$('#comment-info').bind('focus', resizeCommentHeight);
		$('#wiz_clip_detail').show(initClipPageInfo);
		$('#category_info').bind('click', changeCategoryLoadingStatus);
		$('#submit_button').click(function () {
			// console.log('submit_button clicked');
			$('#submit-type').click();
		});
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
		if (isNative) {
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
			return;
		}
		setSaveType(type);
	}

	function setSaveType(type) {
		if (type === 'save_to_native') {
			isNative = true;
		} else if (type === 'save_to_server') {
			isNative = false;
		}
		localStorage['saveType'] = type;
	}


	function resizeCommentHeight(evt) {
		$('#comment-info').animate({
			height: '80px'
		}, 500);
	}

	//监听截取信息事件
	// chrome.extension.onConnect.addListener(messageListener);
	// function messageListener(port) {
	// 	var name = port.name;
	// 	switch (name) {
	// 	case 'contentVeilShow':
	// 		$('#waiting').hide();
	// 		if ($('#wiz_clip_detail').is(':hidden')) {
	// 			initClipPageListener();
	// 		}
	// 		break;
	// 	case 'pagePreviewFailure':
	// 		exacutePreviewFailure();
	// 		break;
	// 	}
	// }
	/**
	 * 是否windows系统
	 * @return {Boolean} [description]
	 */

	function isWinPlatform() {
		var platform = window.navigator.platform,
			isMac = (platform.toLowerCase().indexOf('mac') === 0),
			//(platform === "Mac68K") || (platform === "MacPPC") || (platform === "Macintosh");
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
				return;
			}
			noteSubmit();
		} else {
			//改变页面显示
			PopupView.changeSubmitDisplayByType();
			//调用background方法切换预览显示
			bgProcess.requestPreview(cmd);
		}
	}


	function initSubmitGroup(info) {
		var clipArticle = info.article,
			clipSelection = info.selection;
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
		$('#note_submit').html(type);
		//设置标题
		PopupView.setTitle(info.title);
	}

	//初始化剪辑页面信息

	function initClipPageInfo(evt) {
		initLogoutLink();
		initDefaultCategory();
	}


	function initLogoutLink() {
		$('#header_user').show();
		PopupView.showLoginDiv();
		$('#logout_control').html(operaI18N.getMessage('logout')).bind('click', cmdLogout);
	}

	function cmdLogout() {
		bgProcess.popup_request_signOut();
		window.close();
	}

	/**
	 *加载标题
	 */

	function requestTitle() {}

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
		var visible = isCategoryLoading();
		if (visible) {
			PopupView.hideCategoryLoading();
		} else {
			var categoryLoadingMsg = operaI18N.getMessage('category_loading');
			PopupView.showCategoryLoading(categoryLoadingMsg);
			PopupView.resize(bgProcess.toolbarButton.popup, null, 360);
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

	function parseWizCategory(categoryStr) {
		// console.debug('ClipPageControl.parseWizCategory(): ' + categoryStr);
		if (typeof categoryStr !== 'string' || categoryStr.length < 1) {
			//目录获取失败
			return;
		}
		initZtree(categoryStr);
		var visible = isCategoryLoading();
		if (visible) {
			//用户已经点击展开文件夹树，此时，需要直接显示文件夹树即可
			PopupView.showCategoryTreeFromLoading(500);
		}
		$('#category_info').unbind('click');
		$('#category_info').click(switchCategoryTreeVisible);
	}

	function initZtree(categoryString) {
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
			PopupView.resize(bgProcess.toolbarButton.popup, null, 320);
		} else {
			$('#ztree_container').show(500);
			PopupView.resize(bgProcess.toolbarButton.popup, null, 500);
		}
	}

	function keyDownHandler(evt) {
		var target = evt.target,
			skipTypes = ['input', 'select', 'textarea'],
			skipIndex;
		for (skipIndex = 0; skipIndex < skipTypes.length; skipIndex++) {
			if (evt.srcElement.nodeName.toLowerCase() == skipTypes[skipIndex]) {
				return;
			}
		}
		var keycode = evt.keyCode;
		if (13 == keycode) {
			requestSubmit();
			return;
		}

		var opCmd = getNudgeOp(keycode, evt);
		var info = {
			direction: opCmd
		};
		// chrome.extension.connect({
		// 	name: 'onkeydown'
		// }).postMessage(info);
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
	}

	function requestSubmit() {
		var type = $('option:selected', '#submit-type').attr('id'),
			title = $('#wiz_note_title').val(),
			category = $('#category_info').attr('location'),
			comment = $('#comment-info').val(),
			userid = bgProcess.Wiz.context.userId,
			info = {
				title: title,
				category: category,
				comment: comment,
				userid: userid,
				isNative: isNative
			};
		// console.debug(userid);
		bgProcess.request_submit(type, info);
		if (!isNative) {
			PopupView.showClipStatus();
			PopupView.resize(bgProcess.toolbarButton.popup, null, 150);
			clipResult.showNotificationByCmd('clip', info);
		} else {
			PopupView.close();
		}
	}

	function initUserLink(userId, token) {
		var user_id = localStorage['wiz-clip-auth'];
		$('#header_username').html('(' + userId + ')').bind('click', function(evt) {
			window.open(Wiz.Default.COOKIEURL + '/?t=' + token);
		});
	}

	function checkNativeStatus() {
		if (!hasNativeClient()) {
			var installNotifyMsg = operaI18N.getMessage('install_client_notify');
			if (window.confirm(installNotifyMsg)) {
				window.open(updateClientUrl);
			}
		}
		return hasNativeClient();
	}

	function hasNativeClient() {
		return _hasNative;
	}
	this.initSubmitGroup = initSubmitGroup;
	this.initClipPageListener = initClipPageListener;
	this.parseWizCategory = parseWizCategory;
	this.initUserLink = initUserLink;
}