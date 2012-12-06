// "use strict";
var wiznote_doAction = function( popupSrc, clipType ) {
	Wiz.clipManager.startClip( popupSrc, clipType );
}


function initOverlay() {
	var i18n = document.getElementById("wiznote_i18n"); 
	if(i18n) {
		Wiz.i18n.setStringBundle(i18n.stringBundle);
	}
	Wiz.init(content);
	Wiz.remote.autoLogin();
	var menu = document.getElementById("contentAreaContextMenu");
	menu.addEventListener("popupshowing", contextPopupShowing, false);
}

function contextPopupShowing(evt) {
}

window.addEventListener("load", initOverlay, false);

