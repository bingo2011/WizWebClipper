// "use strict";

Wiz.ScriptLoader = {
    _jsLoader : null,

    load : function( scriptUrl ) {
        try {
            if ( scriptUrl instanceof Array ) {
                var loader = this.jsLoader;
                for ( var i = 0; i < scriptUrl.length; ++i ) {
                    loader.loadSubScript( scriptUrl[ i ] );
                }
            }
            else if ( typeof scriptUrl == "string" ) {
                this.jsLoader.loadSubScript( scriptUrl );
            }
        }
        catch ( e ) {
            alert( "ScriptLoader.load() failed " + e + " on " + scriptUrl[ i ] );
        }
    },

    getJSLoader : function() {
        if ( !this._jsLoader ) {
            this._jsLoader = Components.classes[ "@mozilla.org/moz/jssubscript-loader;1" ].getService( Components.interfaces.mozIJSSubScriptLoader );
        }

        return this._jsLoader;
    }
};

Wiz.ScriptLoader.__defineGetter__( "jsLoader", Wiz.ScriptLoader.getJSLoader );
