// "use strict";
Wiz.Remote = function () {
	this.initialize();
};

Wiz.Remote.prototype.initialize = function () {
	this.initCommon();
};

Wiz.Remote.prototype.initCommon = function () {

};

Wiz.Remote.getPostObj = function () {
	var data = {
		'client_type' : 'webclip_firefox',
		'api_version' : 3,
	    'program_type' : 'normal'
	};
	return data;
};

Wiz.Remote.autoKeepAliveProc = null;
Wiz.Remote.autoLoginTimes = 0;
Wiz.Remote.autoLoginLimit = 3;


Wiz.Remote.prototype.clientLogin = function (username, password, rememberMe, callSuccess, callError) {
	try {
		Wiz.logger.debug('Wiz.Remote.clientLogin : ' + username + '---' + password);

		var postParams = Wiz.Remote.getPostObj();
		postParams.user_id = username;
		postParams.password = password;
		var success = function (respJson) {
			//登陆成功后，集中处理需要的信息
			try {
				Wiz.logger.debug('Wiz.Remote.clientLogin() Success : ' + JSON.stringify(respJson));

				Wiz.saveAuthCookie(username + '*' + password, rememberMe);
				Wiz.saveTokenCookie(respJson.token);
				//每次登陆成功后，重新写入now_user,方便以后显示或查看
				Wiz.prefStorage.set(Wiz.Pref.NOW_USER, username, 'char');
				callSuccess(respJson);
				
				//自动保持token在线
				//需要判断是否已经自动keep alive
				//否则会造成死循环
				if (!Wiz.Remote.autoKeepAliveProc) {
					Wiz.Remote.autoKeepAliveProc = setInterval(Wiz.Remote.keepAlive, Wiz.Default.REFRESH_TOKEN_TIME_MS);
				}
			} catch (err) {
				Wiz.logger.error('Wiz.Remote.clientLogin callbackSuccess Error: ' + err);
			}
		},
			callError = callError || function(){};

		$.ajax({
			type: 'POST',
			url: 'http://www.wiz.cn/api/login',
			data: postParams,
			success : success,
			error : callError
		});
		// xmlrpc(Wiz.XMLRPC_URL, Wiz.Api.ACCOUNT_LOGIN, [postParams], success, callError);
		// 切换到openapi上
	} catch (err) {
		Wiz.logger.error('Wiz.Remote.clientLogin() Error : ' + err);
	}
};

Wiz.Remote.keepAlive = function (callSuccess, callError) {
	Wiz.logger.debug('Wiz.Remote.keepAlive(): start keepAlive');
	callSuccess = function () {
		Wiz.logger.debug('Wiz.Remote.keepAlive(): ' + Wiz.context.token);
	};
	callError = function (errorMsg) {
		//保持失败，自动登陆
		//重试3次
		try {
			if (Wiz.Remote.autoLoginTimes < Wiz.Remote.autoLoginLimit) {
				Wiz.Remote.autoLoginTimes ++;
				Wiz.remote.autoLogin();
				Wiz.logger.debug('Wiz.remote.autoLoginTimes: ' + Wiz.Remote.autoLoginTimes);
			} else {
				//重试超过3次，关闭自动keep alive
				if (Wiz.Remote.autoKeepAliveProc) {
					clearInterval(Wiz.Remote.autoKeepAliveProc);
					Wiz.logger.error('Wiz.Remote.autoLogin Time out');
				}
			}
			Wiz.logger.error('Wiz.Remote.keepAlive() Error: ' + errorMsg);
		} catch (err) {
			Wiz.logger.error('Wiz.Remote.keepAlive() callError Error: ' + err);
		}
	};
	try {
		var token = Wiz.context.token;
		if (token !== null) {
			var postParams = Wiz.Remote.getPostObj();
			postParams.token = token;
			$.ajax({
				type: 'POST',
				url: 'http://www.wiz.cn/api/keepalive',
				data: postParams,
				success : callSuccess,
				error : callError
			});
			// xmlrpc(Wiz.XMLRPC_URL, Wiz.Api.ACCOUNT_KEEPALIVE, [postParams], callSuccess, callError);
		} else {
			//TODO need to autoLogin
		}	
	} catch (err) {
		Wiz.logger.error('Wiz.Remote.keepAlive() Error : ' + err);
	}
};

Wiz.Remote.prototype.getAllCategory = function (callSuccess, callError) {
	try {
		var token = Wiz.context.token;
		if (token !== null) {
			var postParams = Wiz.Remote.getPostObj();
			postParams.token = token;
			$.ajax({
				type: 'POST',
				url: 'http://www.wiz.cn/api/category/all',
				data: postParams,
				success : callSuccess,
				error : callError
			});
			// xmlrpc(Wiz.XMLRPC_URL, Wiz.Api.GET_AllCATEGORIES, [postParams], callSuccess, callError);
		}	
	} catch (err) {
		Wiz.logger.error('Wiz.Remote.getAllCategory() Error : ' + err);
	}
};

