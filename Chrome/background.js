// 'use strict';
var Wiz_Context = {
	xmlUrl : 'http://webclip.openapi.wiz.cn/wizkm/xmlrpc',
	cookieUrl : 'http://service.wiz.cn/web',
	cookieName : 'wiz-clip-auth',
	cookie_category: 'wiz-all-category',
	cookie_category_time: 'wiz-category-stored-time',
	category_expireSec:  10 * 60,
	token : '',												//token初始值不能设置为null，会造成xmlrpc无法解析，返回错误
	tab : null,
	user_id : null,
	refresh_token_delay_ms : 5 * 60 * 1000,					//token自动保持在线时间间隔
	cookies: null
};

function wiz_onConnectListener(port) {
	var name = port.name;
	if (!name) {
		return;
	}
	switch (name) {
	case 'login':
		port.onMessage.addListener(portLogin);
		break;
	case 'retryClip':
		retryClip(port);
		break;
	case 'requestCategory':
		// wiz_portRequestCategoryAjax(port);
		// token不能为空否则会造成
		// 
		console.log(Wiz_Context.token);
		// if (Wiz_Context.token) {
		wiz_requestCategory(port);
		// }
		break;
	case 'saveDocument':
		port.onMessage.addListener(function (info) {
			console.log(info);
			if (!info ) {
				return;
			}
			if (info.isNative === true) {
				//调用本地客户单保存，不需要进行登陆
				saveToNative(info);
			} else {
				if ( !info.title|| !info.params) {
					return;
				}
				//登陆成功后保存
				saveToServer(info);
				// wizPostDocument(info);
			}
		});
		break;
	case 'checkLogin':
		port.onMessage.addListener(function (msg) {
			if (Wiz_Context.token !== null) {
				getTab(wizRequestPreview);
				port.postMessage(true);
			} else {
				port.postMessage(false);
			}
		});
		break;
	case 'initRequest':
		//页面初始化请求，需要返回是否已登录、是否可获取文章、是否可获取选择信息
		//TODO 返回是否可获取文章、是否可获取选择信息
		var hasNative = hasNativeClient(),
			info = {
				token : Wiz_Context.token,
				hasNative : hasNative
			};
		// if (Wiz_Context.token) {
		getTab(wizRequestPreview);
		// 	info.login = true;
		// 	port.postMessage(info);
		// } else {
		// 	info.login = false;
		port.postMessage(info);
		// }
		break;
	case 'onkeydown':
		port.onMessage.addListener(function (msg) {
			if (!Wiz_Context.token) {
				return;
			} else {
				var direction = msg.direction;
				getTab(bindKeyDownHandler, direction);
			}
		});
		break;
	case 'popupClosed':
		port.onDisconnect.addListener(function () {
			getTab(hideContentVeil);
		});
		break;
	case 'preview':
		port.onMessage.addListener(function (msg) {
			if (!msg) {
				return;
			}
			getTab(wizRequestPreview, msg);
		});
		break;
	case 'requestToken':
		if (Wiz_Context.token) {
			port.postMessage(Wiz_Context.token);
		}
		break;
	case 'logout':
		Wiz_Context.token = null;
		break;
	}
}

function portLogin(loginParam, port) {
	portLoginAjax(loginParam, port);

}


function retryClip(port) {
	//不自动增加cookie时间
	port.onMessage.addListener(function (msg) {
		if (msg && msg.title && msg.params) {
			saveToServer(msg);
			// Cookie.getCookies(Wiz_Context.cookieUrl, Wiz_Context.cookieName, wiz_loginByCookies, false, msg);
			// wizPostDocument(msg);
		}
	});
}

/**
 * 通过cookie自动登陆
 * @param  {[type]} cookie [cookie中保存到用户信息]
 * @param  {[type]} params [文档信息，如果不为空，登陆成功后，调用自动保存]
 * @return {[type]}        [description]
 */
function wiz_loginByCookies(cookie, params) {
	loginParam = getloginParam(cookie);
	portLoginAjax(loginParam, null, params);
}

