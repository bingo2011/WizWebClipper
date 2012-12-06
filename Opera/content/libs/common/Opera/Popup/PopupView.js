'use strict';
var PopupView = {
	changeSubmitDisplayByType : function () {
		var type = $('#submit-type').val();
		$('#note_submit').html(type);
	},
	showCategoryTreeFromLoading : function (animate_time_ms) {
		$('#category_loading').hide();
		$('#ztree_container').show(animate_time_ms);
	},
	showCategoryLoading : function (msg) {
		$('#category_loading').show();
		$('#category_loading label').html(msg);
	},
	hideCategoryLoading : function () {
		$('#category_loading').hide();
	},

	showClipPage : function () {
		$('#wiz_clip_detail').show();
		$('#waiting').hide();
		$('#wiz_login').hide();
	},
	showClipFailure : function (msg) {
		$('#waiting_div').hide();
		$('#errorpage_tip label').html(msg);
		$('#errorpage_tip').show();
	},
	showLoginError : function (msg) {
		$('#wiz_login').show();
		$('#wiz_clip_detail').hide();
		$('#div_error_validator').html(msg);
		$('#waiting').hide();

		PopupView.showLogoffDiv();
	},
	showWaiting : function (msg) {	
		$('#waiting').show();
		$('#waiting-label').html(msg);
		$('#wiz_login').hide();
		$('#wiz_clip_detail').hide();
	},
	showLogin : function () {
		$("#waiting").hide();
		$("#wiz_login").show();
		$("#wiz_clip_detail").hide();

		PopupView.showLogoffDiv();
	},
	showClipStatus : function () {
		$('#clip_result').show();
		$('#waiting').hide();
		$('#waiting-label').hide();
		$('#wiz_login').hide();
		$('#wiz_clip_detail').hide();
	},
	hideCategoryTreeAfterSelect : function (display, delay_ms) {
		$("#category_info").html(display);
		$("#ztree_container").hide(delay_ms);
	},
	hideWaiting : function () {
		$('#waiting').hide();
	},
	hideLoginDiv : function () {
		$('#login_div').hide();
	},
	hideLogoffDiv: function () {
		$('#loginoff_div').hide();
	},
	showLoginDiv: function () {
		$('#loginoff_div').hide();
		$('#login_div').show();
	},
	showLogoffDiv: function () {
		$('#loginoff_div').show();
		$('#login_div').hide();
	},
	showCreateAccountDiv: function () {
		$('#create_acount').html(operaI18N.getMessage('create_account_link')).show().bind('click', function(evt) {
			window.open('http://service.wiz.cn/wizkm/a/signup');
		});
	},
	initPopupPage : function () {
		$('#waiting-label').html(operaI18N.getMessage('popup_wating'));

		//login page
		$('#user_id_tip').html(operaI18N.getMessage('user_id_tip'));
		$('#password_tip').html(operaI18N.getMessage('password_tip'));
		$('#keep_password_tip').html(operaI18N.getMessage('keep_password_tip'));
		$('#login_button').html('&nbsp;' + operaI18N.getMessage('login_msg') + '&nbsp;');

		//note info page
		$('#note_title_tip').html(operaI18N.getMessage('note_title_tip'));
		$('#category_tip').html(operaI18N.getMessage('category_tip'));
		//submit type
		$('#article').html(operaI18N.getMessage('article_save'));
		$('#fullPage').html(operaI18N.getMessage('fullpage_save'));
		$('#selection').html(operaI18N.getMessage('select_save'));
		$('#url').html(operaI18N.getMessage('url_save'));
		$('#native').html(operaI18N.getMessage('save_more'));
		//comment area
		$('#comment_tip').html(operaI18N.getMessage('comment_tip'));
		$('#comment-info').attr('placeholder', operaI18N.getMessage('add_comment'));

		$('#save_to_native').html(operaI18N.getMessage('save_to_native'));
		$('#save_to_server').html(operaI18N.getMessage('save_to_server'));

		//默认文件夹
		$('#category_info').html('/' + operaI18N.getMessage('MyNotes') + '/').attr('location', '/My Notes/');
	
		PopupView.showCreateAccountDiv();
	},
	setTitle : function (title) {
		$('#wiz_note_title').val(title);
	},
	resize : function (operaPopupObj, width, height) {
		try {
			if (!operaPopupObj) {
				return;
			}
			if (width) {
				operaPopupObj.width = width;
			}
			if (height) {
				operaPopupObj.height = height;
			}
		} catch (err) {
			console.error('popupEntity.resize() Error: ' + err);
		}
	},
	close : function () {
		window.close();
	}
};