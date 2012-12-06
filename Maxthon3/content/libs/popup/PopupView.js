// 'use strict';
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
		if (!msg) {
			msg = Wiz.Message.get('popup_wating');
		}
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
		$('#create_acount').html(Wiz.Message.get('create_account_link')).bind('click', function(evt) {
			window.open('http://service.wiz.cn/wizkm/a/signup');
		});
	},
	initPopupPage : function () {
		$('#waiting-label').html(Wiz.Message.get('popup_wating'));

		//login page
		$('#user_id_tip').html(Wiz.Message.get('user_id_tip'));
		$('#password_tip').html(Wiz.Message.get('password_tip'));
		$('#keep_password_tip').html(Wiz.Message.get('keep_password_tip'));
		$('#login_button').html('&nbsp;' + Wiz.Message.get('login_msg') + '&nbsp;');

		//note info page
		$('#note_title_tip').html(Wiz.Message.get('note_title_tip'));
		$('#category_tip').html(Wiz.Message.get('category_tip'));
		// $('#tag_tip').html(Wiz.Message.get('tag_tip'));
		// $('#tag_input').html(Wiz.Message.get('tag_input'));
		//submit type
		$('#article').html(Wiz.Message.get('article_save'));
		$('#fullPage').html(Wiz.Message.get('fullpage_save'));
		$('#selection').html(Wiz.Message.get('select_save'));
		$('#url').html(Wiz.Message.get('url_save'));
		$('#native').html(Wiz.Message.get('save_more'));
		//comment area
		$('#comment_tip').html(Wiz.Message.get('comment_tip'));
		$('#comment-info').attr('placeholder', Wiz.Message.get('add_comment'));

		$('#save_to_native').html(Wiz.Message.get('save_to_native'));
		$('#save_to_server').html(Wiz.Message.get('save_to_server'));

		//默认文件夹
		$('#category_info').html('/' + Wiz.Message.get('MyNotes') + '/').attr('location', '/My Notes/');

		PopupView.showCreateAccountDiv();
	}
};