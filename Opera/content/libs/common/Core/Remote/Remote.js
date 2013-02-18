"use strict";
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
		'client_type' : 'webclip_opera',
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
		// console.debug('Wiz.Remote.clientLogin : ' + username + '---' + password);

		var postParams = Wiz.Remote.getPostObj();
		postParams.user_id = username;
		postParams.password = password;
		var success = function (respJson) {
			//登陆成功后，集中处理需要的信息
			try {
				console.error(respJson);
				//把user信息加入到Wiz上下文中
				Wiz.context.authority = username + '*' + password;
				Wiz.context.token = respJson.token;
				Wiz.context.kbGuid = respJson.kb_guid;
				Wiz.context.userId = username;

				if (rememberMe === true) {
					Wiz.storageManager.set(Wiz.Default.AUTHORITY, Wiz.context.authority, false);
					Wiz.storageManager.set(Wiz.Default.STORAGE_USERID, username, false);
				} else {
					//如果用户未选中rememberMe，则使用sessionStorage来保存
					Wiz.storageManager.set(Wiz.Default.AUTHORITY, Wiz.context.authority, true);
					Wiz.storageManager.set(Wiz.Default.STORAGE_USERID, username, true);
				}
				callSuccess();
			} catch (err) {
				console.error('Wiz.Remote.clientLogin callbackSuccess Error: ' + err);
			}
		};
		var	callError = callError || function(error){
			console.error('error');
			console.error(error.statusText);
			// var key;
			// for (key in error) {
			// 	console.error(key);
			// }
			Wiz.background.sendLoginError(error);
		};

		$.ajax({
			type: 'POST',
			url: 'http://www.wiz.cn/api/login',
			data: postParams,
			success : success,
			error : callError
		});
		// xmlrpc(Wiz.XMLRPC_URL, Wiz.Api.ACCOUNT_LOGIN, [postParams], success, callError);
	} catch (err) {
		console.error('Wiz.Remote.clientLogin() Error : ' + err);
	}
};

Wiz.Remote.prototype.getAllCategory = function (callSuccess, callError) {
	try {
		var success = function (resp) {
			if (200 == resp.return_code && callSuccess) {
				callSuccess(resp.categories);
			} else {
				//TODO
				console.error(resp.return_message);
			}
		};
		var token = Wiz.context.token;
		if (token !== null) {
			var postParams = Wiz.Remote.getPostObj();
			postParams.token = token;

			$.ajax({
				type : 'GET',
				url : 'http://www.wiz.cn/api/category/all',
				data : postParams,
				success : success,
				error : callError
			});
			// xmlrpc(Wiz.XMLRPC_URL, Wiz.Api.GET_AllCATEGORIES, [postParams], success, callError);
		}	
	} catch (err) {
		console.error('Wiz.Remote.getAllCategory() Error : ' + err);
	}
};

/**
 * 服务器端改动，临时解决方案
 * @param  {[type]} docInfo [description]
 * @return {[type]}         [description]
 */
Wiz.Remote.prototype.postDocument = function (docInfo) {
	var token = Wiz.context.token;
	var kbGuid = Wiz.context.kbGuid;
	if (token !== null) {
		var error = function (err) {
			try {
				var respJson = JSON.parse(err);
				if (respJson.return_code != 200) {
        			opera.extension.broadcastMessage({'name': 'clipResult', 'info': docInfo, 'status': 'error'});	
					console.error('Wiz.Remote.postDocument() success: ' + err);
					// Wiz.notificator.showError(respJson.return_message);
				} else {
					// 保存成功后，如果没有本地客户端，从服务端获取最新目录信息
					Wiz.remote.getAllCategory();
        			opera.extension.broadcastMessage({'name': 'clipResult', 'info': docInfo, 'status': 'saved'});
					// Wiz.notificator.showClipSuccess(docInfo.title);
				}
			} catch (e) {
        		opera.extension.broadcastMessage({'name': 'clipResult', 'info': docInfo, 'status': 'error'});	
				// Wiz.notificator.showError(e);
				console.error('Wiz.Remote.postDocument() Error: ' + e);
			}
		};
		var	success = function (info) {
        	opera.extension.broadcastMessage({'name': 'clipResult', 'info': docInfo, 'status': 'saved'});
			// Wiz.notificator.showClipSuccess(docInfo.title);
		};

		var getReplaceStr = function (str) {
			var regexp = /%20/g;
			return encodeURIComponent(str).replace(regexp, '+');
		};
		var genGuid = function () {
			function S4() {
			    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			}
		  	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
		};
		try {
			var docGuid = genGuid();
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
			var createData = 'temp=true&api_version=3&client_type=webclip_chrome&token=' + getReplaceStr(token) + '&kb_guid=' + getReplaceStr(kbGuid)
								+ '&document_guid=' + getReplaceStr(docGuid);


			var updateData = 'api_version=3&client_type=webclip_chrome&token=' + getReplaceStr(token) + '&kb_guid=' + getReplaceStr(kbGuid)
								+ '&document_guid=' + getReplaceStr(docGuid) + '&document_body=' + getReplaceStr(body) + '&document_category=' + getReplaceStr(category)
								+ '&document_title=' + title;
			// var requestData = 'title=' + encodeURIComponent(title).replace(regexp,  '+') + '&token_guid=' + encodeURIComponent(token).replace(regexp,  '+') 
			// 					+ '&body=' + encodeURIComponent(body).replace(regexp,  '+') + '&category=' + encodeURIComponent(category).replace(regexp,  '+');
			// ajax(Wiz.POST_DOCUMENT_URL, requestData, success, error);
			
		$.ajax({
				type : 'POST',
				url : 'http://www.wiz.cn/api/document/data',
				data : createData,
				success : function(resp) {
					if (resp.code == 200) {
						$.ajax({
							type : 'PUT',
							url : 'http://www.wiz.cn/api/document/data',
							data : updateData,
							success : success,
							error : error
						});
					}
				},
				error : error
			});
		} catch (err) {
			console.error('Wiz.Remote.postDocument() Error : ' + err);
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
Wiz.Remote.prototype.loginByCookie = function (authority, callSuccess, callError) {
	try {
		var split_count = authority.indexOf('*md5'),
			user_id = authority.substring(0, split_count),
			password = authority.substring(split_count + 1);
		this.clientLogin(user_id, password, true, callSuccess, callError);
	} catch (err) {
		console.error('Wiz.Remote.loginByCookie() Error : ' + err);
	}
};

Wiz.Remote.prototype.autoLogin = function (callback, callbackParams) {
	var authority = Wiz.context.authority,
		error = function (errorMsg) {
			//自动登陆错误暂不做错误处理,记录日志
			console.error('Wiz.Remote.autoLogin() Error: ' + errosMsg);
		},
		success = function(resp){
			callback(callbackParams);
		};
	if (authority) {	
		this.loginByCookie(authority, success, error);
	}
};
