function com_wizbrother_Loader() {
	'use strict';
	var iframe,
		imgPath = 'images/',
		imageDivAttr = [{
			'id': 'clippingIcon',
			'class': 'notificationIcon',
			'img': 'scissors.png',
			'display': 'none'
		}, {
			'id': 'activeIcon',
			'class': 'notificationIcon',
			'img': 'sync.png',
			'display': 'none'
		}, {
			'id': 'successIcon',
			'class': 'notificationIcon',
			'img': 'check.png',
			'display': 'none'
		}, {
			'id': 'errorIcon',
			'class': 'notificationIcon',
			'img': 'warning.png',
			'display': 'none'
		}, {
			'id': 'notificationMessage',
			'class': 'notificationIcon',
			'children': [{
				'id': 'notificationHeadline',
				'class': 'notificationHeadline'
			}, {
				'id': 'notificationDetails',
				'class': 'notificationDetails'
			}, {
				'id': 'errorActions',
				'class': ''
			}]
		}];

	function removeIFrame(evt) {
		if (evt && evt.target && 'retryClip' === evt.target.id) {
			return;
		}
		iframe = document.querySelector("#wizClipperResult");
		if (iframe) {
			try {
				iframe.parentNode.removeChild(iframe);
			} catch (e) {
				console.log("couldn't remove clip result iframe.");
			}
		}
		document.body.removeEventListener("mousedown");
	}

	function startClip(_attrs) {
		removeIFrame();
		try {
			iframe = document.createElement('div');
			iframe.id = "wizClipperResult";
			iframe.name = "wizClipperResult";
			//增加重试按钮
			iframe.appendChild(getResultDiv());
		} catch (err) {
			console.log('getResultDiv Error: ' + err);
		}
		try {
			if (document.body.nodeName.toLowerCase() == "frameset") {
				document.body.parentNode.insertBefore(iframe, null);
			} else {
				document.body.insertBefore(iframe, null);
			}
			addRetryElement('errorActions');
			document.body.addEventListener("mousedown", removeIFrame);
		} catch (e) {
			console.log("Couldn't insert related notes iframe, got error: " + JSON.stringify(e));
		}
	}

	function addRetryElement(parentId) {
		var parentElem = document.getElementById(parentId),
			retryElem = document.createElement('span');
		retryElem.id = 'retryClip';
		retryElem.className = 'fakeLink';
		parentElem.appendChild(retryElem);
	}

	//TODO 写成通用方法，动态载入
	function getResultDiv() {
		var length = imageDivAttr.length,
			innerElem = document.createElement('div'),
			outerElem = document.createElement('div'),
			childElem = null,
			imageDivSingle = null,
			imgElem = null;

		outerElem.id = 'main';
		outerElem.className  = 'main';
		innerElem.className  = 'middleBorder';
		for (var index=0; index < length; index++) {
			childElem = document.createElement('div'),
			imageDivSingle = imageDivAttr[index];
			childElem.id = imageDivSingle.id;
			childElem.className  = imageDivSingle.class;
			//默认隐藏
			childElem.style.display = imageDivSingle.display;
			//处理图片元素
			if (imageDivSingle.img) {
				imgElem = document.createElement('img');
				imgElem.src = sogouExplorer.extension.getURL(imgPath + imageDivSingle.img);
				childElem.appendChild(imgElem);
			}
			//处理信息元素
			if (imageDivSingle.children) {
				for (var j=0, length=imageDivSingle.children.length; j < length; j++) {
					var msgElem = document.createElement('div'),
						msgElemList = imageDivSingle.children;
					msgElem.id = msgElemList[j].id;
					msgElem.className = msgElemList[j].class;
					childElem.appendChild(msgElem); 
				}
			}
			innerElem.appendChild(childElem);
		}
		outerElem.appendChild(innerElem);
		return outerElem;
	}

	this.startClip = startClip;
	this.removeIframe = removeIFrame;
}

var com_wizbrother_loader;

// Don't load in frames.
if (window.parent === window) {
	com_wizbrother_loader = new com_wizbrother_Loader();
}
