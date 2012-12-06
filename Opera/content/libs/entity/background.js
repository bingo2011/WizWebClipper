'use strict';
var CONTEXTMENU_NAME = 'save to wiznote';

if ( !Wiz ) {
    console.error('could not find Wiz object');
}
var toolbarButton;
var handlers = {
    'login': popup_request_login,
    'getCategory': popup_request_getCategory,
    'saveDocument': saveDocument,
    'responsePageInfo': content_request_showClipPage
};

function content_request_showClipPage(info) {
    opera.extension.broadcastMessage({'name': 'showClipPage', 'info': info});
    //显示预览的时，请求加载category
    popup_request_getCategory();
}
/**
 * 初始化保存的user信息，方便popup页面调用
 * TODO：读取option页面信息
 * @return {[type]} [description]
 */
function wiz_initialize_background () {
    //获取保存在localstorage中的user信息
    var userId = Wiz.storageManager.get(Wiz.Default.STORAGE_USERID);
    var authority = Wiz.storageManager.get(Wiz.Default.AUTHORITY);
    if ( authority !== null) {
        Wiz.context.userId = userId;
        Wiz.context.authority = authority;
    }
}

function saveDocument(info) {
    if (info.isNative) {
        // console.debug('saveToNative');
        Wiz.native.saveDocument(info);
    } else {
        // console.debug('saveToServer');
        Wiz.remote.autoLogin(Wiz.remote.postDocument, info);
        opera.extension.broadcastMessage({'name': 'clipResult', 'info': info, 'status': 'sync'});
        // Wiz.remote.postDocument(info);
    }
}

/**
 * 处理来自popup页面的登陆请求
 * @return {[type]} [description]
 */
function popup_request_login(info) {
    Wiz.remote.clientLogin(info.user_id, info.password, info.rememberMe, requestPreview);
}

function messageHandler(event) {
    var data = event.data;
    var requestName = data.name;
    var info = data.info;
    // console.log('background: ' + requestName);
    if (typeof requestName === 'string' && requestName.length > 0) {
        if (handlers[requestName]) {
            handlers[requestName](info);
        }
    }
}

/**
 * popup页面初始化调用方法，需要登陆过
 * @return {[type]} [description]
 */
function popup_request_initialize() {
    requestPreview();
    // Wiz.remote.autoLogin(requestPreview);
}

function popup_request_signOut() {
    Wiz.context.authority = '';
    Wiz.context.token = '';
    Wiz.context.userId = '';
    Wiz.storageManager.remove(Wiz.Default.AUTHORITY);
    Wiz.storageManager.remove(Wiz.Default.STORAGE_USERID);
}

function requestPreview (previewOp, type, info) {
    if (!previewOp) {
        previewOp = 'article';
    }
    opera.extension.broadcastMessage({
        'name': 'preview', 
        'op': previewOp, 
        'type': type, 
        'url': opera.extension.tabs.getSelected().url, 
        'info': info
    });
}

function popup_request_getCategory() {
    var categories = null;
    if (Wiz.native.isInstalled()) {
        categories = Wiz.native.getCategory(Wiz.context.userId);
    } else {
        categories = Wiz.background.getCacheCategories();
    }
    //如果都没有取到，直接向服务器发请求
    if (!categories) {
        Wiz.remote.getAllCategory(Wiz.background.sendCategoryToPopup);
        return;
    }
    Wiz.background.sendCategoryToPopup(categories);
}



function contextMenuClickHandler(event) {
    requestPreview('submit', 'native', null);
}

function request_submit(type, info) {
    requestPreview('submit', type, info);
}

function onLoadHandler() {
    toolbarButton = Wiz.opera.addToolbarButton();
    if (Wiz.native.isInstalled()) {
        Wiz.opera.addContextMenuButton(CONTEXTMENU_NAME, contextMenuClickHandler);
    }
}

/**
 * 监听popup页面关闭，清除预览
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
opera.extension.ondisconnect = function(event) {
    requestPreview('clear');
};

window.addEventListener("load", onLoadHandler, false);
opera.extension.onmessage = messageHandler;
wiz_initialize_background();
