Wiz.WindowManager = (function () {
	var panelName = 'wiz_clipper_panel';			//修改def.json中action.panel.name时，要相应修改该值
    return {
		close: function () {
			var action = Wiz.maxthon.getActionByName(panelName);
		    action.hide();
		},
		getState: function () {
			var action = Wiz.maxthon.getActionByName(panelName);
			return action.state;
		},
		getType: function () {
			var action = Wiz.maxthon.getActionByName(panelName);
			return action.type;
		}
    }
})()