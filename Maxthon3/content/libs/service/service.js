var Wiz_Context = {
	cookieUrl : 'http://service.wiz.cn/web',
	cookieName : 'wiz-clip-auth',
	category_expireSec:  10 * 60,
	token : "",
	tab : null,
	user_id : null,
	isLogin: false
};

function onConnectListener(port) {
	var name = port.name,
		info = port.info;
	if (!name) {
		return;
	}
	switch (name) {
	case 'login':
		loginAjax(port.params);
		break;
	case 'retryClip':
		break;
	case 'requestCategory':
		requestCategory();
		break;
	case 'saveDocument':
		//获取当前页面的剪辑信息
		var paramsStr = Wiz.storage.get(info);
		if (!paramsStr ) {
			return;
		}
		params = JSON.parse(paramsStr);
		console.log(params);
		if (params.isNative === true) {
			//调用本地客户单保存，不需要进行登陆
			saveToNative(params);
		} else {
			if ( !params.title|| !params.params) {
				return;
			}
			//登陆成功后保存
			saveToServer(params);
			// wizPostDocument(info);
		}
		break;
 	}
}

/**
 * 通过cookie登陆
 * @param  {[type]}   cookie   [description]
 * @param  {Function} callback [登陆成功后回调函数]
 * @param  {[type]}   params   [callback需要的参数---option]
 * @return {[type]}            [description]
 */
function loginByCookies(cookie, callback, params) {
	if (!cookie) {
		return;
	}
	// console.log(typeof cookie);
	// console.log(cookie);
	var info = cookie;
	var split_count = info.indexOf('*md5');
	var loginParam = Wiz.Constant.LOGIN_PARAMS;
	loginParam.user_id = info.substring(0, split_count);
	loginParam.password = info.substring(split_count + 1);
	loginAjax(loginParam, callback, params);
}

/**
 * 登陆方法
 * @param  {[type]}   loginParam [登陆信息]
 * @param  {Function} callback   [登陆成功回调函数]
 * @param  {Function} params   	 [回调函数参数]
 * @return {[type]}              [description]
 */
function loginAjax(loginParam, callback, params) {
	var loginError = function(err) {
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {'name': 'loginError', 'params': err});
	}
	var loginSuccess = function(responseJSON) {

		try {
			Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {'name': 'loginSuccess', 'params': responseJSON, 'hasNative': hasNativeClient()});
			// 不应该放在login中来处理，应该在popup来发送请求
			Wiz_Context.token = responseJSON.token;

			localStorage['wiz-clip-auth'] = loginParam.user_id;
			localStorage[Wiz.Constant.Default.AUTH_COOKIE] = loginParam.user_id + '*' + loginParam.password;
			if (!localStorage['wiz-clip-auth'] && !localStorage[Wiz.Constant.Default.AUTH_COOKIE]) {
				//手动点击登陆时，需要发送消息到popup页面
				Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {name: 'initClipPage', hasNative: hasNativeClient()});
				wizRequestPreview();
			}

			//执行回调函数
			if (typeof callback === 'function') {
				callback(params);
			}
		} catch (err) {
			console.log('loginAjax callSuccess Error: ' + err);
		}
	}
	//缓存userid
	Wiz_Context.user_id = loginParam.user_id;
	console.log('service do login');
	// console.log(loginParam);
	xmlrpc(Wiz.Constant.Default.XMLURL, 'accounts.clientLogin', [loginParam], loginSuccess, loginError);
}

function requestCategory() {
	var nativeCategoryStr = getNativeCagetory(Wiz_Context.user_id),
		localCategoryStr = getLocalCategory(),
		categoryStr = (nativeCategoryStr) ? (nativeCategoryStr) : (localCategoryStr);

	//本地如果为获取到文件夹信息，则获取服务端的文件夹信息
	console.log(categoryStr);
	if (categoryStr) {
		sendCategoryToPopup(categoryStr);
	} else {
		var authStr = localStorage[Wiz.Constant.Default.AUTH_COOKIE];
		loginByCookies(authStr, requestCategoryAjax);
		// requestCategoryAjax();
	}
}

