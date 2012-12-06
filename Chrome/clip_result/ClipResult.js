/**
 * @author rechie
 */
// 'use strict';
var notificationHeadline = '#notificationHeadline';
var notificationDetails = '#notificationDetails';
var successActions = '#successActions';
var errorActions = '#errorActions';
var successIcon = '#successIcon';
var errorIcon = '#errorIcon';
var activeIcon = '#activeIcon';
var retryClipSpan = '#retryClip';

var clippingMsg = chrome.i18n.getMessage('clipResult_clipping');
var syncMsg = chrome.i18n.getMessage('clipResult_sync');
var successMsg = chrome.i18n.getMessage('clipResult_success');
var errorMsg = chrome.i18n.getMessage('clipResult_error');
var retryClipMsg = chrome.i18n.getMessage('retry_clip_button');

function clear() {
	$(notificationHeadline).empty();
	$(notificationDetails).empty();
	$(successActions).hide();
	$(errorActions).hide();
}

function bindErrorAction(info) {
	$(errorActions).show();
	$(retryClipSpan).html(retryClipMsg);
	$(retryClipSpan).unbind('click');
	$(retryClipSpan).bind('click', function () {retryButtonHandler(info)});
}

function retryButtonHandler(info) {
	console.log('Retry Save')
	chrome.extension.connect({'name' : 'retryClip'}).postMessage(info);
	$(notificationDetails).hide();
	$(errorActions).hide();
}

function showSuccessIcon() {
	$(errorIcon).hide();
	$(activeIcon).hide();
	$(clippingIcon).hide();
	$(successIcon).show();
}

function showErrorIcon() {
	$(successIcon).hide();
	$(activeIcon).hide();
	$(clippingIcon).hide();
	$(errorIcon).show();
}

function showActiveIcon() {
	$(errorIcon).hide();
	$(successIcon).hide();
	$(clippingIcon).hide();
	$(activeIcon).show();
}

function showClippingIcon() {
	$(errorIcon).hide();
	$(successIcon).hide();
	$(activeIcon).hide();
	$(clippingIcon).show();
}

function showSuccess(info) {
	var msg = successMsg + ' : ' + info.title;
	$(notificationHeadline).html(msg);
	showSuccessIcon();
}

function showError(info) {
	var msg = errorMsg + ' : ' + info.title;
	$(notificationHeadline).html(msg);
	$(notificationDetails).html(info.errorMsg);
	showErrorIcon();
	bindErrorAction(info);
}

function showSyncing(info) {
	var msg = syncMsg + ' : ' + info.title;
	$(notificationHeadline).html(msg);
	showActiveIcon();
}

function showClipping(info) {
	var msg = clippingMsg + ' : ' + info.title;
	$(notificationHeadline).html(msg);
	showClippingIcon();

}

function switchNotificationMessageByCmd(cmd, info) {
	console.log('ClipResult.switchNotificationMessageByCmd() cmd=' + cmd + 'title=' + info.title);
	switch(cmd) 
	{
	case 'clip' :
		showClipping(info);
		break;
	case 'sync' :
		showSyncing(info);
		break;
	case 'error' :
		showError(info);
		break;
	case 'saved' :
		showSuccess(info);
		break;
	}
}

function messageHanlder(data, sender, sendResponse) {
	try {
		var cmd = data.name;
		switchNotificationMessageByCmd(cmd, data.info);
	} catch (err) {
		console.error('ClipResult.switchNotificationMessageByCmd() Error : ' + err);
	}
}

Wiz_Browser.onRequest().addListener(messageHanlder);