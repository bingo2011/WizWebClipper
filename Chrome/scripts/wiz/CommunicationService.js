/**
 * @author rechie
 */
window.WizService = window.WizService || {};
WizService = {
	// 'use strict';
	ajaxUrl : 'http://webclip.openapi.wiz.cn/wizkm/xmlrpc',
	ajaxDoCmd : function(cmd, requestData, callSuccess, callError, callFinally, isAsync) {
		$.ajax(
			type : 'POST',
			url : ajaxUrl,
			data : requestData,
			success : function(response){
			},
			error : function(response){
			}
		});
	},
}
