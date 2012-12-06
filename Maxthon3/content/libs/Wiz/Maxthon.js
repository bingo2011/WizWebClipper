// 'use strict';
Wiz.Maxthon = function () {
	var that = window.external.mxGetRuntime();
	that.browser = getApiObj(Wiz.Maxthon.BROWSER);

	function getApiObj(name) {
		try {
			var obj = that.create(name);
		} catch (err) {
			//TODO
		}
		return obj;
	}

	return that;
};

Wiz.Maxthon.BROWSER = 'mx.browser'; 