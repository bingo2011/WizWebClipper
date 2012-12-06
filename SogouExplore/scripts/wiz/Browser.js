var com_wizbrother_Browser = {
	//'use strict';
	onRequest : function(callback){
		try {
			var _onRequest = (sogouExplorer.extension.onMessage) ? (sogouExplorer.extension.onMessage) : (sogouExplorer.extension.onRequest);
			return _onRequest;
		} catch (err) {
			console.log('com_wizbrother_Browser onRequest() Error : ' + err);
		}
	},
	sendRequest : function (tabId, params, callback) {
		try {
			if (sogouExplorer.extension.onMessage) {
				sogouExplorer.tabs.sendMessage(tabId, params, callback);
			} else {
				sogouExplorer.tabs.sendRequest(tabId, params, callback);
			}
		} catch (err) {
			console.log('com_wizbrother_Browser sendRequest() Error : ' + err);
		}	 			
	}
};