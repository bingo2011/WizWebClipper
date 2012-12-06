function com_wizbrother_ContentPreview() {
	//"use strict";

	var contentVeil = new com_wizbrother_ContentVeil();

	// Stores a reference to the last element that we used as a preview.
	var previewElement = null;

	function buildPreviewLegend() {
		var legend = document.createElement("div");
		legend.id = "wizPreviewLegend";

		var nudgeImgs = [
		// Image name                 Message identifier
		["nudge-icon-arrow-up.png", "contentPreview_expandSelection"], ["nudge-icon-arrow-down.png", "contentPreview_shrinkSelection"], ["nudge-icon-arrow-lr.png", "contentPreview_moveSelection"], ["nudge-icon-return.png", "contentPreview_clipArticle"]];

		var ul = document.createElement("UL");

		var i;
		for (var i = 0; i < nudgeImgs.length; i++) {
			// @TODO: The div in this block seems totally unnessecary, we could refactor the CSS to get rid of it.
			var li = document.createElement("li");
			var div = document.createElement("div");
			var img = document.createElement("img");
			var message = document.createTextNode(" " + com_wizbrother_Message.get(nudgeImgs[i][1]));
			div.className = "keyIcon";
			img.src = sogouExplorer.extension.getURL("images/nudge-icons/" + nudgeImgs[i][0]);
			div.appendChild(img);
			li.appendChild(div);
			li.appendChild(message);
			ul.appendChild(li);
		}
		legend.appendChild(ul);
		return legend;
	}

	var previewLegend = buildPreviewLegend();

	function showPreviewLegend() {
		if (!previewLegend.parentNode) {
			document.documentElement.appendChild(previewLegend);
		}
		previewLegend.className = "wizPreviewLegendVisible";
	}

	function hidePreviewLegend() {
		previewLegend.className = "wizPreviewLegendHidden";
	}

	function removePreviewLegend() {
		if (previewLegend.parentNode) {
			previewLegend.parentNode.removeChild(previewLegend);
		}
	}

	function buildUrlElement() {
		var urlEl = document.createElement("div");
		urlEl.id = "wizPreviewContainer";
		urlEl.className = "wizPreviewContainer wizPreviewUrlContainer";
		return urlEl;
	}

	var urlElement = buildUrlElement();

	function showUrlElement() {
		if (!urlElement.parentNode) {
			document.documentElement.appendChild(urlElement);
		}

		// Make sure we're centered in the window.
		var elStyle = window.getComputedStyle(urlElement, '');
		var w = parseInt(elStyle.getPropertyValue("width"));
		var h = parseInt(elStyle.getPropertyValue("height"));
		if (w && h) {
			urlElement.style.marginLeft = (0 - w / 2) + "px";
			urlElement.style.marginTop = (0 - h / 2) + "px";
		}
	}

	function hideUrlElement() {
		if (urlElement.parentNode) {
			urlElement.parentNode.removeChild(urlElement);
		}
	}

	// @TODO: This is fairly incomplete.
	function getFavIconUrl() {
		var links = document.getElementsByTagName("link");
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
		console.log("Couldn't get a favicon for " + document.location.href);
	}

	function previewUrl(title, url, favIconUrl) {
		clear();
		contentVeil.reset();
		contentVeil.show();
		title = title ? title : window.document.title;
		url = url ? url : window.location.href;
		favIconUrl = favIconUrl ? favIconUrl : getFavIconUrl();
		urlElement.innerHTML = com_wizbrother_GlobalUtils.createUrlClipContent(title, url, favIconUrl);
		showUrlElement();
	}

	// This doesn't remove internal state of previewElement, because another script may not have finished clipping until
	// after the page looks 'clear'.
	function clear() {
		contentVeil.reset();
		contentVeil.hide();
		hideUrlElement();
		removePreviewLegend();
	}

	function previewArticle(showHelp) {

		clear();
		previewElement = null;

		if ( typeof wiz_pageInfo !== undefined) {
			previewElement = wiz_pageInfo.getDefaultArticle();
		} else {
			console.warn("Couldn't find a 'wiz_pageInfo' object.");
		}

		if (previewElement) {
			var selectionFrame = wiz_pageInfo.getSelectionFrame();
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
				contentVeil.outlineElement(previewElement, true);
			}
			if (showHelp) {
				showPreviewLegend();
				setTimeout(hidePreviewLegend, 5000);
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
		if (candidate === window.document) {
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

	function nudgePreview(direction) {
		if (!previewElement) {
			return;
		}
		var oldPreview = previewElement;
		switch (direction) {
			case "expand":
				var temp = previewElement.parentNode;
				while (temp) {
					if (looksInteresting(temp, previewElement)) {
						// If we move up and then down, we want to move back to where we started, not the first child.
						//temp.enNudgeDescendToNode = previewElement;
						previewElement = temp;
						break;
					}
					temp = temp.parentNode;
				}
				break;

			case "shrink":
				//        if (previewElement.enNudgeDescendToNode)
				//        {
				//          var temp = previewElement.enNudgeDescendToNode;
				//          // @TODO: make sure we clean these up somewhere else if we never reverse our nudging.
				//          delete previewElement.enNudgeDescendToNode;
				//          previewElement = temp;
				//          break;
				//        }
				for (var i = 0; i < previewElement.children.length; i++) {
					if (looksInteresting(previewElement.children[i], previewElement)) {
						previewElement = previewElement.children[i];
						break;
					}
				}
				break;

			case "topexpand":
				var previousSibling = null;
				var tempParent = previewElement;
				var tempSibling = previewElement.previousElementSibling;

				// just reverse the tree to find interesting sibling.
				while (tempParent) {
					var tempSibling = tempParent.previousElementSibling;
					while (tempSibling) {
						if (looksInteresting(tempSibling, previewElement)) {
							previousSibling = tempSibling;
							break;
						}
						tempSibling = tempSibling.previousElementSibling;
					}
					if (previousSibling)
						break;

					tempParent = tempParent.parentNode;
				}

				// interesting node found, return all elements between this and seleced element.
				if (previousSibling) {
					var i, j, k;
					var totoal = previousSibling.parentNode.children.length;

					var startNode, endNode;
					for ( i = 0; i < totoal; i++) {
						if (previousSibling.parentNode.children[i] == previousSibling) {
							startNode = previousSibling.parentNode.children[i];
							break;
						}
					}

					for ( j = i; j < totoal; j++) {
						if (previousSibling.parentNode.children[j] == tempParent) {
							endNode = previousSibling.parentNode.children[j];
							break;
						}
					}

					console.log("i= " + i + "j= " + j);

					var p = startNode.parentNode;
					var wrapper = document.createElement('div');
					wrapper.appendChild(startNode.cloneNode(true));
					p.replaceChild(wrapper, startNode);
					for (var k = i++; k < j; k++) {
						wrapper.appendChild(wrapper.nextElementSibling.cloneNode(true));
						p.removeChild(wrapper.nextElementSibling);
					}

					previewElement = wrapper;
				}

				break;

			case "topshrink":
				console.log("topshrink");
				break;

			case "bottomexpand":
				var nextSibling = null;
				var tempParent = previewElement;
				var tempSibling = previewElement.nextElementSibling;

				// just reverse the tree to find interesting sibling.
				while (tempParent) {
					var tempSibling = tempParent.nextElementSibling;
					while (tempSibling) {
						if (looksInteresting(tempSibling, previewElement)) {
							nextSibling = tempSibling;
							break;
						}
						tempSibling = tempSibling.nextElementSibling;
					}
					if (nextSibling)
						break;

					tempParent = tempParent.parentNode;
				}

				// interesting node found, return all elements between this and seleced element.
				if (nextSibling) {
					var i, j, k;
					var totoal = nextSibling.parentNode.children.length;

					var startNode, endNode;
					for ( i = 0; i < totoal; i++) {
						if (nextSibling.parentNode.children[i] == tempParent) {
							startNode = nextSibling.parentNode.children[i];
							break;
						}
					}

					for ( j = i; j < totoal; j++) {
						if (nextSibling.parentNode.children[j] == nextSibling) {
							endNode = nextSibling.parentNode.children[j];
							break;
						}
					}

					console.log("i= " + i + "j= " + j);

					var p = startNode.parentNode;
					var wrapper = document.createElement('div');
					wrapper.appendChild(startNode.cloneNode(true));
					p.replaceChild(wrapper, startNode);
					for (var k = i++; k < j; k++) {
						wrapper.appendChild(wrapper.nextElementSibling.cloneNode(true));
						p.removeChild(wrapper.nextElementSibling);
					}

					previewElement = wrapper;
				}

				break;

			case "bottomshrink":
				console.log("bottomshrink");
				break;

			case "left":
				var previousSibling = null;
				var tempParent = previewElement;
				var tempSibling = previewElement.previousElementSibling;
				while (tempParent) {
					// reverse at this level
					while (tempSibling) {
						if (looksInteresting(tempSibling, tempParent)) {
							previousSibling = tempSibling;
							break;
						}
						tempSibling = tempSibling.previousElementSibling;
					}

					if (previousSibling) {
						previewElement = previousSibling;
						break;
					}

					// no sibling exist at this level, go up.
					tempParent = tempParent.parentNode;

					// we move back the end
					if (tempParent) {
						tempSibling = tempParent;
						if (tempParent.lastElementChild) {
							tempSibling = tempParent.lastElementChild;
						}
					}
				}

				break;

			case "right":
				var nextSibling = null;
				var tempParent = previewElement;
				var tempSibling = previewElement.nextElementSibling;
				while (tempParent) {
					while (tempSibling) {
						if (looksInteresting(tempSibling, tempParent)) {
							nextSibling = tempSibling;
							break;
						}
						tempSibling = tempSibling.nextElementSibling;
					}

					if (nextSibling) {
						previewElement = nextSibling;
						break;
					}

					tempParent = tempParent.parentNode;

					// we move back to the head.
					if (tempParent) {
						tempSibling = tempParent;
						if (tempParent.firstElementChild) {
							tempSibling = tempParent.firstElementChild;
						}
					}
				}

				break;

			case "enter":
				com_wizbrother_clipper.launchClientClipperArticle();
				clear();
				break;

			case "cancle":
				clear();
				break;

			default:
				console.warn("Unhandled nudge direction: " + direction);
		}

		// Drawing is expensive so don't bother if nothing changed.
		if (oldPreview !== previewElement) {
			contentVeil.outlineElement(previewElement, true);
		}
	}

	function previewFullPage() {

		var borderWidth = 14;
		var w = window.innerWidth;
		var h = window.innerHeight;

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

		var selection = wiz_pageInfo.getSelection();
		contentVeil.reset();

		// If our selection is in a frame or iframe, we'll compute an offset relative to that, so we need to adjust it by
		// the offset of the frame.
		var selectionFrame = wiz_pageInfo.getSelectionFrame();
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

	//sogou浏览器无法在iframe中监听事件，只能放在这里处理
	var clipResult = new com_wizbrother_ClipResult();

	// This handles incoming requests from other extension pages.
	function messageHandler(request, sender, sendResponse) {
		console.log("Msg Received: " + request.name + " " + request.op);
		if (!request.name || !request.op || (request.name !== "preview")) {
			return;
			// Not an appropriate message.
		}
		switch (request.op) {
			case "clear":
				clear();
				break;
			case "nudge":
				console.log("nudged");
				nudgePreview(request.args.direction);
				break;
			case "article":
				if (wiz_pageInfo.getSelection()) {
					console.log("preview selection active");
					previewSelection();
				} else {
					//if (request.args && request.args.showHelp) {
					previewArticle(true);
				}
				break;
			case "fullPage":
				previewFullPage();
				break;
			case "selection":
				previewSelection();
				break;
			case "url":
				if (request.args) {
					previewUrl(request.args.title, request.args.url, request.args.favIconUrl);
				} else {
					previewUrl();
				}
				break;
			case "keydown" :
				nudgePreview(request.opCmd);
				break;
			case "submit" :
				noteSubmitByType(request.type, request.info);
				break;
			case 'clip' :
				clipResult.showClipping(request.info);
				break;
			case 'sync' :
				clipResult.showSyncing(request.info);
				break;
			case 'error' :
				clipResult.showError(request.info);
				break;
			case 'saved' :
				clipResult.showSuccess(request.info);
				break;
			default:
				console.warn("Received invalid Preview message with 'op=" + request.op + "'.");
		}
		sendResponse({});
	}

	function noteSubmitByType(type, info) {
		console.log('Preview.noteSubmitByType() ' + type);
		if (typeof com_wizbrother_clipper === 'undefined') {
			console.warn("Could not found com_wizbrother_clipper object!")
			return ;
		}
		completeImgSrc();
		switch(type) {
			case "article" :
				com_wizbrother_clipper.launchClientClipperArticle(info);
				clear();
				break;
			case "fullPage" :
				com_wizbrother_clipper.launchClientClipperFullPage(info);
				clear();
				break;
			case "selection" :
				// if (previewElement) {
					// launchClientClipper(info);
					// break;
				// }
				com_wizbrother_clipper.launchClientClipperSelection(info);
				clear();
				break;
			case "url" :
				com_wizbrother_clipper.launchClientClipperUrl(info);
				clear();
				break;
			case "native": 
				com_wizbrother_clipper.launchNativeClipper(info);
				clear();
				break;
			default : 
				//TODO
		}
	}

	//剪辑页面之前首先把页面中img的src补全
	function completeImgSrc() {
		try {
			var imgList = document.getElementsByTagName('img');
			if (!imgList || imgList.length < 1) {
				return ;
			}
			for (var index = 0, length = imgList.length; index < length; index++) {
				imgList[index].src = imgList[index].src;
			}
		} catch (err) {
			console.log('Preview.completeImgSrc() Error: ' + err);
		}
	}


	com_wizbrother_Browser.onRequest().addListener(messageHandler);

	// Public API:
	this.getArticleElement = getArticleElement;
	this.looksInteresting = looksInteresting;
	this.nudgePreview = nudgePreview;

	Object.preventExtensions(this);
}

var com_wizbrother_contentPreview = new com_wizbrother_ContentPreview();
