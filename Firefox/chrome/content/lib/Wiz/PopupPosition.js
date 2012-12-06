//"use strict";

Wiz.PopupPositioner = function PopupPositioner( anchorId, popupWidth, popupHeight ) {
    this.initialize( anchorId, popupWidth, popupHeight );
};

Wiz.PopupPositioner.prototype._anchor = null;
Wiz.PopupPositioner.prototype._popupWidth = 0;
Wiz.PopupPositioner.prototype._popupHeight = 0;

Wiz.PopupPositioner.prototype.initialize = function( anchorId, popupWidth, popupHeight ) {

   this._anchor = document.getElementById( anchorId );
   this._popupWidth = popupWidth;
   this._popupHeight = popupHeight;
};

Wiz.PopupPositioner.prototype.getPosition = function() {
    var popupLeft = window.innerWidth - this._popupWidth;
    if ( !this._anchor || this._anchor.boxObject.width == 0 ) {
        var navPanelBoxObject = document.getElementById( "navigator-toolbox" ).boxObject;
        return {
            left: window.screenX + popupLeft,
            top: navPanelBoxObject.screenY + navPanelBoxObject.height
        }
    }

    var buttonBoxObject = this._anchor.boxObject;
    var anchorHeight = buttonBoxObject.height;
    var anchorWidth = buttonBoxObject.width;
    var winHeight = screen.height;

    popupLeft = buttonBoxObject.screenX - this._popupWidth + anchorWidth;
    var popupTop = buttonBoxObject.screenY + anchorHeight;

    if ( popupLeft < 0 ) {
        popupLeft = buttonBoxObject.screenX;
    }

    if ( popupTop + this._popupHeight > winHeight ) {
        popupTop = buttonBoxObject.screenY - this._popupHeight - anchorWidth;
    }

    var isTopAlign = true;
    if ( buttonBoxObject.screenY > popupTop ) {
        isTopAlign = false;
    }

    return {
        left : popupLeft,
        top : popupTop,
        width : this._popupWidth,
        height : this._popupHeight,
        isTopAlign : isTopAlign
    }
};