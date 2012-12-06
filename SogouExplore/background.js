var Wiz_Context = {
	xmlUrl: 'http://webclip.openapi.wiz.cn/wizkm/xmlrpc',
	cookieUrl: 'http://service.wiz.cn/web',
	cookieName: 'wiz-clip-auth',
	cookie_category: 'wiz-all-category',
	cookie_category_time: 'wiz-category-stored-time',
	category_expireSec:  10 * 60,
	token: null,
	tab: null,
	user_id: null,
	refresh_token_delay_ms: 1 * 60 * 1000
}

function onConnectListener(port) {
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
		requestCategory(port);
		break;
	case 'saveDocument':
		port.onMessage.addListener(function(info) {
			if (!info) {
				return;
			}
			if (info.isNative === true) {
				saveToNative(info);
			} else {
				if (info.title == null || info.params == null || info.title.toString() === '' || info.params.toString() === '') {
					return;
				}
				wizPostDocument(info);
			}
		});
		break;
	case 'checkLogin':
		port.onMessage.addListener(function(msg) {
			if (Wiz_Context.token != null) {
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
		if (Wiz_Context.token) {
			getTab(wizRequestPreview);
			info.login = true;
			port.postMessage(info);
		} else {
			info.login = false;
			port.postMessage(info);
		}
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
		port.onDisconnect.addListener(function() {
			getTab(hideContentVeil);
		});
		break;
	case 'preview':
		port.onMessage.addListener(function(msg) {
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
	Cookie.getCookies(Wiz_Context.cookieName, loginByCookies, false);
	port.onMessage.addListener(function(msg) {
		if (msg && msg.title && msg.params) {
			wizPostDocument(msg);
		}
	});
}

function loginByCookies(cookie) {
	var info = cookie;
	var split_count = info.indexOf('*md5');
	var loginParam = {};
	loginParam.client_type = 'webclip_sogou';
	loginParam.api_version = 3;
	loginParam.user_id = info.substring(0, split_count);
	loginParam.password = info.substring(split_count + 1);
	portLogin(loginParam);
}

function portLoginAjax(loginParam, port) {
	var loginError = function(err) {
		port.postMessage(err);
	}
	var loginSuccess = function(responseJSON) {
		Wiz_Context.token = responseJSON.token;
		// setInterval(refreshToken, Wiz_Context.refresh_token_delay_ms);
		// 每次点击，自动登陆一次，setInterval在搜狗扩展中使用有问题
		if (port) {
			port.postMessage(true);
			getTab(wizRequestPreview);
		}
	}
	//缓存userid
	Wiz_Context.user_id = loginParam.user_id;
	console.log('login');
	xmlrpc(Wiz_Context.xmlUrl, 'accounts.clientLogin', [loginParam], loginSuccess, loginError);
}

function requestCategory(port) {
	var nativeCategoryStr = getNativeCagetory(Wiz_Context.user_id),
		localCategoryStr = getLocalCategory(),
		categoryStr = (nativeCategoryStr) ? (nativeCategoryStr) : (localCategoryStr);

	if (port) {
		//本地如果为获取到文件夹信息，则获取服务端的文件夹信息
		if (categoryStr) {
			port.postMessage(categoryStr);
		} else {
			portRequestCategoryAjax(port);
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

function portRequestCategoryAjax(port) {
	var params = {
		client_type : 'webclip_sogou',
		api_version : 3,
		token : Wiz_Context.token
	};
	var callbackSuccess = function(responseJSON) {
		var categoryStr = responseJSON.categories;
		setLocalCategory(categoryStr);
		if (port) {
			port.postMessage(categoryStr);
		}
	}
	var callbackError = function(response) {
		if (port) {
			// port.postMessage(false);
		}
	}
	xmlrpc(Wiz_Context.xmlUrl, 'category.getAll', [params], callbackSuccess, callbackError);
}

/**
 *获取当前页面的tab信息 
 */
function getTab(callback, direction) {
	sogouExplorer.windows.getCurrent(function(win) {
		sogouExplorer.tabs.getSelected(win.id, function(tab) {
			Wiz_Context.tab = tab;
			callback(tab, direction);
		});
	});
}

function hideContentVeil(tab) {
	com_wizbrother_Browser.sendRequest(tab.id, {
		name : 'preview',
		op : 'clear'
	});
}

function bindKeyDownHandler(tab, direction) {
	com_wizbrother_Browser.sendRequest(tab.id, {
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
		  
	if (comment && comment.trim() != '') {
		body = comment + '<hr>' + body;
	}
	
	if (!category) {
		category = '/My Notes/';
	}
	
	var requestData = 'title=' + encodeURIComponent(title).replace(regexp,  '+') + '&token_guid=' + encodeURIComponent(Wiz_Context.token).replace(regexp,  '+') 
						+ '&body=' + encodeURIComponent(body).replace(regexp,  '+') + '&category=' + encodeURIComponent(category).replace(regexp,  '+');

	//发送给当前tab消息，显示剪辑结果					
	com_wizbrother_Browser.sendRequest(Wiz_Context.tab.id, {name : 'preview', op: 'sync', info: docInfo});
	
	var callbackSuccess = function(response) {
		var json = JSON.parse(response);
		if (json.return_code != 200) {
			console.error('sendError : ' + json.return_message);
			docInfo.errorMsg = json.return_message;
			
			com_wizbrother_Browser.sendRequest(Wiz_Context.tab.id, {name : 'preview', op: 'error' , info: docInfo});
			return;
		}
		console.log('success : saveDocument');
		
		com_wizbrother_Browser.sendRequest(Wiz_Context.tab.id, {name : 'preview', op: 'saved' , info: docInfo});

	}
	
	var callbackError = function(response) {
		var errorJSON = JSON.parse(response);
		docInfo.errorMsg = json.return_message;

		com_wizbrother_Browser.sendRequest(Wiz_Context.tab.id, {name : 'preview', op: 'error' , info: docInfo});

		console.error('callback error : ' + json.return_message);
	}
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
	com_wizbrother_Browser.sendRequest(tab.id, {
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
		sogouExplorer.extension.connect({
			'name' : 'PageClipFailure'
		});
	}
}

function sendTabRequestCallbackByContextMenu(option) {
	if (!option) {
		var pageClipFailure = com_wizbrother_Message.get('pageClipFailure');
		alert(pageClipFailure);
	}
}

var authenticationErrorMsg = com_wizbrother_Message.get('AuthenticationFailure');
function isLogin() {
	if (Wiz_Context.token === null) {
		alert(authenticationErrorMsg);
		return false;
	} else {
		return true;
	}
}

/**
 * 获取本地客户端信息
 * @return {[本地客户端]} []
 */
function getNativeClient () {
	try {
		var nativeClient = document.getElementById('wiz-local-app'),
			version = nativeClient.Version;
		if (typeof version === 'undefined') {
			return null;
		}
		return nativeClient;
	} catch(err) {
		console.log('background.getNativeClient() Error : ' + err);
		return null;
	}
}

function hasNativeClient() {
	var nativeClient = getNativeClient();
	return (nativeClient === null) ? false : true;
}

function saveToNative(info) {
	var wizClient = this.getNativeClient();
	try {
		wizClient.Execute(info.params);
	} catch (err) {
		console.warn('background saveToNative Error : ' + err);
	}
	console.log('Saved To Native Client');
}


/**
 *延长token时间
 */
function refreshToken() {
	var params = {
		client_type : 'webclip_sogou',
		api_version : 3,
		token : Wiz_Context.token
	};
	var callbackSuccess = function(responseJSON) {
	}
	var callbackError = function(response) {
		//刷新时失败时，需要自动重新登陆
		wiz_background_autoLogin();
	}
	console.log('refresh token start')
	xmlrpc(Wiz_Context.xmlUrl, 'accounts.keepAlive', [params], callbackSuccess, callbackError);
}

function wizSaveNativeContextMenuClick(info, tab) {
	Wiz_Context.tab = tab;
	var wizClient = this.getNativeClient();
	com_wizbrother_Browser.sendRequest(tab.id, {
		name: 'preview',
		op: 'submit',
		info : { url: tab.url },
		type: 'native'
	});
}

function wizSavePageContextMenuClick(info, tab) {
	Wiz_Context.tab = tab;
	if (isLogin()) {
		info.title = tab.title;
		com_wizbrother_Browser.sendRequest(tab.id, {
			name : 'preview',
			op : 'submit',
			info : info,
			type : 'fullPage'
		}, sendTabRequestCallbackByContextMenu);
	}
}

function initContextMenus() {
	var clipPageContext = com_wizbrother_Message.get('contextMenus_clipPage'),
		allowableUrls = ['http://*/*', 'https://*/*'];
	
	if (hasNativeClient()) {
		sogouExplorer.contextMenus.create({
			'title': clipPageContext,
			'contexts' : ['all', 'mainframe'],
			'documentUrlPatterns' : allowableUrls,
			'onclick': wizSaveNativeContextMenuClick
		});
	} else {
		sogouExplorer.contextMenus.create({
			'title' : clipPageContext,
			'contexts' : ['all', 'mainframe'],
			'documentUrlPatterns' : allowableUrls,
			'onclick' : wizSavePageContextMenuClick
		});
	}
}

function wiz_background_autoLogin() {
	Cookie.getCookies(Wiz_Context.cookieName, loginByCookies, true);
}

sogouExplorer.extension.onConnect.addListener(onConnectListener);
initContextMenus();
wiz_background_autoLogin();
