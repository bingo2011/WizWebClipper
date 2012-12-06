// 'use strict';
Wiz.Browser = {
	sendRequest : function(type, param) {
		try {
			Wiz.maxthon.post(type, param);
			console.log('Wiz.Browser.sendRequest');
		} catch (err) {
			console.log('Wiz.Browser.sendRequest() Error:' + err);
		}

	},
	addListener: function(type, listenner) {
		Wiz.maxthon.listen(type, listenner);
	}
}