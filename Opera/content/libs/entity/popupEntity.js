$(document).ready(function () {
	'use strict';
	//使用bgProcess的Wiz上下文，可以免去一些消息传输的时间
	try {
		PopupView.initPopupPage();
		var bClipPageShowing = false;
		var bgProcess = (new Wiz.OperaBgProcess()).process;
		var clipResult = new ClipResult(bgProcess);
		var loginCtrl = new LoginControl(bgProcess);
		var clipPageCtrl = new ClipPageControl(bgProcess, clipResult);
		var bgWiz = bgProcess.Wiz;
		PopupView.resize(bgProcess.toolbarButton.popup, null, 320);
	} catch (err) {
		console.error('popupPage opera.extension.bgProcess Errpr: ' + err);
	}

	function wiz_popup_initialize() {
		if (bgWiz.context.authority !== null) {
			bgProcess.popup_request_initialize();// opera.extension. postMessage({'name': 'getCategory', 'from': 'popup'});
		} else {
			PopupView.showLogin();
		}
	}

	var handlers = {
		'showClipPage': showClipPage,
		'responseCategories': clipPageCtrl.parseWizCategory,
		'loginError': PopupView.showLoginError,
		'clipResult': showClipResult
	};

	function showClipResult(info, status) {
		clipResult.showNotificationByCmd(status, info);
	}

	function showClipPage(info) {
		if (bClipPageShowing === false) {
			PopupView.showClipPage();
			clipPageCtrl.initSubmitGroup(info);
			clipPageCtrl.initClipPageListener();
			clipPageCtrl.initUserLink(bgWiz.context.userId, bgWiz.context.token);
			bClipPageShowing = true;
		}
	}

	wiz_popup_initialize();
	opera.extension.onmessage = function (event) {
		var requestName = event.data.name;
		console.log('popup: ' + requestName);
		if (typeof requestName === 'string' && handlers[requestName]) {
			handlers[requestName](event.data.info, event.data.status);
		}
	};
});