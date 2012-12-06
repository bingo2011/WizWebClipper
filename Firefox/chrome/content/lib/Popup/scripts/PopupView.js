// 'use strict';
Wiz.PopupView = {
	changeSubmitDisplayByType : function () 
	{
		var type = $('#submit-type').val();
		$('#note_submit').text(type);
	},
	showCategoryTreeFromLoading : function (animate_time_ms) 
	{
		$('#category_loading').hide();
		$('#ztree_container').show(animate_time_ms);
	},
	showCategoryLoading : function (msg)
	{
		$('#category_loading').show();
		$('#category_loading label').text(msg);
	},
	hideCategoryLoading : function()
	{
		$('#category_loading').hide();
	},
	showClipFailure : function (msg)
	{
		$('#waiting_div').hide();
		$('#errorpage_tip label').text(msg);
		$('#errorpage_tip').show();
	},
	showLoginError : function (msg)
	{
		$('#wiz_login').show();
		$('#wiz_clip_detail').hide();
		$('#div_error_validator').text(msg);
		$('#waiting').hide();
	},
	showWaiting : function (msg)
	{	
		$('#waiting').show();
		$('#waiting-label').text(msg);
		$('#wiz_login').hide();
		$('#wiz_clip_detail').hide();
	},
	showLogin : function ()
	{
		$("#waiting").hide();
		$("#wiz_clip_detail").hide();
		$("#wiz_login").show();
	},
	showNotePage : function ()
	{
		$("#waiting").hide();
		$("#wiz_login").hide();
		$("#wiz_clip_detail").show();
	},
	hideCategoryTreeAfterSelect : function (display, delay_ms)
	{
		$("#category_info").text(display);
		$("#ztree_container").hide(delay_ms);
	},
	hideCreateDiv : function () {
		$('#loginoff_div').hide();
	},
	localizePopup : function () {
		$('#waiting-label').text(Wiz.i18n.getMessage('popup_wating'));

		//login page
		$('#user_id_tip').text(Wiz.i18n.getMessage('user_id_tip'));
		$('#password_tip').text(Wiz.i18n.getMessage('password_tip'));
		$('#keep_password_tip').text(Wiz.i18n.getMessage('keep_password_tip'));
		$('#login_button').text(' ' + Wiz.i18n.getMessage('login_msg') + ' ');

		//note info page
		$('#note_title_tip').text(Wiz.i18n.getMessage('note_title_tip'));
		$('#category_tip').text(Wiz.i18n.getMessage('category_tip'));
		//submit type
		$('#article').text(Wiz.i18n.getMessage('article_save'));
		$('#fullPage').text(Wiz.i18n.getMessage('fullpage_save'));
		$('#selection').text(Wiz.i18n.getMessage('select_save'));
		$('#url').text(Wiz.i18n.getMessage('url_save'));
		// $('#native').text(Wiz.i18n.getMessage('save_more'));
		//comment area
		$('#comment_tip').text(Wiz.i18n.getMessage('comment_tip'));
		$('#comment-info').attr('placeholder', Wiz.i18n.getMessage('add_comment'));
		$('#save_to_native').text(Wiz.i18n.getMessage('save_to_native'));
		$('#save_to_server').text(Wiz.i18n.getMessage('save_to_server'));

		//默认文件夹
		$('#category_info').text('/' + Wiz.i18n.getMessage('MyNotes') + '/').attr('location', '/My Notes/');
	},
	setPopupHeight : function (height_px) {
        var frame = window.overlay.document.getElementById( "popupContent" );
        if ( frame ) {
            frame.style.height = (height_px + 10) + "px";
            frame.style.width = (frame.style.width + 10) + "px";
        }
        window.sizeToContent();
        window.overlay.sizeToContent();
	},
	setDocTitle : function (title) {
		$('#wiz_note_title').val(title);
	}
};