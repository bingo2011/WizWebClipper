'use strict';
var com_wizbrother_Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	// public method for encoding
	encode : function(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = com_wizbrother_Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},
	// private method for UTF-8 encoding
	_utf8_encode : function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}
}


var com_wizbrother_ClientClipper = function () {
	var SAVE_CONTENT = 'save_content',
		SAVE_FULLPAGE = 'save_all',
		SAVE_SELECTION = 'save_sel',
		SAVE_URL = 'save_url';

	function wiz_base64Encode(str) {
		if (!str || str.length < 1) {
			return "";
		}
		var base64str = com_wizbrother_Base64.encode(str);
		return base64str;
	}

	function wiz_getFrameNodes(win) {
		var doc = win.document;
		if (doc == null)
			return null;
		//
		var frameNodes = doc.getElementsByTagName("iframe");
		if (frameNodes == null || frameNodes.length == 0) {
			frameNodes = doc.getElementsByTagName("frame");
			if (frameNodes == null || frameNodes.length == 0) {
				return null;
			}
		}
		//
		return frameNodes;
	}

	var wiz_g_frameNameIndex = 0;

	function wiz_prepareFrameNodes(win) {
		var frameNodes = wiz_getFrameNodes(win);
		if (frameNodes == null)
			return;
		for (var i = 0; i < frameNodes.length; i++) {
			var node = frameNodes[i];
			node.setAttribute("wiz_ext_name", "Frame_" + wiz_g_frameNameIndex);
			wiz_g_frameNameIndex++;
		}
	}

	function wiz_prepareFrames(win) {
		if (win == null)
			return;
		//
		var doc = win.document;
		if (doc == null) {
			return;
		}
		//
		wiz_prepareFrameNodes(win);
		//
		var frames = win.frames;
		if (frames == null)
			return;
		//
		for (var i = 0; i < frames.length; i++) {
			var frame = frames[i];
			//
			wiz_prepareFrames(frame);
		}
	}

	function wiz_prepareAllFrames(win) {
		wiz_g_frameNameIndex = 0;
		wiz_prepareFrames(win);
	}

	var wiz_g_frameFilesIndex = 0;
	function wiz_collectFrames(win) {
		var params = "";
		//
		if (win == null) {
			return "";
		}
		var doc = win.document;
		if (doc == null) {
			return "";
		}

		var frameNodes = wiz_getFrameNodes(win);

		if (frameNodes == null)
			return "";

		for (var i = 0; i < frameNodes.length; i++) {
			var frameNode = frameNodes[i];
			//
			if (frameNode != null) {
				var id = frameNode.getAttribute("id");
				var name = frameNode.getAttribute("name");

				var extName = frameNode.getAttribute("wiz_ext_name");
				//
				if (id == null)
					id = "";
				if (name == null)
					name = "";
				if (extName == null)
					extName = "";
				//
				var frameDoc = frameNode.contentDocument;

				if (frameDoc != null) {
					params += wiz_g_frameFilesIndex + "_FrameURL='" + wiz_base64Encode(frameDoc.URL) + "' ";
					params += wiz_g_frameFilesIndex + "_FrameName='" + name + "' ";
					params += wiz_g_frameFilesIndex + "_FrameID='" + id + "' ";
					params += wiz_g_frameFilesIndex + "_FrameExtName='" + extName + "' ";
					var source_html = wiz_base64Encode(frameDoc.documentElement.innerHTML);
					params += wiz_g_frameFilesIndex + "_FrameHtml='" + source_html + "' ";
					wiz_g_frameFilesIndex++;
				}
			}
		}

		var frames = win.frames;
		for (var i = 0; i < frames.length; i++) {
			var frame = frames[i];
			params += wiz_collectFrames(frame);
		}
		return params;
	}

	function wiz_collectAllFrames(win) {//
		var params = "";
		if ( typeof (win) == "object") {
			var source_url = wiz_base64Encode(win.location.href);
			var source_title = wiz_base64Encode(win.document.title);
			var source_html = "";

			wiz_prepareAllFrames(win);
			//
			var source_html = wiz_base64Encode(win.document.documentElement.innerHTML);
			params = "param-location='" + source_url + "' ";
			params += "param-title='" + source_title + "' ";

			wiz_g_frameFilesIndex = 0;

			params += wiz_g_frameFilesIndex + "_FrameURL='" + source_url + "' ";
			params += wiz_g_frameFilesIndex + "_FrameHtml='" + source_html + "' ";

			wiz_g_frameFilesIndex++;
			params += wiz_collectFrames(win);
			var frame_fcount = wiz_g_frameFilesIndex;
			params = "param-fcount='" + frame_fcount + "' " + params;
		}
		return params;
	}

	function wiz_getActiveFrame(win) {
		if (win == null)
			return null;
		var activeFrame = null;
		var frames = win.frames;
		for (var i = 0; i < frames.length; i++) {
			var frame = frames[i];
			if (frame != null && frame.document != null) {
				var seltxt = frame.getSelection();
				if (seltxt != null && seltxt.toString() != "") {
					activeFrame = frame;
					//
				}
			}
			if (activeFrame != null)
				return activeFrame;
			activeFrame = wiz_getActiveFrame(frame);
			//
			if (activeFrame != null)
				return activeFrame;
		}
		return null;
	}

	function wiz_getSelected(win, isNative) {
		var params = "";
		if ( typeof (win) == "object") {
			var source_url = wiz_base64Encode(win.location.href);
			var source_html = "";
			var frame_url = source_url;
			//var winsel = win.getSelection();
			var winsel = com_wizbrother_contentPreview.getArticleElement();
			if (winsel == null || winsel.toString() == "") {
				var activeFrame = wiz_getActiveFrame(win);
				if (activeFrame != null) {
					winsel = activeFrame.getSelection();
					frame_url = wiz_base64Encode(activeFrame.location.href);
				}
			}
			if (winsel == null || winsel == "") {
				winsel = win.getSelection().toString();
			}
			if (winsel == null || winsel == "") {
				params = "";
				return params;
			} else {
				//var docFragment = winsel.getRangeAt(0).cloneContents();
				//var docFragment = winsel.innerHTML;
				//var myp = window.document.createElement("<div>" + docFragment + "</Div>");
				var source_html = (winsel.innerHTML) ? (winsel.innerHTML) : winsel;
				if (source_html == null)
					source_html = "";
				if (isNative === true) {
					//如果是调用本地客户端保存，调用base64处理
					source_html = wiz_base64Encode(source_html);
					var localParams = params +  "param-surl='" + frame_url + "' ";
					localParams += "param-shtml='" + source_html + "' ";
					params = localParams;
				} else {
					var serverParams = source_html;
					params = serverParams;
				}
			}
		}
		return params;
	}



	function launchClientClipperArticle(info) {
		var params = wiz_collectAllFrames(window);
		if (info.isNative) {
			params += wiz_getSelected(window, info.isNative);
		} else {
			params = wiz_getSelected(window, info.isNative);
		}
		info.params = params;
		info.cmd = SAVE_CONTENT;
		requestSaveDoc(info);
	}

	function launchClientClipperFullPage(info) {
		var body = getFullpageHTML();
		if (info.isNative) {
			var params = wiz_collectAllFrames(window) + formatParams(info.url, body);
			info.params = params;
		} else {
			info.params = body;
		}
		info.cmd = SAVE_FULLPAGE;
		requestSaveDoc(info);
	}

	function launchClientClipperSelection(info) {
		var body = getSelectedHTML();
		if (info.isNative) {
			var params = wiz_collectAllFrames(window) + formatParams(info.url, body);
			info.params = params;
		} else {
			info.params = body;
		}
		info.cmd = SAVE_SELECTION;
		requestSaveDoc(info);
	}

	function launchClientClipperUrl(info) {
		var body = '<a href="' + window.location.href + '">' + window.location.href + '</a>';
		if (info.isNative) {
			var params = wiz_collectAllFrames(window)  + formatParams(info.url, body); 
			info.params = params;
		} else {
			info.params = body;
		}
		info.cmd = SAVE_URL;
		requestSaveDoc(info);
	}

	function formatParams(url, source_html) {
		if (!source_html) {
			return "";
		}
		var frame_url = wiz_base64Encode(url);
		source_html = wiz_base64Encode(source_html);
		var params = "param-surl='" + frame_url + "' ";
		params += "param-shtml='" + source_html + "' ";
		return params;
	}

	/**
	 * 请求调用本地客户端保存
	 * @param  {[type]} info [description]
	 * @return {[type]}      [description]
	 */
	function launchNativeClipper(info) {
		var isNative = true;
		var params = wiz_collectAllFrames(window);
		var selectHTML = getSelectedHTML();
		params = params + formatParams(info.url, selectHTML); 
		info.isNative = isNative;
		info.params = params;
		requestSaveDoc(info, true);
	}

	function getFullpageHTML() {
		var base = "<base href='" + window.location.protocol + "//" + window.location.host + "'/>";
		var page_content = document.getElementsByTagName("html")[0];
		page_content = $(page_content).clone().find("script").remove().end().html();
		var index = page_content.indexOf("<head>");
		var fullpage = page_content.substring(0, index + 6) + base + page_content.substring(index + 6);
		return fullpage;
	}

	function getSelectedHTML() {
		var selection = document.getSelection();
		if (selection.rangeCount > 0) {
			var range = selection.getRangeAt(0);
			var html = range.commonAncestorContainer.ownerDocument.createElement("div");
			html.appendChild(range.cloneContents());
			return $(html).html();
		} else
			return "";
	}

	/**
	 * 保存到本地客户端前需要做的相关处理
	 * @param {[type]} info   [description]
	 */
	function addExtraParams(info) {
		try {
			var comment = (info.comment) ? ('<div>' + info.comment.replace(/\n/gi, '<br />') + '</div>') : '',
			params = info.params + ' save-command=' + info.cmd + ' userid="' + info.userid
				+ '" title="' + wiz_base64Encode(info.title) 
				+ '" location="' + wiz_base64Encode(info.category) 
				+ '" comment="' + wiz_base64Encode(comment) + '"';
			return params;
		} catch (err) {
			console.warn('ClipPageControl.addExtraParams() Error : ' + err);		
		}
	}

	function requestSaveDoc(info, isSaveMore) {
		if (!info.isNative) {
			com_wizbrother_loader.startClip();
		} else if(!isSaveMore){
			info.params = addExtraParams(info);
		}

		setTimeout(function(){
			sogouExplorer.extension.connect({"name" : "saveDocument"}).postMessage(info);
		}, 300);
	}


	this.launchClientClipperArticle = launchClientClipperArticle;
	this.launchClientClipperUrl = launchClientClipperUrl;
	this.launchClientClipperSelection = launchClientClipperSelection;
	this.launchClientClipperFullPage = launchClientClipperFullPage;
	this.launchNativeClipper = launchNativeClipper;
}

var com_wizbrother_clipper = new com_wizbrother_ClientClipper();