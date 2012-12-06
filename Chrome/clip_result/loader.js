function ClipResult() {
	// 'use strict';
	var iframe;

	function removeIFrame() {
		iframe = document.querySelector("#wizClipperResult");
		if (iframe) {
			try {
				iframe.parentNode.removeChild(iframe);
			} catch (e) {
				log.log("couldn't remove clip result iframe.");
			}
		}
		document.body.removeEventListener("mousedown");
	}

	function startClip(_attrs) {
		removeIFrame();
		iframe = document.createElement("iframe");
		iframe.src = chrome.extension.getURL("clip_result/clip_result.html");
		iframe.id = "wizClipperResult";
		iframe.name = "wizClipperResult";
		try {
			if (document.body.nodeName.toLowerCase() == "frameset") {
				document.body.parentNode.insertBefore(iframe, null);
			} else {
				document.body.insertBefore(iframe, null);
			}
			document.body.addEventListener("mousedown", removeIFrame);
		} catch (e) {
			console.log("Couldn't insert related notes iframe, got error: " + JSON.stringify(e));
		}
	}


	this.startClip = startClip;
	this.removeIframe = removeIFrame;
}

var clipResult;

// Don't load in frames.
if (window.parent === window) {
	var clipResult = new ClipResult();
}
