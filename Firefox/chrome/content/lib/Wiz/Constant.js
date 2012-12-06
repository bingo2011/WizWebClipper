// 'use strict';
Wiz.IS_WINDOWS = (navigator.platform.indexOf( "Win" ) != -1);
Wiz.SLASH = (Wiz.IS_WINDOWS) ? "\\" : "/";
Wiz.Default = {
	DOC_CATEGORY: "/My Notes/",
	DOC_TITLE: "no title",
	COOKIE_EXPIRE_SEC: 14 * 24 * 60 * 60,
	TOKEN_EXPIRE_SEC: 3 * 60,
	REFRESH_TOKEN_TIME_MS: 4 * 60 * 1000
};

Wiz.Api = {
	ACCOUNT_LOGIN: "accounts.clientLogin",
	ACCOUNT_KEEPALIVE: "accounts.keepAlive",
	ACCOUNT_GETOKEN: "accounts.getToken",
	GET_AllCATEGORIES: "category.getAll",
	GET_ALLTAGS: "tag.getList",
	DOCUMENT_POSTSIMPLE: "document.postSimpleData"
};
Wiz.Pref = {
	NOW_USER: "now_user",
	DEFAULT_CATEGORY: 'default-category',
	DEFAULT_SAVETYPE: 'default-savetype'
};

Wiz.CHARSETMAP = {
	"ar-sa": 'Arabic',

	"eu": 'ANSI',

	"ca": 'ANSI',

	"zh-cn": 'GB2312',

	"zh-tw": 'Chinese-Big 5',

	"cs": 'Eastern European',

	"da": 'ANSI',

	"n": 'ANSI',

	"en-us": 'ANSI',

	"fi": 'ANSI',

	"fr": 'ANSI',

	"de": 'ANSI',

	"e": 'Greek',

	"he": 'Hebrew',

	"hu": 'Eastern European',

	"it": 'ANSI',

	"ja": 'Shift-JIS',

	"ko": 'Johab',

	"no": 'ANSI',

	"p": 'Eastern European',

	"pt": 'ANSI',

	"pt-br": 'ANSI',

	"ru": 'Russian',

	"sk": 'Eastern European',

	"s": 'Eastern European',

	"es": 'ANSI',

	"sv": 'ANSI',

	"tr": 'Turkish'
} 
