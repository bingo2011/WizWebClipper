/**
 * @author rechie
 */
// 'use strict';
Wiz.LoginControl = function (popup) {
	this._popup = popup;
	this.initialize();
};

Wiz.LoginControl.prototype._remote = null;

Wiz.LoginControl.prototype.initialize = function () {
	this._remote = this._popup.remote;
	this.bindForm();
	this.initCreateAccountLink();
};

Wiz.LoginControl.prototype.bindForm = function () {
	$('#login_button').click($.proxy(this.loginSubmit, this));
	$('#user_id').blur($.proxy(this.checkEmail, this));
	$('#password').blur($.proxy(this.checkPassword, this));
};

Wiz.LoginControl.prototype.autoLogin = function (cookie) {
	$('#waiting').show();

	var info = cookie.value,
		split_count = info.indexOf('*md5'),
		user_id = info.substring(0, split_count),
		password = info.substring(split_count + 1);
	this.login(user_id, password, true, $.proxy(this.onLoginSuccess, this), $.proxy(this.onLoginError, this));
};

Wiz.LoginControl.prototype.login = function (user_id, password, isRememberMe, onSuccess, onError) {
	this._remote.clientLogin(user_id, password, isRememberMe, onSuccess, onError);
};

Wiz.LoginControl.prototype.doLogin = function () {
	var loginingMsg = Wiz.i18n.getMessage('logining');
	Wiz.PopupView.showWaiting(loginingMsg);

	var user_id = $('#user_id').val(),
		password = 'md5.' + hex_md5($('#password').val()),
		isRememberMe = $('#keep_passoword').attr('checked');
	this.login(user_id, password, isRememberMe, $.proxy(this.onLoginSuccess, this), $.proxy(this.onLoginError, this));
};

Wiz.LoginControl.prototype.loginSubmit = function () {
	if (this.checkEmail() && this.checkPassword()) {
		this.doLogin();
	}
};

Wiz.LoginControl.prototype.checkEmail = function () {
	$('#userid_error_tip').hide();
	var email = $('#user_id').val(),
		valid = this.verifyEmail(email);
	if (!valid) {
		$('#userid_error_tip').text(Wiz.i18n.getMessage('userid_error')).show(100);
	}
	return valid;

};

Wiz.LoginControl.prototype.verifyEmail = function (str_email) {
	var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
	if (myreg.test(str_email)) {
		return true;
	}
	return false;
};

Wiz.LoginControl.prototype.checkPassword = function () {
	$('#password_error_tip').hide();
	var password = $('#password').val();
	if (password.trim().length < 1) {
		$('#password_error_tip').text(Wiz.i18n.getMessage('password_error')).show(100);
		return false;
	}
	return true;
};

Wiz.LoginControl.prototype.initCreateAccountLink = function () {
	var createAccount = $('#create_acount');
	createAccount.text(Wiz.i18n.getMessage('create_account_link'));
	createAccount.show();
	createAccount.bind('click', function (evt) {
		window.open('http://service.wiz.cn/wizkm/a/signup');
	});
};

Wiz.LoginControl.prototype.onLoginSuccess = function (respJson) {
	this._popup.showAndInitNotePage();
};

Wiz.LoginControl.prototype.onLoginError = function (err) {
	Wiz.PopupView.showLoginError(err);
};
