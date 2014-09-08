'use strict';
var EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
var images = [];
var willVerifyAll = false;

var loaded = {};

function verifyAll () {
	willVerifyAll = false;
	for (var i = 0; i < images.length; i++) {
		if (images[i].complete) {
			images[i]._loadCallback();
		}
	}
	images.length = 0;//empty array
}

function verifyAsap (image) {
	images.push(image);
	if (!willVerifyAll) {
		willVerifyAll = true;
		setTimeout(verifyAll, 0);
	}
}
function _loadCallback () {
	/*jshint validthis: true */
	var img = this;
	if (img._wasLoaded) {
		return;
	}
	img._wasLoaded = true;
	img._loadCallbackUser();

	if (img._willBeReused) {
		loaded[img.src] = img;
	} else {
		// img.src = null; //null will download an image at currentpage/null
		img.src = EMPTY_IMAGE;//GC, http://www.fngtps.com/2010/mobile-safari-image-resource-limit-workaround/
	}
}

function loadImage(src, userCallback, get) {
	if (get && loaded[src]) {
		setTimeout(userCallback, 0);
		return loaded[src];
	}
	var image = new Image();
	if (userCallback) {
		image._wasLoaded = false;
		image._willBeReused = get;
		image._loadCallbackUser = userCallback;
		image._loadCallback = _loadCallback;
		image.onload = image._loadCallback;
		image.onerror = image._loadCallback;
		verifyAsap(image);
	}
	image.src = src;
	if (get) {
		return image;
	}
}
module.exports = loadImage;