// 'use strict';
Wiz.Message = {
	get: function (name) {
		var value = Wiz.maxthon.locale.t(name);
		return value;
	}
}