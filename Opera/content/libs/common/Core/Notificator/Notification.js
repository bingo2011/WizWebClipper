'use strict';
Wiz.Notification = function () {
	this.__defineGetter__('notifications', this.getNotification);
};

// Wiz.Notification.clippingMsg = Wiz.Message.get('clipResult_clipping');
// Wiz.Notification.syncMsg = Wiz.Message.get('clipResult_sync');
// Wiz.Notification.successMsg = Wiz.Message.get('clipResult_success');
// Wiz.Notification.errorMsg = Wiz.Message.get('clipResult_error');
// Wiz.Notification.retryClipMsg = Wiz.Message.get('retry_clip_button');
Wiz.Notification.notificationList = [];

Wiz.Notification.prototype._notifications = null;
Wiz.Notification.prototype.isAllowed = false;				//用户是否允许使用notification功能

Wiz.Notification.prototype.getNotification = function () {
	if (window.webkitNotifications) {
		if (this._notifications === null) {
			this._notifications = window.webkitNotifications;
		}
	} else {
		//TODO 
		console.log('can not use window.webkitNotifications, your browser is not support for html5');
	}
	return this._notifications;
};

Wiz.Notification.prototype.showClipping = function (docTitle) {
	this.showNotification(Wiz.Notification.clippingMsg, docTitle, false);
};

Wiz.Notification.prototype.showError = function (docTitle) {

	this.showNotification(Wiz.Notification.errorMsg, docTitle, true);
};

Wiz.Notification.prototype.showSuccess = function (docTitle) {
	this.showNotification(Wiz.Notification.successMsg, docTitle, false);
};

Wiz.Notification.prototype.showSync = function (docTitle) {
	this.showNotification(Wiz.Notification.syncMsg, docTitle, false);
};

Wiz.Notification.prototype.showNotification = function (title, body, isAutoHide) {
	if (this.checkPermission) {
		var list = Wiz.Notification.notificationList;
		if (list && list.length > 0) {
			for (var index = 0, length = list.length; index < length; index++) {
				Wiz.Notification.notificationList[index].cancel();
			}
		}

		var notification = this.notifications.createNotification('images/message.jpg', title, body);
		notification.tag = 'wiz_notification';
		if (isAutoHide === true) {
	    	notification.ondisplay = function() { setTimeout('notification.cancel()', 3000); }    
	    }
	    Wiz.Notification.notificationList.push(notification);
	    notification.show();
	}
};

/**
 * 用户是否已经允许使用web notification
 * @return {[boolean]} []
 */
Wiz.Notification.prototype.checkPermission = function () {
	var permissionInt = this.notifications.checkPermission();
	var permissionBool = false;
	if (permission === 1) {
		this.notification.requestPermission();
	} else if (permission === 0) {
		permissionBool = true;
	} else {      
	    console.log('Permission has been denied.');
	}   
	return returnPermission;
};