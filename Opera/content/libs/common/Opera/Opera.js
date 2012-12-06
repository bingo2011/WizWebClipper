(function(window) {
    'use strict';
    // if (typeof window.Wiz === 'undefined') {
    //     window.Wiz = {};
    //     console.error('could not find Wiz object');
    // }
    var Opera = function () {
            this.addToolbarButton = function() {
                var theButton;
                var id = widget.id;
                var ToolbarUIItemProperties = {
                    title: "Webclipper for Opera",
                    icon: "toolbar18x18.png",
                    popup: {
                        href: "popup.html",
                        width: 520,
                        height: 320
                    }
                }
                theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
                opera.contexts.toolbar.addItem(theButton);
                return theButton;
            };
            this.addContextMenuButton = function(title, cliclHandler) {
                // Check the Context Menu API is supported
                if (opera.contexts.menu) {
                    var menu = opera.contexts.menu;
                    // Create a menu item properties object
                    var itemProps = {
                        title: title,//'Privatize',
                        onclick: cliclHandler
                    }

                    // Create a menu item with the specified properties
                    var item = menu.createItem(itemProps);
                    // Add the menu item to the context menu
                    menu.addItem(item);
                } else {
                    console.error('Context Menu API not supported.');
                }
            };
        };

    Wiz.opera = new Opera();
})(window);