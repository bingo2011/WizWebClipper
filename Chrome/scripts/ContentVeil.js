function Wiz_ContentVeil() {
	//"use strict";

	// @TODO: save() and restore() aren't properly used here, so if we do things like add transforms in founctions,
	// we probably break other functions' notion of how to render things.

	var veil = document.createElement("canvas");
	var context = veil.getContext('2d');

	var defaultFill = "rgba(0, 0, 0, 0.7)";
	var defaultStroke = "rgba(255, 255, 0, 0.7)";
	var clearFill = "rgba(0, 0, 0, 1)";

	var defaultLineWidth = 5;
	var defaultLineJoin = "round";

	// We keep a record of what we're currently showing (at least in some cases) so that we can update it in case the
	// state of the page changes (like if the user scrolls).
	var currentlyShownRect = null;
	var currentRectOffsetTop = 0;
	var currentRectOffsetLeft = 0;
	var currentlyStatic = false;

	function reset() {
		currentlyShownRect = null;
		currentRectOffsetTop = 0;
		currentRectOffsetLeft = 0;

		showElements("embed");
		showElements("iframe");

		veil.style.position = "fixed";
		veil.style.top = "0px";
		veil.style.left = "0px";
		veil.style.zIndex = "9999999999999990";

		context.fillStyle = defaultFill;
		context.strokeStyle = defaultStroke;

		context.lineWidth = defaultLineWidth;
		context.lineJoin = defaultLineJoin;

		blank();
	}

	function blank() {
		veil.height = window.innerHeight;
		veil.width = window.innerWidth;

		var oldFillStyle = context.fillStyle;
		context.fillStyle = defaultFill;
		context.fillRect(0, 0, veil.width, veil.height);
		context.fillStyle = oldFillStyle;
	}

	function show() {
		if (!veil.parentNode) {
			document.documentElement.appendChild(veil);
		}
		//显示的时候，切换popup页面显示
		chrome.extension.connect({
			name : "contentVeilShow"
		});
	}

	function hide() {
		if (veil.parentNode) {
			veil.parentNode.removeChild(veil);
		}
	}

	// Doesn't actually draw this path, simply sets it as the current path.
	function setRoundedRectPath(x, y, width, height, radius) {
		context.beginPath();
		context.moveTo(x + radius, y);
		context.arcTo(x + width, y, x + width, y + radius, radius);
		context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
		context.arcTo(x, y + height, x, y + height - radius, radius);
		context.arcTo(x, y, x + radius, y, radius);
		context.closePath();
	}

	// Makes a rectangle bigger in all directions by the number of pixels specified (or smaller, if 'amount' is
	// negative). Returns the new rectangle.
	function expandRect(rect, amount) {
		return {
			top : (rect.top - amount),
			left : (rect.left - amount),
			bottom : (rect.bottom + amount),
			right : (rect.right + amount),
			width : (rect.width + (2 * amount)),
			height : (rect.height + (2 * amount))
		};
	}

	function revealRect(rect, drawStroke, staticView) {

		// Save this info.
		currentlyShownRect = rect;
		currentRectOffsetTop = document.body.scrollTop;
		currentRectOffsetLeft = document.body.scrollLeft;
		currentlyStatic = staticView;

		// We expand the rectangle for two reasons.
		// 1) we want to expand it by half the width of the stroke, so that when we draw out outline, the inner edge of the
		//    outline is still on the outside edge of the rectangle.
		// 2) We want to leave a little extra room for the rounded corners, so they don't cut off content.
		rect = expandRect(rect, 7);
		var x = rect.left;
		var y = rect.top;
		var width = rect.width;
		var height = rect.height;

		//    console.log("[revealRect]top: %d, bottom: %d, left: %d, right: %d, width: %d, height: %d",
		//              rect.top, rect.bottom, rect.left, rect.right, rect.width, rect.height);

		// We're going to use rounded-corner rectangles.
		setRoundedRectPath(x, y, width, height, 8);

		// Set this to the operation that will clear the shape we're drawing. See here:
		// https://developer.mozilla.org/en/Canvas_tutorial/Compositing
		var oldGCO = context.globalCompositeOperation;
		context.globalCompositeOperation = "destination-out";
		var oldFill = context.fillStyle;
		context.fillStyle = clearFill;
		context.fill();
		// Fill with blankness.
		context.globalCompositeOperation = oldGCO;
		// restore to actual drawing composite operation.
		context.fillStyle = oldFill;
		if (drawStroke) {
			context.strokeStyle = defaultStroke;
			context.lineWidth = defaultLineWidth;
			context.stroke();
		}
	}

	function revealStaticRect(rect, drawStroke) {
		revealRect(rect, drawStroke, true);
	}

	function outlineElement(element, scrollTo) {
		var rect = element.getBoundingClientRect();
		if (rect) {
			var mutableRect = {
				top : rect.top,
				bottom : rect.bottom,
				left : rect.left,
				right : rect.right,
				width : rect.width,
				height : rect.height,
			}

			//      console.log("[outlineElement]top: %d, bottom: %d, left: %d, right: %d, width: %d, height: %d",
			//              rect.top, rect.bottom, rect.left, rect.right, rect.width, rect.height);
			//      console.log("innerWidth: %d, innerHeight: %d", window.innerWidth, window.innerHeight);
			//      console.log("scrollTop: %d, scrollLeft: %d", document.body.scrollTop, document.body.scrollLeft);

			//      var BORDER_MIN = 7;
			//      if (mutableRect.left < BORDER_MIN) {
			//        mutableRect.width -= BORDER_MIN - mutableRect.left;
			//        mutableRect.left = BORDER_MIN;
			//      }
			//      if (mutableRect.top < BORDER_MIN) {
			//        mutableRect.height -= BORDER_MIN - mutableRect.top;
			//        mutableRect.top = BORDER_MIN;
			//      }

			reset();
			revealRect(mutableRect, true);

			if (scrollTo) {
				var left = mutableRect.left - (window.innerWidth / 2);
				var top = mutableRect.top - (window.innerHeight / 2);
				//Evernote.Scroller.scrollTo(left, top, 120, 20);
				//console.log("scroll to: [%d, %d]", left, top);
				window.scrollBy(left, top);
			}

			hideElements("embed", element);
			hideElements("iframe", element);
			show();

		} else {
			console.warn("Couldn't create rectangle from element: " + element.toString());
		}
	}

	function hideElements(tagName, exceptInElement) {
		var els = document.getElementsByTagName(tagName);
		for (var i = 0; i < els.length; i++) {
			els[i].enSavedVisibility = els[i].style.visibility;
			els[i].style.visibility = "hidden";
		}
		showElements(tagName, exceptInElement);
	}

	function showElements(tagName, inElement) {
		if (!inElement) {
			inElement = document;
		}
		var els = inElement.getElementsByTagName(tagName);
		for (var i = 0; i < els.length; i++) {
			if ( typeof els[i].enSavedVisibility !== "undefined") {
				els[i].style.visibility = els[i].enSavedVisibility;
				delete els[i].enSavedVisibility;
			}
		}
	}

	// If we're currently showing a rectangle, and it's not static, we'll redraw on scroll.
	window.addEventListener("scroll", function(e) {
		if (currentlyShownRect && !currentlyStatic) {
			var rect = {
				top : currentlyShownRect.top,
				bottom : currentlyShownRect.bottom,
				left : currentlyShownRect.left,
				right : currentlyShownRect.right,
				width : currentlyShownRect.width,
				height : currentlyShownRect.height
			};

			var vert = document.body.scrollTop - currentRectOffsetTop;
			var horiz = document.body.scrollLeft - currentRectOffsetLeft;

			if (!vert && !horiz) {
				return;
			}

			rect.top -= vert;
			rect.bottom -= vert;
			rect.left -= horiz;
			rect.right -= horiz;

			//      console.log("[Event]top: %d, bottom: %d, left: %d, right: %d, width: %d, height: %d",
			//              rect.top, rect.bottom, rect.left, rect.right, rect.width, rect.height);

			blank();
			revealRect(rect, true);
		}
	});
	veil.addEventListener("click", hide);
	// Public API:
	this.reset = reset;
	this.show = show;
	this.hide = hide;
	this.revealRect = revealRect;
	this.revealStaticRect = revealStaticRect;
	this.outlineElement = outlineElement;
	this.expandRect = expandRect;

	Object.preventExtensions(this);
}