Wiz.Remote.prototype.getAllTag = function (callSuccess, callError) {
	try {
		var token = Wiz.context.token;
		if (token !== null) {
			var postParams = Wiz.Remote.getPostObj();
			postParams.token = token;
			$.ajax({
				type: 'POST',
				url: 'http://www.wiz.cn/api/tag/all',
				data: postParams,
				success : callSuccess,
				error : callError
			});
			// xmlrpc(Wiz.XMLRPC_URL, Wiz.Api.GET_AllTAGS, [postParams], callSuccess, callError);
		}
	} catch (err) {
		Wiz.logger.error('Wiz.Remote.getAllTag() Error : ' + err);
	}
};

Wiz.Remote.prototype.postDocument = function (docInfo) {
	var token = Wiz.context.token;
	if (token !== null) {
		var error = function (err) {
			try {
				Wiz.logger.debug('Wiz.Remote.postDocument() callerror: ' + err);
				var respJson = JSON.parse(err);
				if (respJson.return_code != 200) {
					Wiz.notificator.showError(respJson.return_message);

					if (Wiz.Remote.autoLoginTimes < Wiz.Remote.autoLoginLimit) {
						Wiz.Remote.autoLoginTimes ++;
						Wiz.remote.autoLogin();
					}
				} else {
					Wiz.notificator.showClipSuccess(docInfo.title);
				}
			} catch (e) {
				Wiz.notificator.showError(e);
				Wiz.logger.error('Wiz.Remote.postDocument() Error: ' + e);
			}
		},
			success = function (info) {
				Wiz.logger.debug('Wiz.Remote.postDocument() callsuccess: ' + info);
				Wiz.notificator.showClipSuccess(docInfo.title);
			};
		try {
			Wiz.logger.debug('Wiz.Remote.postDocument start token = ' + Wiz.context.token);
			var regexp = /%20/g,
				title = docInfo.title,
				category = docInfo.category,
				comment = docInfo.comment,
				body = docInfo.content;
			  
			if (comment && comment.trim() !== '') {
				body = comment + '<hr>' + body;
			}
			
			if (!category) {
				category = '/My Notes/';
			}

			var requestData = 'title=' + encodeURIComponent(title).replace(regexp,  '+') + '&token_guid=' + encodeURIComponent(token).replace(regexp,  '+') 
								+ '&body=' + encodeURIComponent(body).replace(regexp,  '+') + '&category=' + encodeURIComponent(category).replace(regexp,  '+');

			
			$.ajax({
				type : 'POST',
				url : 'http://webclip.openapi.wiz.cn/wizkm/a/web/post?',
				data : requestData,
				success : callbackSuccess,
				error : callbackError
			});
			// Wiz.logger.debug('postDocument requestData: ' + requestData);
			// ajax(Wiz.POST_DOCUMENT_URL, requestData, success, error);
		} catch (err) {
			Wiz.logger.error('Wiz.Remote.postDocument() Error : ' + err);
		}
	}
};

/**
 * 自动登陆处理
 * @param  {[type]} cookie      [保存在cookie中的auth信息]
 * @param  {[type]} callSuccess [description]
 * @param  {[type]} callError   [description]
 * @return {[type]}             [description]
 */
Wiz.Remote.prototype.loginByCookie = function (cookie, callSuccess, callError) {
	Wiz.logger.debug('Wiz.Remote.loginByCookie() Start ');
	try {
		var info = cookie.value,
			split_count = info.indexOf('*md5'),
			user_id = info.substring(0, split_count),
			password = info.substring(split_count + 1);
		this.clientLogin(user_id, password, true, callSuccess, callError);
	} catch (err) {
		Wiz.logger.error('Wiz.Remote.loginByCookie() Error : ' + err);
	}
};

Wiz.Remote.prototype.autoLogin = function () {
	Wiz.logger.debug('Wiz.Remote.autoLogin() Start ');
	var authCookie = Wiz.getAuthCookie(),
		success = function (resp) {
			Wiz.logger.info('Wiz.Remote.autoLogin() success: ' + resp.return_code + ';return_message: '+ resp.return_message);
		},
		error = function (errorMsg) {
			//自动登陆错误暂不做错误处理,记录日志
			Wiz.logger.error('Wiz.Remote.autoLogin() Error: ' + errosMsg);
		};
	Wiz.logger.debug('Wiz.Remote.autoLogin() authCookie: ' + authCookie);
	if (authCookie && authCookie.value) {	
		this.loginByCookie(authCookie, success, error);
	}
};
