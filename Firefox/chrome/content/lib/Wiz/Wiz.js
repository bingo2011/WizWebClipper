// "use strict";

if (typeof Wiz == "undefined") {
    var Wiz = {
		_clipManager : null,          //负责剪辑相关操作
		_preview : null,              //预览相关操作
		_remote : null,               //和服务器交互
        _cookieManager : null,        //cookie相关操作
        _context : null,              //上下文，保存token user等信息
        _notificator : null,          //提示
        _preferenceStorage : null,    //firefox提供的preference System,存放默认保存类型等配置信息
        _loggerManager : null,        //日志操作
        _nativeManager : null         //本地客户端相关操作
    };
    Wiz.AUTH_COOKIE_URL = 'http://service.wiz.cn/web';
    Wiz.SERVICE_URL = "http://webclip.openapi.wiz.cn/wizkm";
    Wiz.XMLRPC_URL = Wiz.SERVICE_URL + "/xmlrpc";
    Wiz.POST_DOCUMENT_URL = Wiz.SERVICE_URL + "/a/web/post?";
    Wiz.EXTENSIOD_ID = "wizbrother@wiz.cn";
    Wiz.AUTHENTICATION_NAME = 'wiz_auth';
}

Wiz.init = function (tab) {
    if (!this._clipManager) {
        this._clipManager = new Wiz.ClipManager();
    }
    if (!this._remote) {
        this._remote = new Wiz.Remote();
    }
    if (!this._cookieManager) {
        this._cookieManager = new Wiz.CookieManager();
    }
};
Wiz.getClipManager = function () {
	if (!this._clipManager) {
		this._clipManager = new Wiz.ClipManager();
	}
	return this._clipManager;
};
Wiz.setClipManager = function (clipManager) {
	this._clipManager = clipManager;
};

Wiz.getPreview = function() {
	if (!this._preview) {
		//TODO throw exception?
		this._preview = new Wiz.ContentPreview(content);
	}
	return this._preview;
};
Wiz.setPreview = function (preview) {
	this._preview = preview;
};

Wiz.getRemote = function () {
	if (!this._remote) {
		this._remote = new Wiz.Remote();
	}
	return this._remote;
};

Wiz.getContext = function () {
    if (!this._context) {
        this._context = new Wiz.Context();
    }
    return this._context;
};

Wiz.setContext = function (context) {
    this._context = context;
};

Wiz.getPrefereceStorage = function () {
    if (!this._preferenceStorage) {
        this._preferenceStorage = new Wiz.PrefStorage();
    }
    return this._preferenceStorage;
};

Wiz.setRemote = function (remote) {
	this._remote = remote;
};

Wiz.getAuthCookie = function () {
    var cookies = this.cookieManager.get(Wiz.AUTH_COOKIE_URL, Wiz.AUTHENTICATION_NAME);
    if (cookies && cookies.length > 0) {
        return cookies[0];
    } 
    return null;
};

Wiz.saveAuthCookie = function (value, isRememberMe) {
    if(isRememberMe) {
        Wiz.cookieManager.set(Wiz.AUTH_COOKIE_URL, Wiz.AUTHENTICATION_NAME, value, Wiz.Default.COOKIE_EXPIRE_SEC);
    } else {
        Wiz.cookieManager.set(Wiz.AUTH_COOKIE_URL, Wiz.AUTHENTICATION_NAME, value);
    }
};

Wiz.saveTokenCookie = function (token) {
    Wiz.cookieManager.set(Wiz.AUTH_COOKIE_URL, 'auth-token', token, Wiz.Default.TOKEN_EXPIRE_SEC);
};

Wiz.getTokenCookie = function () {
    var cookie = Wiz.cookieManager.get(Wiz.AUTH_COOKIE_URL, 'auth-token');  
    if (cookie && cookie.length > 0) {
        return cookie[0];
    }
    return null;
};
Wiz.removeTokenCookie = function () {
    var cookie = Wiz.cookieManager.remove(Wiz.AUTH_COOKIE_URL, 'auth-token');  
};

Wiz.saveKbGuidCookie = function (kbGuid) {
    Wiz.cookieManager.set(Wiz.AUTH_COOKIE_URL, 'auth-kbguid', kbGuid, Wiz.Default.TOKEN_EXPIRE_SEC);
};

Wiz.getKbGuidCookie = function () {
    var cookie = Wiz.cookieManager.get(Wiz.AUTH_COOKIE_URL, 'auth-kbguid');  
    if (cookie && cookie.length > 0) {
        return cookie[0];
    }
    return null;
};
Wiz.removeKbGuidCookie = function () {
    var cookie = Wiz.cookieManager.remove(Wiz.AUTH_COOKIE_URL, 'auth-kbguid');  
};

Wiz.removeAuthCookie = function () {
    Wiz.cookieManager.remove(Wiz.AUTH_COOKIE_URL, Wiz.AUTHENTICATION_NAME);
};

Wiz.getCookieManager = function () {
    if (!this._cookieManager) {
        this._cookieManager = new Wiz.CookieManager();
    }
    return this._cookieManager;
};
Wiz.getNotificator = function () {
    if (!this._notificator) {
        this._notificator = new Wiz.ClipNotificator();
    }
    return this._notificator;
};

Wiz.getLoggerManager = function () {
    if (!this._loggerManager) {
        this._loggerManager = new Wiz.LoggerManager();
    }
    return this._loggerManager;
};

Wiz.getNativeManager = function () {
    if (!this._nativeManager) {
        try {
            this._nativeManager = new Wiz.NativeManager();
        } catch (err) {
            Wiz.logger.error('Wiz.getNativeManager() Error: ' + err);
            return null;
        }
    } 
    return this._nativeManager;
};

Wiz.inherit = function (childConstructor, parentClassOrObject, includeConstructorDefs) {
    if (typeof parentClassOrObject === 'function') {
        // Normal Inheritance
        childConstructor.prototype = new parentClassOrObject;
        childConstructor.prototype.constructor = childConstructor;
        childConstructor.prototype.parent = parentClassOrObject.prototype;
        childConstructor.constructor.parent = parentClassOrObject;
    } else {
        // Pure Virtual Inheritance
        childConstructor.prototype = parentClassOrObject;
        childConstructor.prototype.constructor = childConstructor;
        childConstructor.prototype.parent = parentClassOrObject;
        childConstructor.constructor.parent = parentClassOrObject;

    }
    if ( includeConstructorDefs ) {
        for ( var i in parentClassOrObject.prototype.constructor ) {
            if ( i != "parent" && i != "prototype" && parentClassOrObject.constructor[i] != parentClassOrObject.prototype.constructor[ i ]
                && typeof childConstructor.prototype.constructor[ i ] == 'undefined' ) {
                childConstructor.prototype.constructor[ i ] = parentClassOrObject.prototype.constructor[ i ];
            }   
        }
    }
    return childConstructor;
};

Wiz.__defineGetter__("clipManager", Wiz.getClipManager);
Wiz.__defineGetter__("preview", Wiz.getPreview);
Wiz.__defineGetter__("remote", Wiz.getRemote);
Wiz.__defineGetter__("cookieManager", Wiz.getCookieManager);
Wiz.__defineGetter__("context", Wiz.getContext);
Wiz.__defineGetter__("notificator", Wiz.getNotificator);
Wiz.__defineGetter__("prefStorage", Wiz.getPrefereceStorage);
Wiz.__defineGetter__("logger", Wiz.getLoggerManager);
Wiz.__defineGetter__("nativeManager", Wiz.getNativeManager);