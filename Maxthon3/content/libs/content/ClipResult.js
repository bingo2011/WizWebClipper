function ClipResult() {
	// 'use strict';
	var iframe;

	function removeIFrame() {
	}

	function startClip(_attrs) {
	}


	this.startClip = startClip;
	this.removeIframe = removeIFrame;
}

var clipResult;

// Don't load in frames.
if (window.parent === window) {
	var clipResult = new ClipResult();
}