function getloginParam(cookie) {
	var info = cookie.value,
		split_count = info.indexOf('*md5'),
		loginParam = {};
	loginParam.client_type = 'webclip_chrome';
	loginParam.api_version = 3;
	loginParam.user_id = info.substring(0, split_count);
	loginParam.password = info.substring(split_count + 1);
	return loginParam;
}


function portLoginAjax(loginParam, port, params, callback) {
	var loginError = function (err) {
		try {
			if (port) {
				port.postMessage(err);
			}
		} catch (error) {
			console.log('portLoginAjax callError Error: ' + error);
		}
	};
	var loginSuccess = function (responseJSON) {
		try {
			Wiz_Context.token = responseJSON.token;
			if (params) {
				wizPostDocument(params);
			}
			if (port) {
				port.postMessage(true);
				getTab(wizRequestPreview);
				if (callback) {
					callback(port);
				}
			}
		} catch (error) {
			console.log('portLoginAjax callSuccess Error: ' + error);
		}
		//只要登陆成功就自动保持在线
		//服务端会一直保持该token对象在内存中
		//用户量大的时候，会导致服务端压力过大
		//TODO 以后token有效期延长时，可以使用该方法
		// if (!Wiz_Context.process) {
		// 	Wiz_Context.process = setInterval(refreshToken, Wiz_Context.refresh_token_delay_ms);
		// }
	};
	//缓存userid
	Wiz_Context.user_id = loginParam.user_id;
	$.ajax({
		type: 'POST',
		url: 'http://www.wiz.cn/api/login',
		data: loginParam,
		success : loginSuccess,
		error : loginError
	});
	// xmlrpc(Wiz_Context.xmlUrl, 'accounts.clientLogin', [loginParam], loginSuccess, loginError);
}

function wiz_requestCategory(port) {
	var nativeCategoryStr = getNativeCagetory(Wiz_Context.user_id),
		localCategoryStr = getLocalCategory(),
		categoryStr = (nativeCategoryStr) ? (nativeCategoryStr) : (localCategoryStr);

	//必须校验token，否则会传入null进去，代码不健壮会造成死循环
	if (port) {
		//本地如果为获取到文件夹信息，则获取服务端的文件夹信息
		// console.log('wiz_requestCategory categoryStr: ' + categoryStr);
		if (categoryStr) {
			port.postMessage(categoryStr);
		} else {
			//已经登陆的，直接调用获取目录信息
			if (Wiz_Context.token) {
				wiz_portRequestCategoryAjax(port);
			} else {
				if (Wiz_Context.cookies) {
					var loginParam = getloginParam(Wiz_Context.cookies);
					portLoginAjax(loginParam, port, null, wiz_portRequestCategoryAjax);
				}
				//TODO 1、登陆，成功后调用wiz_portRequestCategoryAjax();
				
			}
		}
	}
}

function getLocalCategory() {
	var localCategoryStr = localStorage[Wiz_Context.cookie_category],
		storedTimeStr = localStorage[Wiz_Context.cookie_category_time],
		storedTime = Date.parse(storedTimeStr),
		nowTime = new Date(),
		isOverTime = ((nowTime - storedTime) / 1000 >= Wiz_Context.category_expireSec);//是否过期
	if (isOverTime || !localCategoryStr || localCategoryStr.length < 1) {
		return "";
	} else {
		return localCategoryStr;
	}
}

//把服务端获取到的目录信息存放在localStorage中
//如果存放到cookie中，则会造成cookie过大，无法通过nginx
//保存时，需要记录当前保存的时间，下次取出的时候进行比较
//如果超出默认的时间，则自动清空，重新获取
function setLocalCategory(value) {
	var storedTime = (new Date()).toString();
	localStorage[Wiz_Context.cookie_category] = value;
	localStorage[Wiz_Context.cookie_category_time] = storedTime;
}
function getNativeCagetory(userid) {
	var client = getNativeClient(),
		categoryStr = null;
	if (client) {
		try {
			categoryStr = client.GetAllFolders(userid);
		} catch (err) {
		}
	}
	return categoryStr;
}


