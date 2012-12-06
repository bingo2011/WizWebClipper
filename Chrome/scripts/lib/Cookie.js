
var Cookie = window.Cookie || {},
	cookieExpiredays = 14 * 24 * 60 * 60;
Cookie.setCookies =  function(url, name, value, expireSecond) {
	var exdate = new Date();
	var param = {
		url : url,
		name : name,
		value : value
	}
	if (expireSecond) {
		var expire = new Date().getTime() / 1000 + expireSecond;
		param.expirationDate = expire;
	}
	chrome.cookies.set(param, function(cookie) {
	});
};
Cookie.getCookies = function(url, key, callback, isAutoDelay, params) {
	chrome.cookies.get({
		url : url,
		name : key
	}, function(cookies) {
		if (cookies && cookies.value && isAutoDelay) {
			//自动延长cookie时间
			var expiredays = cookieExpiredays;
			Cookie.setCookies(url, key, cookies.value, expiredays);
		}
		if (params) {
			callback(cookies, params);
		} else {
			callback(cookies);
		}
	});
};
Cookie.removeCookies = function(url, key, callback) {
	chrome.cookies.remove({
		url : url,
		name : key
	}, callback);
}
