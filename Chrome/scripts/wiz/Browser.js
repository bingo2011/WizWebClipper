var Wiz_Browser = {
	//'use strict';
	onRequest : function(callback){
		try {
			var _onRequest = (chrome.extension.onMessage) ? (chrome.extension.onMessage) : (chrome.extension.onRequest);
			return _onRequest;
		} catch (err) {
			console.log('Wiz_Browser onRequest() Error : ' + err);
		}
	},
	sendRequest : function (tabId, params, callback) {
		try {
			if (chrome.extension.onMessage) {
				chrome.tabs.sendMessage(tabId, params, callback);
			} else {
				chrome.tabs.sendRequest(tabId, params, callback);
			}
		} catch (err) {
			console.log('Wiz_Browser sendRequest() Error : ' + err);
		}	 			
	}
};