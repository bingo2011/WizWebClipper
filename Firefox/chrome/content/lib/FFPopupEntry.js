// 'use strict';
function wiz_initFFPopup() {
    try { 
    	var params = window.overlay.arguments[0];
    	var FFpopup = new Wiz.FFPopup(params);
    	Wiz.i18n = params.i18n;
    	window.focus();
    	$(window).blur(function () {
    		FFpopup.closePopup();
    	});
    	FFpopup.startPopup();
    } catch (err) {
        Wiz.logger.error('FFpopupEntry.wiz_initFFPopup() Error: ' + err);
    }
}

$(document).ready( function() {
    var initTimeout = 5000;
    var initPeriod = 100;
    var initStartTime = new Date().getTime();

    var initProc = setInterval( function() {
        if ( window.overlay && window.overlayContentContainer ) {
            clearInterval( initProc );
            initProc = null;

            wiz_initFFPopup();
        }
        else if ( initStartTime + initTimeout < new Date().getTime() ) {
            Wiz.logger.error( "FFPopup initialization timeout exceeding" );

            clearInterval( initProc );
            initProc = null;
        }
    }, initPeriod );
} );