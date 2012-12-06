/**
 * @author rechie
 */
// 'use strict';
var com_wizbrother_ClipResult = function () {
	var notificationHeadline = '#notificationHeadline';
	var notificationDetails = '#notificationDetails';
	var successActions = '#successActions';
	var errorActions = '#errorActions';
	var successIcon = '#successIcon';
	var errorIcon = '#errorIcon';
	var activeIcon = '#activeIcon';
	var retryClipSpan = '#retryClip';

	var clippingMsg = com_wizbrother_Message.get('clipResult_clipping');
	var syncMsg = com_wizbrother_Message.get('clipResult_sync');
	var successMsg = com_wizbrother_Message.get('clipResult_success');
	var errorMsg = com_wizbrother_Message.get('clipResult_error');
	var retryClipMsg = com_wizbrother_Message.get('retry_clip_button');

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
		sogouExplorer.extension.connect({'name' : 'retryClip'}).postMessage(info);
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

	this.showClipping = showClipping;
	this.showSyncing = showSyncing;
	this.showError = showError;
	this.showSuccess = showSuccess;

}