function wiz_portRequestCategoryAjax(port) {
	var params = {
		client_type : 'webclip_chrome',
		api_version : 3,
		token : Wiz_Context.token
	};
	var callbackSuccess = function (responseJSON) {
		try {
			console.log('wiz_portRequestCategoryAjax callbackSuccess');
			var categoryStr = responseJSON.categories;
			setLocalCategory(categoryStr);
			if (port) {
				port.postMessage(categoryStr);
			}
		} catch (err) {
			console.log('wiz_portRequestCategoryAjax callbackSuccess Error: ' + err);
		}
	};
	var callbackError = function (response) {
		console.log('wiz_portRequestCategoryAjax callbackError');
		try {
			if (port) {
				//失败后，应该自动重新获取
				// port.postMessage(false); 这样会导致显示错误，目录显示为als
			}
		} catch (err) {
			console.log('wiz_requestCategory callError Error: ' + err);
		}
	};
	$.ajax({
		type : 'GET',
		url : 'http://www.wiz.cn/api/category/all',
		data : params,
		success : callbackSuccess,
		error : callbackError
	});
	// xmlrpc(Wiz_Context.xmlUrl, 'category.getAll', [params], callbackSuccess, callbackError);
}

/**
 *获取当前页面的tab信息 
 */
function getTab(callback, params) {
	chrome.windows.getCurrent(function (win) {
		chrome.tabs.getSelected(win.id, function (tab) {
			Wiz_Context.tab = tab;
			callback(tab, params);
		});
	});
}

function hideContentVeil(tab) {
	Wiz_Browser.sendRequest(tab.id, {
		name : 'preview',
		op : 'clear'
	});
}

function bindKeyDownHandler(tab, direction) {
	Wiz_Browser.sendRequest(tab.id, {
		name : 'preview',
		op : 'keydown',
		opCmd : direction
	});
}

function wizPostDocument(docInfo) {
	//整理数据
	var regexp = /%20/g,
		title = docInfo.title,
		category = docInfo.category,
		comment = docInfo.comment,
		body = docInfo.params;
		  
	if (comment && comment.trim() !== '') {
		body = comment + '<hr>' + body;
	}
	
	if (!category) {
		category = '/My Notes/';
	}
	
	var requestData = 'title=' + encodeURIComponent(title).replace(regexp,  '+') + '&token_guid=' + encodeURIComponent(Wiz_Context.token).replace(regexp,  '+')
						+ '&body=' + encodeURIComponent(body).replace(regexp,  '+') + '&category=' + encodeURIComponent(category).replace(regexp,  '+');

	//发送给当前tab消息，显示剪辑结果					
	Wiz_Browser.sendRequest(Wiz_Context.tab.id, {name: 'sync', info: docInfo});
	
	var callbackSuccess = function (response) {
		try {
			var json = JSON.parse(response);
			//需要类型转换
			if (json.return_code != 200) {
				console.error('sendError : ' + json.return_message);
				docInfo.errorMsg = json.return_message;
				
				Wiz_Browser.sendRequest(Wiz_Context.tab.id, {name: 'error', info: docInfo});
				return;
			}
			console.log('success : saveDocument');
			
			Wiz_Browser.sendRequest(Wiz_Context.tab.id, {name: 'saved', info: docInfo});
		} catch (err) {
			console.log('wizPostDocument callbackSuccess Error: ' + err);
		}
	}
	
	var callbackError = function (response) {
		//TODO 使用闭包，自动重试3次，如果3次均失败，再提示用户
		//需要重构
		try {
			var errorJSON = JSON.parse(response);
			docInfo.errorMsg = json.return_message;

			Wiz_Browser.sendRequest(Wiz_Context.tab.id, {name: 'error', info: docInfo});

			console.error('callback error : ' + json.return_message);
		} catch (err) {
			console.log('wizPostDocument callbackError Error: ' + err);
		}
	};
	console.log('post document info');
	$.ajax({
		type : 'POST',
		url : 'http://webclip.openapi.wiz.cn/wizkm/a/web/post?',
		data : requestData,
		success : callbackSuccess,
		error : callbackError
	});
}

function wizRequestPreview(tab, op) {
	if (!op) {
		//默认为文章
		op = 'article';
	}
	Wiz_Browser.sendRequest(tab.id, {
		name : 'preview',
		op : op
	}, sendTabRequestCallbackByBrowserAction);
}

