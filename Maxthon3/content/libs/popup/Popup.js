// 'use strict';
window.onload = function () {


	var clipPageControl = new ClipPageControl(),
		loginControl = new LoginControl(),
		handlers = {
			'loginError': loginErrorHandler,
			'loginSuccess': loginSuccessHandler,
			'PageClipFailure': showPageClipFailure,
			'initClipPage': clipPageControl.showClipPage,
			'responsePageInfo': responsePageInfo,
			'responseCategory': clipPageControl.parseWizCategory
		};

	var currentPageLoadStatus = "loading";						//当前页面加载状况，用于判断是否显示预览页面
	var pageClipState = false;									//判断当前页面是否可剪辑，即js是否已经有效

	function responsePageInfo(params) {
		pageClipState = true;
		clipPageControl.initSubmitGroup(params);
	}

	function showPageClipFailure() {
		var pageClipFailure = Wiz.Message.get('pageClipFailure');
		PopupView.showClipFailure(pageClipFailure);
	}

	function loginErrorHandler(err) {
		PopupView.showLoginError(err.params);
	}

	function loginSuccessHandler(params) {
		PopupView.showLoginDiv();
		if (!localStorage[Wiz.Constant.Default.AUTH_COOKIE]) {

			var userId = $('#user_id').val();
			var password = 'md5.' + hex_md5($('#password').val());
			if (!userId || !password) {
				return;
			}
			var value = userId + '*' + 'md5.' + hex_md5(password);
			localStorage['wiz-clip-auth'] = userId;
			localStorage[Wiz.Constant.Default.AUTH_COOKIE] = value;
		}

		console.log('loginSuccessHandler(): ' + params.hasNative);
		if (params.hasNative) {
			clipPageControl.setNativeStatus(params.hasNative);
		}

		//剪辑页面是否显示，如果未显示，需要显示
		//处理手动点击登陆按钮
		if (!isClipPageVisibel()) {
			clipPageControl.requestPageStatus();
		}
	}


	function isClipPageVisibel() {
		var visible = $('#wiz_clip_detail').is(':visible');
		return visible;
	}

	function showByCookies(cookies) {

		if (cookies) {
			//有cookie，则直接显示
			wizRequestPreview();
			clipPageControl.showClipPage();
		} else {
			PopupView.showLogin();
		}
	}


	function tabLoadedListener() {
		var authStr = localStorage[Wiz.Constant.Default.AUTH_COOKIE];
		showByCookies(authStr);
	}

	function wizPopupInitialize() {
		console.log('Popup wizPopupInitialize()');
		tabLoadedListener();
	}


	//监听service和content页面发送过来的请求
	function popupListener(info) {
		if (info && info.name) {
			handlers[info.name](info);
		}
	}
	Wiz.Browser.addListener(Wiz.Constant.ListenType.POPUP, popupListener);
	

	PopupView.initPopupPage();
	
	//只有在浏览器打开后，初次点击触发panel事件时，会触发
	wizPopupInitialize();

	function wizRequestPreview(op) {
		if (!op) {
			//默认为文章
			op = 'article';
		}
		try {
			Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {name : 'preview', op : op});
			console.log('service wizRequestPreview start');
		} catch (err) {
			console.log('service wizRequestPreview start Error: ' + err);
		}

		//同时请求加载当前页面
		clipPageControl.requestPageStatus();
	}

	Wiz.maxthon.onAppEvent = function (obj) {
		if (!obj.action) {
			return;
		}
		var targetType = obj.action.type,
			actionType = obj.type;
		var authStr = localStorage[Wiz.Constant.Default.AUTH_COOKIE];
		var state = Wiz.WindowManager.getState();
		if ('panel' === targetType && 'ACTION_SHOW' === actionType && authStr && 'active' === state) {
			//TODO 应该判断当前页面是否已经加载完成，如果未加载完成，需要循环调用（增加超时时间）
			PopupView.showWaiting();
			wizRequestPreview();
		}
	};

	// function refreshPopupState() {
	// 	var startDate = new Date();
	// 	var intervalTimer = setInterval(loadPage, 1000)

	// 	function loadPage() {
	// 		var nowDate = new Date();
	// 		console.log('Popup refreshPopupState() running');
	// 		console.log(nowDate - startDate);
	// 		if (nowDate - startDate > Wiz.Constant.Default.PREVIEW_OVER_TIME_MS) {
	// 			var clipFailMsg = Wiz.Message.get('pageClipFailure');
	// 			PopupView.showClipFailure(clipFailMsg);
	// 			clearInterval(intervalTimer);
	// 		}
	// 		if ('PAGE_LOADED' ===  currentPageLoadStatus) {
	// 			wizRequestPreview();
	// 			clearInterval(intervalTimer);
	// 		}
	// 	}
	// }


	//监听 onBrowserEvent来处理当前页面的信息,主要获取页面是否加载完成，以便显示剪辑信息
	// Wiz.maxthon.browser.onBrowserEvent = function( obj ){
	// 	var eventTabId = obj.id;
	// 	var curTab = Wiz.maxthon.browser.tabs.getCurrentTab();
	// 	var tabId = curTab.id;
	// 	var eventType = obj.type;

	// 	console.log('Wiz.maxthon.browser.onBrowserEvent()');
	// 	console.log(obj.type);

	// 	if ('ON_NAVIGATE' === obj.type) {
	// 		//当url跳转的时候，设置状态为加载中
	// 		currentPageLoadStatus = 'loading' ;
	// 	}

	// 	//当前TAB和监听的TAB是同一个tab时
	// 	if (tabId === curTab) {
	// 		currentPageLoadStatus = obj.type;
	// 	}}

	// };
};