// 'use strict';
var mainUrl = 'http://service.wiz.cn/web';
window.onload = function() {

	function showByCookies(cookies) {
		if (cookies) {
			var port = sogouExplorer.extension.connect({
				name : 'initRequest'
			});
			port.onMessage.addListener(function (msg) {
				loginControl.autoLogin(cookies);
				clipPageControl.setNativeStatus(msg.hasNative);
				clipPageControl.requestPageStatus();
			});

		} else {
			PopupView.showLogin();
			
			loginControl.initCreateAccountLink();
		}
	}


	function tabLoadedListener() {
		sogouExplorer.windows.getCurrent(function (win) {
			sogouExplorer.tabs.getSelected(win.id, function (tab) {
				if (tab) {
					Cookie.getCookies(cookieName, showByCookies, true);
				} else {
					setTimeout(tabLoadedListener, 1000);
				}
			});
		});
	}

	function wizPopupInitialize() {
		tabLoadedListener();
	}

	function initPopupPage() {
		$('#waiting-label').html(com_wizbrother_Message.get('popup_wating'));

		//login page
		$('#user_id_tip').html(com_wizbrother_Message.get('user_id_tip'));
		$('#password_tip').html(com_wizbrother_Message.get('password_tip'));
		$('#keep_password_tip').html(com_wizbrother_Message.get('keep_password_tip'));
		$('#login_button').html('&nbsp;' + com_wizbrother_Message.get('login_msg') + '&nbsp;');

		//note info page
		$('#note_title_tip').html(com_wizbrother_Message.get('note_title_tip'));
		$('#category_tip').html(com_wizbrother_Message.get('category_tip'));
		// $('#tag_tip').html(com_wizbrother_Message.get('tag_tip'));
		// $('#tag_input').html(com_wizbrother_Message.get('tag_input'));
		//submit type
		$('#article').html(com_wizbrother_Message.get('article_save'));
		$('#fullPage').html(com_wizbrother_Message.get('fullpage_save'));
		$('#selection').html(com_wizbrother_Message.get('select_save'));
		$('#url').html(com_wizbrother_Message.get('url_save'));
		$('#native').html(com_wizbrother_Message.get('save_more'));
		//comment area
		$('#comment_tip').html(com_wizbrother_Message.get('comment_tip'));
		$('#comment-info').attr('placeholder', com_wizbrother_Message.get('add_comment'));

		$('#save_to_native').html(com_wizbrother_Message.get('save_to_native'));
		$('#save_to_server').html(com_wizbrother_Message.get('save_to_server'));

		//默认文件夹
		$('#category_info').html('/' + com_wizbrother_Message.get('MyNotes') + '/').attr('location', '/My Notes/');
	}

	try {
		initPopupPage();
		var clipPageControl = new ClipPageControl();
		var loginControl = new LoginControl();
	} catch (err) {
		alert('initPopupPage Error: ' + err);
	}
	
	//保证popup页面和preview页面同时关闭
	sogouExplorer.extension.connect({
		name : 'popupClosed'
	});

	wizPopupInitialize();
}