
var Cookie = window.Cookie || {};
Cookie.setCookies =  function(name, value, expireSecond) {
    // console.log(name + '--' + value + '--' + expireSecond);
    var Days = 30; //此 cookie 将被保存 30 天
    var exp  = new Date();    //new Date("December 31, 9998");
    exp.setTime(exp.getTime() + expireSecond * 1000);
    var cookieValue = name + "="+ window.escape (value) + "; max-age=" + expireSecond * 1000;
    // console.log(cookieValue);
    document.cookie = cookieValue;
    // console.log(document.cookie);
};
Cookie.getCookies = function(name, callback, isAutoDelay, params) {

    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)")),
    	cookie = null;
    if(arr != null) {
    	cookie = unescape(arr[2]);
	}
	if (callback) {
		callback(cookie, params);
	} else {
		return cookie;
	}
};
Cookie.removeCookies = function(name, callback) {	
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = Cookie.getCookies(name);
    if(cval!=null) document.cookie= name + "="+cval+";max-age=0";
};