/**
 * 发送目录信息给popup页面
 * @param  {[type]} categoryStr [description]
 * @return {[type]}             [description]
 */
function sendCategoryToPopup(categoryStr) {
	Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {'name': 'responseCategory', 'category': categoryStr, 'token': Wiz_Context.token});
}

function getLocalCategory() {
	var localCategoryStr = localStorage[Wiz.Constant.Default.COOKIE_CATEGORY],
		storedTimeStr = localStorage[Wiz.Constant.Default.COOKIE_CATEGORY_TIME],
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
	localStorage[Wiz.Constant.Default.COOKIE_CATEGORY] = value;
	localStorage[Wiz.Constant.Default.COOKIE_CATEGORY_TIME] = storedTime;
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

function requestCategoryAjax(port) {
	var loginParam = Wiz.Constant.LOGIN_PARAMS;
	loginParam.token = Wiz_Context.token;
	var callbackSuccess = function(responseJSON) {
		var categoryStr = responseJSON.categories;
		if (typeof categoryStr !== 'string') {
			return ;
		}
		console.log('service.requestCategoryAjax Success: ' + categoryStr);
		setLocalCategory(categoryStr);
		sendCategoryToPopup(categoryStr);
	}
	var callbackError = function(response) {
		//TODO 统一的页面错误显示
		console.log('requestCategoryAjax() callError: ' + err);
	}
	xmlrpc(Wiz.Constant.Default.XMLURL, 'category.getAll', [loginParam], callbackSuccess, callbackError);
}

function bindKeyDownHandler(direction) {
	Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {
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
	Wiz.notification.showSync(docInfo.title);

	var callbackSuccess = function(response) {
		var json = JSON.parse(response);
		if (json.return_code != 200) {
			console.error('sendError : ' + json.return_message);
			docInfo.errorMsg = json.return_message;
			
			Wiz.notification.showError(docInfo.errorMsg);
			// Wiz.Browser.sendRequest(Wiz_Context.tab.id, {name: 'error' , info: docInfo});
			return;
		}
		// console.log('success : saveDocument');
		
		Wiz.notification.showSuccess(docInfo.title);
		// Wiz.Browser.sendRequest(Wiz_Context.tab.id, {name: 'saved' , info: docInfo});
	}
	
	var callbackError = function(response) {
		var errorJSON = JSON.parse(response);
		docInfo.errorMsg = json.return_message;

		Wiz.notification.showError(docInfo.errorMsg);
		// Wiz.Browser.sendRequest(Wiz_Context.tab.id, {name: 'error' , info: docInfo});

		console.error('callback error : ' + json.return_message);
	}
	console.log('post document info');
	$.ajax({
		type : 'POST',
		url : 'http://service.wiz.cn/wizkm/a/web/post?',
		data : requestData,
		success : callbackSuccess,
		error : callbackError
	});
}

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
}

var authenticationErrorMsg = Wiz.Message.get('AuthenticationFailure');
function isLogin() {
	// if (Wiz_Context.token === null) {
	// 	alert(authenticationErrorMsg);
	// 	return false;
	// } else {
		return true;
	// }
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

function saveToServer(info) {
	var authStr = localStorage[Wiz.Constant.Default.AUTH_COOKIE];
	if (typeof authStr === 'string') {
		loginByCookies(authStr, wizPostDocument, info);
	}
}


Wiz.Browser.addListener(Wiz.Constant.ListenType.SERVICE, onConnectListener);
// 通过监听appEvent来向当前页面和popup发送消息
Wiz.maxthon.onAppEvent = function (obj) {
	if (!obj.action) {
		return;
	}
	var targetType = obj.action.type,
		actionType = obj.type,
		hasNative = hasNativeClient();
	if ('panel' === targetType && 'ACTION_SHOW' === actionType) {
		console.log('popup page initialize');
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {name: 'initClipPage', hasNative: hasNative});
	}
	//popup页面关闭，发送请求，取消预览
	if ('panel' === targetType && 'ACTION_STOP' === actionType) {
		wizRequestPreview('clear');
	}
}