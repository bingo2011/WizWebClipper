/**
 * background.js中提取出的通用方法
 */
'use strict';
Wiz.OperaBackground = function () {
	
};



Wiz.OperaBackground.prototype.sendCategoryToPopup = function (categories) {
	opera.extension.broadcastMessage({'name': 'responseCategories', 'info': categories});
};

Wiz.OperaBackground.prototype.sendLoginError = function (errorMsg) {
	opera.extension.broadcastMessage({'name': 'loginError', 'info': errorMsg});
};

Wiz.OperaBackground.prototype.getCacheCategories = function () {
	var localCategoryStr = localStorage.getItem(Wiz.Default.COOKIE_CATEGORY);
		// storedTimeStr = localStorage.getItem(Wiz.Default.COOKIE_CATEGORY_TIME),
		// storedTime = Date.parse(storedTimeStr),
		// nowTime = new Date(),
		// isOverTime = ((nowTime - storedTime) / 1000 >= Wiz.Default.CATEGORY_EXPIRE_SEC);//是否过期
	return localCategoryStr;

};

Wiz.OperaBackground.prototype.setCacheCategories = function (categories) {
	var storedTime = (new Date()).toString();
	localStorage.setItem(Wiz.Default.COOKIE_CATEGORY) = categories;
	localStorage.setItem(Wiz.Default.COOKIE_CATEGORY_TIME) = storedTime;
};