/**
 * @author rechie
 */
// 'use strict';
var ztreeControl = new ZtreeController();
function LoginControl() {

	var isAutoLogin = false;
	//add click listener to login button
	$('#login_button').bind('click', loginSubmit);

	$('#user_id').blur(checkEmail);
	$('#password').blur(checkPassword);

	/**
	 *自动登陆，使用cookies
	 */
	function autoLogin(cookie) {
		isAutoLogin = true;
		$('#waiting').show();

		var info = cookie.value;
		var split_count = info.indexOf('*md5');
		var loginParam = Wiz.Constant.LOGIN_PARAMS;
		loginParam.user_id = info.substring(0, split_count);
		loginParam.password = info.substring(split_count + 1);
		login(loginParam);
	}

	function login(loginParam) {
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.SERVICE, {'name': 'login', 'params': loginParam});
	}

	function doLogin() {
		var loginingMsg = Wiz.Message.get('logining');
		PopupView.showWaiting(loginingMsg);

		var loginParam = Wiz.Constant.LOGIN_PARAMS;
		loginParam.user_id = user_id.value;
		loginParam.password = 'md5.' + hex_md5(password.value);
		login(loginParam);
	}

	/**
	 * 点击登陆按钮触发事件
	 */
	function loginSubmit() {
		if (checkEmail() && checkPassword()) {
			doLogin();
		}
	}

	function checkEmail() {
		$('#userid_error_tip').hide();
		var email = $('#user_id').val();
		var valid = verifyEmail(email);
		if (!valid) {
			$('#userid_error_tip').html(Wiz.Message.get('userid_error')).show(100);
		}
		return valid;

	}

	function verifyEmail(str_email) {
		if (str_email && str_email.trim().length > 1) {
			return true;
		}
		return false;
	}

	function checkPassword() {
		$('#password_error_tip').hide();
		var password = $('#password').val();
		if (password.trim().length < 1) {
			$('#password_error_tip').html(Wiz.Message.get('password_error')).show(100);
			return false;
		}
		return true;
	}
	this.autoLogin = autoLogin;
}