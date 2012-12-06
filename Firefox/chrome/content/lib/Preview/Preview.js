// "use strict";
Wiz.ContentPreview = function(tab) {"use strict";
	var tab = tab;
	var doc = tab.document;
	var contentVeil = new ContentVeil(tab);
	var pageInfo = new PageInfo(tab);
	var previewElement = null;

	function buildUrlElement() {
		var urlEl = tab.document.createElement("div");
		urlEl.id = "wizPreviewContainer";
		urlEl.className = "wizPreviewContainer wizPreviewUrlContainer";
		return urlEl;
	}

	function setElementStyle(elem, styles) {
		if ( !(elem instanceof Element) ) {
        	return;
  	  	}
	    var style = elem.style;
	    for ( var key in styles ) {
	        if ( typeof styles[ key ] == "string" ) {
	            style.setProperty( key, styles[ key ] );
	        }
	    }
	}

	var urlElement = buildUrlElement();

	function showUrlElement() {
		if (!urlElement.parentNode) {
			doc.documentElement.appendChild(urlElement);
		}

		// Make sure we're centered in the tab.
		var elStyle = tab.getComputedStyle(urlElement, '');
		var w = parseInt(elStyle.getPropertyValue("width"));
		var h = parseInt(elStyle.getPropertyValue("height"));
		if (w && h) {
			// urlElement.style.marginLeft = (0 - w / 2) + "px";
			urlElement.style.marginTop = (0 - h / 2) + "px";
		}
		setElementStyle(urlElement,{"position":"fixed", "top":"60%", "left":"40%","z-index":"2147483647", "max-width": "450px", "overflow": "hidden", "text-overflow": "ellipsis", "white-space":"nowrap" });
	}

	function hideUrlElement() {
		if (urlElement.parentNode) {
			urlElement.parentNode.removeChild(urlElement);
		}
	}

	// @TODO: This is fairly incomplete.
	function getFavIconUrl() {
		var links = doc.getElementsByTagName("link");
		var i;
		for ( i = 0; i < links.length; i++) {
			if (links[i].rel) {
				var rels = links[i].rel.toLowerCase().split(/\s+/);
				if (rels.indexOf("icon") !== -1) {
					// Found it!
					return links[i].href;
				}
			}
		}
	}

	function previewUrl(title, url, favIconUrl) {
		clear();
		contentVeil.reset();
		contentVeil.show();
		title = title ? title : tab.document.title;
		url = url ? url : tab.location.href;
		favIconUrl = favIconUrl ? favIconUrl : getFavIconUrl();
		urlElement.innerHTML = GlobalUtils.createUrlClipContent(title, url, favIconUrl);
		showUrlElement();
	}

	// This doesn't remove internal state of previewElement, because another script may not have finished clipping until
	// after the page looks 'clear'.
	function clear() {
		contentVeil.reset();
		contentVeil.hide();
		hideUrlElement();
	}

	function previewArticle() {
		if (pageInfo.getSelection()) {
			previewSelection();
			return ;
		}
		clear();
		previewElement = null;

		if ( typeof pageInfo !== undefined) {
			previewElement = pageInfo.getDefaultArticle();
		} else {
			console.warn("Couldn't find a 'pageInfo' object.");
		}

		if (previewElement) {
			var selectionFrame = pageInfo.getSelectionFrame();
			if (selectionFrame) {
				var rect = {
					width : selectionFrame.width,
					height : selectionFrame.height,
					top : selectionFrame.offsetTop,
					bottom : (selectionFrame.height + selectionFrame.offsetTop),
					left : selectionFrame.offsetLeft,
					right : (selectionFrame.width + selectionFrame.offsetLeft)
				};
				contentVeil.revealRect(contentVeil.expandRect(rect, -14), true);
				contentVeil.show();
			} else {
				//不需要自动滚动网页，用户体验不好
				contentVeil.outlineElement(previewElement, false);
			}
		} else {
			previewFullPage();
			console.warn("Couldn't find a preview element. We need switch to 'full page' mode.");
		}
	}

	// When nudging the preview around the page, we want to skip nodes that aren't interesting. This includes empty
	// nodes, containers that have identical contents to the already selected node, invisible nodes, etc.
	// @TODO: There's a lot more we could probably add here.
	function looksInteresting(candidate, given) {

		if (!candidate) {
			console.warn("Can't determine if 'null' is interesting (it's probably not).");
			return false;
		}
		// This is the parent of our 'HTML' tag, but has no tag itself. There's no reason it's ever more interesting than
		// the HTML element.
		if (candidate === tab.document) {
			return false;
		}

		// We don't want to clip the clipper controls notification.
		// @TODO: Probably want something similar for the content veil.
		if (candidate === previewLegend) {
			return false;
		}

		// Elements with neither text nor images are not interesting.
		if (!candidate.textContent && (candidate.getElementsByTagName("img").length === 0)) {
			return false;
		}

		// Elements with 0 area are not interesting.
		var rect = candidate.getBoundingClientRect();
		if (!rect.width || !rect.height) {
			return false;
		}

		// Invisible elements are not interesting.
		var style = getComputedStyle(candidate);
		if ((style.visibility === "hidden") || (style.display === "none")) {
			return false;
		}

		// If the nodes have a parent/child relationship, then they're only interesting if their visible contents differ.
		if (candidate.parentNode && given.parentNode) {
			if ((candidate.parentNode == given) || (given.parentNode == candidate)) {
				if ((candidate.textContent === given.textContent) && (candidate.getElementsByTagName("img").length === given.getElementsByTagName("img").length)) {
					return false;
				}
			}
		}
		return true;
	}

	// Returns the current article element, which may not be the same as the auto-detected one if the user has 'nudged'
	// the selection around the page.
	function getArticleElement() {
		return previewElement;
	}

	function previewFullPage() {

		var borderWidth = 14;
		var w = tab.innerWidth;
		var h = tab.innerHeight;

		var rect = {
			bottom : (h - borderWidth),
			top : (borderWidth),
			left : (borderWidth),
			right : (w - borderWidth),
			width : (w - (2 * borderWidth)),
			height : (h - (2 * borderWidth))
		}

		clear();
		contentVeil.reset();
		contentVeil.revealStaticRect(rect, true);
		contentVeil.show();
	}

	// Creates the union of two rectangles, which is defined to be the smallest rectangle that contains both given
	// rectangles.
	function unionRectangles(rect1, rect2) {
		var rect = {
			top : (Math.min(rect1.top, rect2.top)),
			bottom : (Math.max(rect1.bottom, rect2.bottom)),
			left : (Math.min(rect1.left, rect2.left)),
			right : (Math.max(rect1.right, rect2.right))
		}
		rect.width = rect.right - rect.left;
		rect.height = rect.bottom - rect.top;

		return rect;
	}

	// Returns true if the rectangles match, false otherwise.
	function rectanglesEqual(rect1, rect2) {
		if (!rect1 && !rect2)
			return true;
		if (!rect1)
			return false;
		if (!rect2)
			return false;
		if (rect1.top != rect2.top)
			return false;
		if (rect1.bottom != rect2.bottom)
			return false;
		if (rect1.left != rect2.left)
			return false;
		if (rect1.right != rect2.right)
			return false;
		if (rect1.width != rect2.width)
			return false;
		if (rect1.height != rect2.height)
			return false;
		return true;
	}

	// If the user triple-clicks a paragraph, we will often get a selection that includes the next paragraph after the
	// selected one, but only up to offset 0 in that paragraph. This causes the built in getBoundingClientRect to give a
	// box that includes the whole trailing paragraph, even though none of it is actually selected. Instead, we'll build
	// our own bounding rectangle that omits the trailing box.
	// @TODO: Currently this computes a box that is *too big* if you pass it a range that doesn't have start and/or end
	// offsets that are 0, because it will select the entire beginning and ending node, instead of jsut the selected
	// portion.
	function computeAlternateBoundingBox(range) {

		// If the end of selection isn't at offset 0 into an element node (rather than a text node), then we just return the
		// original matching rectangle.
		if ((range.endOffset !== 0) && (range.endContainer.nodeType !== Node.ELEMENT_NODE)) {
			var rect = range.getBoundingClientRect();
			var mutableRect = {
				top : rect.top,
				bottom : rect.bottom,
				left : rect.left,
				right : rect.right,
				width : rect.width,
				height : rect.height
			};
			return mutableRect;
		}

		// This is the one we don't want.
		var endElementRect = null;
		try {
			endElementRect = range.endContainer.getBoundingClientRect();
		} catch(ex) {
			console.warn("Couldn't get a bounding client rect for our end element, maybe it's a text node.");
		}

		// We look for a rectangle matching our end element, and if we find it, we don't copy it to our list to keep.
		// You'd think we could just grab the last element in range.getClientRects() here and trim that one, which might be
		// true, but the spec makes no claim that these are returned in order, so I don't want torely on that.
		// We keep track if we remove a rectangle, as we're only trying to remove one for the trailnig element. If there are
		// more than one matching rectangle, we want to keep all but one of them.
		var foundEnd = false;
		var keptRects = [];
		var initialRects = range.getClientRects();
		for (var i = 0; i < initialRects.length; i++) {
			if (rectanglesEqual(endElementRect, initialRects[i]) && !foundEnd) {
				foundEnd = true;
				console.log("Omitting empty trailing selection element from preview.");
			} else {
				keptRects.push(initialRects[i]);
			}
		}

		// Now compute our new bounding box and return that.
		if (keptRects.length == 0)
			return range.getBoundingClientRect();
		if (keptRects.length == 1)
			return keptRects[0];

		var rect = keptRects[0];
		for (var i = 1; i < keptRects.length; i++) {
			rect = unionRectangles(rect, keptRects[i]);
		}

		return rect;
	}

	function previewSelection() {

		var selection = pageInfo.getSelection();
		contentVeil.reset();

		// If our selection is in a frame or iframe, we'll compute an offset relative to that, so we need to adjust it by
		// the offset of the frame.
		var selectionFrame = pageInfo.getSelectionFrame();
		var frameRect = null;
		if (selectionFrame) {
			frameRect = selectionFrame.getBoundingClientRect();
		}

		var range, rect, i;

		// If !selection, then something has gone awry.
		if (selection) {
			clear();
			contentVeil.reset();
			// We attempt to highlight each selection, but this hasn't been tested for more than a single selection.
			for ( i = 0; i < selection.rangeCount; i++) {
				range = selection.getRangeAt(i);

				rect = computeAlternateBoundingBox(range);

				// Actual adjustment mentioned earlier regarding frames.
				if (frameRect) {
					rect.left += frameRect.left;
					rect.right += frameRect.left;
					rect.top += frameRect.top;
					rect.bottom += frameRect.top;
				}

				contentVeil.revealRect(rect, true);
			}
		}
		contentVeil.show();
	}

	function getClipInfo() {
		return pageInfo.getPageClipInfo();
	}

	// Public API:
	this.getArticleElement = getArticleElement;
	this.previewFullPage = previewFullPage;
	this.looksInteresting = looksInteresting;
	this.previewUrl = previewUrl;
	this.previewSelection = previewSelection;
	this.previewArticle = previewArticle;
	this.getClipInfo = getClipInfo;
	this.clear = clear;
}