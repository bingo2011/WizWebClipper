// 'use strict';
Wiz.Constant = {
	Default : {
		DOC_CATEGORY: '/My Notes/',
		DOC_TITLE: 'no title',
		COOKIE_EXPIRE_SEC: 14 * 24 * 60 * 60,
		TOKEN_EXPIRE_SEC: 3 * 60,
		REFRESH_TOKEN_TIME_MS: 4 * 60 * 1000,
		AUTH_COOKIE: 'wiznote_auth',
		XMLURL : 'http://service.wiz.cn/wizkm/xmlrpc',
		COOKIEURL : 'http://service.wiz.cn/web',
		COOKIENAME : 'wiz-clip-auth',
		COOKIE_CATEGORY: 'wiz-all-category',
		COOKIE_CATEGORY_TIME: 'wiz-category-stored-time',
		PREVIEW_OVER_TIME_MS: 5000						//30秒超时
	},

	LOGIN_PARAMS: {
		CLIENT_TYPE: 'webclip_maxthon3',
		API_VERSION: 3
	},

	Api : {
		ACCOUNT_LOGIN: 'accounts.clientLogin',
		ACCOUNT_KEEPALIVE: 'accounts.keepAlive',
		ACCOUNT_GETOKEN: 'accounts.getToken',
		GET_AllCATEGORIES: 'category.getAll',
		GET_ALLTAGS: 'tag.getList',
		DOCUMENT_POSTSIMPLE: 'document.postSimpleData'
	},
	ListenType : {
		SERVICE: 'wiz_service',
		CONTENT: 'wiz_content',
		POPUP: 'wiz_popup'
	}
}