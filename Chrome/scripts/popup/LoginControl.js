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
		var loginParam = new Object();
		loginParam.client_type = 'webclip_chrome';
		loginParam.api_version = 3;
		loginParam.user_id = info.substring(0, split_count);
		loginParam.password = info.substring(split_count + 1);
		login(loginParam);
	}

	function login(loginParam) {
		var port = chrome.extension.connect({
			name : 'login'
		});
		port.postMessage(loginParam);
		port.onMessage.addListener(function(msg) {
			if (msg == true) {
				localStorage.clear()

				var value = loginParam.user_id + '*' + loginParam.password;
				//cookie保存时间  (秒)
				var expiredays;
				if (keep_passoword.checked) {
					expiredays = cookieExpiredays;
					$('#loginoff_div').hide();
				}
				if (!isAutoLogin) {
					//自动登陆不需要再次设置token
					Cookie.setCookies(cookieUrl, cookieName, value, expiredays);
				}
				localStorage['wiz-clip-auth'] = loginParam.user_id;
			}
			//返回错误
			else {
				if (msg == false) {
					msg = chrome.i18n.getMessage('network_wrong');
				}
				PopupView.showLoginError(msg);
			}
		});
	}

	function doLogin() {
		var loginingMsg = chrome.i18n.getMessage('logining');
		PopupView.showWaiting(loginingMsg);

		var loginParam = new Object();
		loginParam.client_type = 'webclip_chrome';
		loginParam.api_version = 3;
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
			$('#userid_error_tip').html(chrome.i18n.getMessage('userid_error')).show(100);
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
			$('#password_error_tip').html(chrome.i18n.getMessage('password_error')).show(100);
			return false;
		}
		return true;

	}

	function initCreateAccountLink() {
		$('#create_acount').html(chrome.i18n.getMessage('create_account_link')).bind('click', function(evt) {
			window.open('http://service.wiz.cn/wizkm/a/signup');
		});
	}
	this.initCreateAccountLink = initCreateAccountLink;
	this.autoLogin = autoLogin;
}