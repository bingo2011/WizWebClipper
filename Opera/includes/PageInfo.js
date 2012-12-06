function Wiz_PageInfo(Node) {
	"use strict";

	// This is a map of hostnames (for hostnames that begin with 'www.', the 'www.' will be stripped off first, so don't
	// include it in your lookup string) to CSS selectors. When we try and locate an article in a page, we'll see if we
	// can find the doamin for the page in this list, and if so, we'll try and find an element that matches the given
	// selector. If no element is returned, we'll fall back to the heuristic approach.
	var specialCases = {
		"penny-arcade.com" : "div.contentArea > div.comic > img",
		"aspicyperspective.com" : "div.entry-content",
		"thewirecutter.com" : "div#content",
		"katespade.com" : "div#pdpMain",
		"threadless.com" : "section.product_section",
		"yelp.com" : "div#bizBox",
		"flickr.com" : "div#photo",
		"instagr.am" : "div.stage > div.stage-inner",
		"stackoverflow.com" : "div#mainbar",
		"makeprojects.com" : "div#guideMain",
		"cookpad.com" : "div#main",
		"imgur.com" : "div.image",
		"smittenkitchen.com" : "div.entry",
		"allrecipes.com" : "div#content-wrapper",
		"qwantz.com" : "img.comic",
		"questionablecontent.net" : "img#strip",
		"cad-comic.com" : "div#content",
		"techcrunch.com" : "div.module-post-detail"
	};

	var useFoundImage = ["xkcd.com"],
	// These are the items we're trying to collect. This first block is trivial.
	    containsImages = Boolean(document.getElementsByTagName("img").length > 0),
        documentWidth = document.width, documentHeight = document.height,
        url = document.location.href,
        // documentLength = document.body.textContent.length,
	// These take slightly more work and are initialized only when requested.
	    article = null,
        articleBoundingClientRect = null,
        selection = false,
	// This is easy to get, but is always "false" at load time until the user selects something.
	    selectionIsInFrame = false,
        documentIsFrameset = false,
        selectionFrameElement = null,
        recommendationText = null,
	// Internal state variables to keep us duplicating work.
	    hasCheckedArticle = false;

	// Experimental recognition of 'image' pages (like photo sites and comics).
	function findImage() {
		var imgs = document.getElementsByTagName("img"), biggest = null, biggestArea = 0;
		for (var i = 0; i < imgs.length; i++) {
			var style = window.getComputedStyle(imgs[i]),
                width = style.width.replace(/[^0-9.-]/g, ""),
                height = style.height.replace(/[^0-9.-]/g, ""), area = width * height;
			if (!biggest || area > biggestArea) {
				biggest = imgs[i];
				biggestArea = area;
			}
		}
		return biggest;
	}

	// This will try and determine the 'default' page article. It will only run once per page, but it's specifically
	// called only on demand as it can be expensive.
	function findArticle() {

		findImage();
		// If we'd previously computed an article element, but it's lost its parent or become invisible, then we'll try and
		// re-compute the article. This can happen if, for example the page dynamically udaptes itself (like showing the
		// latest news article in a box that updates periodically). This doesn't guarantee that we clip something sane if
		// this happens, (if the page re-writes itself while a clip is taking place, the results are indeterminate), but it
		// will make such things less likely.
		if (article && (!article.parentNode || article.getBoundingClientRect().width == 0)) {
			article = null;
			hasCheckedArticle = false;
		}

		if (!hasCheckedArticle) {

			// See if we should special-case this.
			var host = getHostname();
			if (specialCases[host]) {
				var candidate = document.querySelector(specialCases[host]);
				if (candidate) {
					article = candidate;
					articleBoundingClientRect = article.getBoundingClientRect();
				}
			} else if (useFoundImage.indexOf(host) != -1) {
				article = findImage();
				if (article)
					articleBoundingClientRect = article.getBoundingClientRect();
			}

			// If it's not a special case, see if it's a single image.
			if (!article) {
				var imageTypes = ['jpeg', 'jpg', 'gif', 'png'];
				var urlExtension = document.location.href.replace(/^.*\.(\w+)$/, "$1");
				if (urlExtension && (imageTypes.indexOf(urlExtension) != -1)) {
					var candidate = document.querySelector("body > img");
					if (candidate) {
						article = candidate;
						articleBoundingClientRect = article.getBoundingClientRect();
					}
				}
			}

			// If we didn't find an article in the special cases, we'll try our heuristics.
			if (!article) {
				var ex = new ExtractContentJS.LayeredExtractor();
				ex.addHandler(ex.factory.getHandler('Heuristics'));
				var res = ex.extract(document);
				if (res.isSuccess) {
					var current = res.content.asNode();
					while ((current.nodeType !== Node.ELEMENT_NODE) && current.parentNode) {
						current = current.parentNode;
					}
					if (current.nodeType === Node.ELEMENT_NODE) {
						if (current.nodeName === "IFRAME") {
							console.warn("Found an IFRAME as the content element. Will not use.");
						} else {
							// Use these values unless they don't really look like an article.
							if (current.textContent.replace(/\s+/g, " ").length > 300) {
								article = current;
								articleBoundingClientRect = article.getBoundingClientRect();
							}
						}
					} else {
						console.warn("Got non-element node as content node. nodeType: " + current.nodeType);
					}
				}
			}

			// If we still didn't find an article, let's see if maybe it's in a frame.
			if (!article) {
				if (document.body.nodeName.toLowerCase() == "frameset") {
					documentIsFrameset = true;
					var frame = findBiggestFrame();
					if (frame && frame.contentDocument && frame.contentDocument.documentElement) {
						selectionFrameElement = frame;
						article = frame.contentDocument.documentElement;
						articleBoundingClientRect = article.getBoundingClientRect();
					}
				}
			}

			hasCheckedArticle = true;
		}

	}

	function findBiggestFrame() {
		var frames = document.getElementsByTagName("frame");
		var candidate = null;
		var candidateSize = 0;
		for (var i = 0; i < frames.length; i++) {
			if (frames[i].width && frames[i].height) {
				var area = frames[i].width * frames[i].height;
				if (area > candidateSize) {
					candidate = frames[i];
					candidateSize = area;
				}
			}
		}
		return candidate;
	}

	function getHostname() {
		var match = document.location.href.match(/^.*?:\/\/(www\.)?(.*?)(\/|$)/);
		if (match) {
			return match[2];
		}
		return null;
	}

	function getDefaultArticle() {
		findArticle();
		return article;
	}

	// Looks for selections in the current document and descendent (i)frames.
	// Returns the *first* non-empty selection.
	// @TODO: Clipper.js/Clip.js still use SelectionFinder.js instead of this code. They are the only place in the clipper
	// still using that, and it duplicates this code with more effort. If we change Clip.js to use this code, we can
	// remove SelectionFinder.js entirely.
	function getSelection() {

		// First we check our main window and return a selection if that has one.
		var selection = window.getSelection();
		if (selection && selection.rangeCount && !selection.isCollapsed) {
			return selection;
		}

		// Then we'll try our frames and iframes.
		var docs = [];
		var iframes = document.getElementsByTagName("iframe");
		for (var i = 0; i < iframes.length; i++) {
			docs.push(iframes[i]);
		}
		var frames = document.getElementsByTagName("frame");
		for (var i = 0; i < frames.length; i++) {
			docs.push(frames[i]);
		}
		for (var i = 0; i < docs.length; i++) {
			var win = docs[i].contentWindow;
			if (win) {
				try {
					var frameSelection = win.getSelection();
					if (frameSelection && frameSelection.rangeCount && !frameSelection.isCollapsed) {
						selectionIsInFrame = true;
						selectionFrameElement = docs[i];
						return frameSelection;
					}
				} catch (err) {
					console.warn('iframe getSelection Error: ' + err);
				}
			} else {
				console.warn("iframe contained no Document object.");
			}
		}

		// Didn't find anything.
		return null;
	}

	function getText(node, soFar, maxLen) {
		if (node.nodeType == Node.TEXT_NODE) {
			return soFar + " " + node.textContent.trim();
		}

		var banned = ["script", "noscript"];

		if (node.nodeType == Node.ELEMENT_NODE) {
			if (banned.indexOf(node.nodeName.toLowerCase()) == -1) {
				for (var i = 0; i < node.childNodes.length; i++) {
					soFar = getText(node.childNodes[i], soFar, maxLen);
					if (soFar.length > maxLen) {
						return soFar;
					}
				}
			}
		}
		return soFar.replace(/\s+/g, " ");
	}

	function getRecommendationText() {
		var MAX_LEN = 5000;
		var selection = getSelection();
		if (selection) {
			return selection.getRangeAt(0).cloneContents().textContent.substr(0, MAX_LEN);
		}

		return getText(document.body, "", MAX_LEN);
	}

	// Note: you must call getSelection() first to populate this field!
	function getSelectionFrame() {
		return selectionFrameElement;
	}

	function checkClearly() {
		var clearlyDoc = document.querySelector("iframe#readable_iframe");
		if (clearlyDoc)
			clearlyDoc = clearlyDoc.contentDocument;
		if (clearlyDoc)
			clearlyDoc = clearlyDoc.querySelector("body#body div#box");
		if (clearlyDoc) {
			article = clearlyDoc;
			articleBoundingClientRect = article.getBoundingClientRect();
		}
	}

	function postPageInfoToBg() {
		// Initialize these values if they haven't been already.
		findArticle();

		var isSelected = getSelection();

		checkClearly();

		var response = {
			containsImages : containsImages,
			documentWidth : documentWidth,
			documentHeight : documentHeight,
			url : url,
			selection : (isSelected !== null),
			// selectionIsInFrame : selectionIsInFrame,
			documentLength : document.body.textContent.length,
			// articleBoundingClientRect : articleBoundingClientRect,
			article : (article != null),
			// recommendationText : getRecommendationText(),
			// documentIsFrameset : documentIsFrameset,
			title  : document.title
		};
		opera.extension.postMessage({'name': 'responsePageInfo', 'info': response});
		//send to popup page 
		// Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {'name': 'responsePageInfo', 'info': response});
	}

	//监听popup页面发送来的请求，把当前页面的剪辑信息发送给popup
	// Wiz.Browser.addListener('wiz_service', messageHandler);
	// Public API:
	// this.readyRequestHandler = readyRequestHandler
	this.getDefaultArticle = getDefaultArticle;
	this.getSelection = getSelection;
	this.getSelectionFrame = getSelectionFrame;
	this.postPageInfoToBg = postPageInfoToBg;

	Object.preventExtensions(this);
}

Object.preventExtensions(Wiz_PageInfo);

var wiz_pageInfo = new Wiz_PageInfo(window.Node);