/**
 *请求剪辑页面回调函数
 */
function sendTabRequestCallbackByBrowserAction(option) {
	if (!option) {
		//当前页面无法剪辑
		chrome.extension.connect({
			'name' : 'pagePreviewFailure'
		});
	}
}
function sendTabRequestCallbackByContextMenu(option) {
	//要等页面完全加载后，右键点击仍然无返回，提示无法剪辑
	if (!option && Wiz_Context.tab.status === 'complete') {
		var pageClipFailure = chrome.i18n.getMessage('pageClipFailure');
		alert(pageClipFailure);
	}
}

var authenticationErrorMsg = chrome.i18n.getMessage('AuthenticationFailure');

function isLogin() {
	// if (Wiz_Context.token === null) {
	// 	alert(authenticationErrorMsg);
	// 	return false;
	// } else {
	// 2012-10-10修改登陆逻辑
	return true;
	// }
}

/**
 * 获取本地客户端信息
 * @return {[本地客户端]} []
 */
function getNativeClient() {
	try {
		var nativeClient = document.getElementById('wiz-local-app'),
			version = nativeClient.Version;
		if (typeof version === 'undefined') {
			return null;
		}
		return nativeClient;
	} catch (err) {
		console.log('background.getNativeClient() Error : ' + err);
		return null;
	}
}

function hasNativeClient() {
	var nativeClient = getNativeClient();
	return (nativeClient === null) ? false : true;
}

function saveToNative(info) {
	var wizClient = getNativeClient();
	try {
		wizClient.Execute(info.params);
	} catch (err) {
		console.warn('background saveToNative Error : ' + err);
	}
	console.log('Saved To Native Client');
}

function saveToServer(info) {
	//1、登陆到服务器
	//2、登陆返回成功后，postDocument
	Cookie.getCookies(Wiz_Context.cookieUrl, Wiz_Context.cookieName, wiz_loginByCookies, true, info);
}

function wizSaveNativeContextMenuClick(info, tab) {
	Wiz_Context.tab = tab;
	var wizClient = getNativeClient();
	Wiz_Browser.sendRequest(tab.id, {
		name: 'preview',
		op: 'submit',
		info : { url: tab.url },
		type: 'native'
	}, sendTabRequestCallbackByContextMenu);
}

function wizSavePageContextMenuClick(info, tab) {
	var type = 'fullPage';
	Wiz_Context.tab = tab;

	//判断是否用户手动选择
	if (info.selectionText) {
		type = 'selection';
	}
	if (isLogin()) {
		info.title = tab.title;
		Wiz_Browser.sendRequest(tab.id, {
			name : 'preview',
			op : 'submit',
			info : info,
			type : type
		}, sendTabRequestCallbackByContextMenu);
	}
}

function wiz_initContextMenus() {
	var clipPageContext = chrome.i18n.getMessage('contextMenus_clipPage'),
		allowableUrls = ['http://*/*', 'https://*/*'];
	var	hasNative = getNativeClient();
	
	if (hasNativeClient()) {
		chrome.contextMenus.create({
			'title': clipPageContext,
			'contexts' : ['all'],
			'documentUrlPatterns' : allowableUrls,
			'onclick': wizSaveNativeContextMenuClick
		});
	} else {
		chrome.contextMenus.create({
			'title' : clipPageContext,
			'contexts' : ['all'],
			'documentUrlPatterns' : allowableUrls,
			'onclick' : wizSavePageContextMenuClick
		});
	}
}

function wiz_background_autoLogin() {
	Cookie.getCookies(Wiz_Context.cookieUrl, Wiz_Context.cookieName, wiz_loginByCookies, true);
}

function wiz_background_getCookie() {
	var callback = function (cookies) {
		Wiz_Context.cookies = cookies;
	};
	Cookie.getCookies(Wiz_Context.cookieUrl, Wiz_Context.cookieName, callback, true);
}

chrome.extension.onConnect.addListener(wiz_onConnectListener);
wiz_initContextMenus();
//屏蔽自动登陆
// wiz_background_autoLogin();
wiz_background_getCookie();
