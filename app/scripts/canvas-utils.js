'use strict';

function getCanvas (w, h) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	if (w) {
		canvas.width = w;
	}
	if (h) {
		canvas.height = h;
	}
	return {
		el: canvas,
		ctx: ctx
	};
}
function getCanvasFromImage (img, type) {
	var canvas = getCanvas(img.width, img.height);
	canvas.ctx.drawImage(img, 0, 0, img.width, img.height);
	if (type === 'ctx') {
		return canvas.ctx;
	}
	return canvas.el;
}

function drawImageFillArea (ctx, source, x, y, w, h, origWidth, origHeight) {
	origWidth = origWidth || source.width || source.videoWidth;
	origHeight = origHeight || source.height || source.videoHeight;
	if(!origWidth || !origHeight) {
		console.log('Width or height available', origWidth, origHeight);
	}

	var sourceX = 0;
	var sourceY = 0;
	var sourceWidth = origWidth;
	var sourceHeight = origHeight;

	var sourceRatio = origHeight / origWidth;
	var destinationRatio = h / w;
	var isDestinationLandscape = h < w;

	if (sourceRatio < destinationRatio) {
		if (isDestinationLandscape) {
			sourceWidth = sourceHeight * destinationRatio;
		} else {
			sourceWidth = sourceHeight / destinationRatio;
		}
		sourceX = (origWidth - sourceWidth)/2;
	} else {
		if (isDestinationLandscape) {
			sourceHeight = sourceWidth * destinationRatio;
		} else {
			sourceHeight = sourceWidth / destinationRatio;
		}
		sourceY = (origHeight - sourceHeight)/2;
	}

	console.log(sourceX, sourceY, sourceWidth, sourceHeight);
	ctx.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, x, y, w, h);
}
function fillAreaWithImageAndGetSrc (source, w, h, origWidth, origHeight) {
	var canvas = getCanvas(w, h);
	drawImageFillArea(canvas.ctx, source, 0, 0, w, h, origWidth, origHeight);
	return canvas.el.toDataURL();
}
function cropImageAndGetSrc (source, x, y, width, height) {
	var canvas = getCanvas(width, height);
  // canvas.ctx.fillStyle = 'yellow';
	// canvas.ctx.fillRect(0,0, width, height);
	canvas.ctx.drawImage(source, x, y);
	return canvas.el.toDataURL();
}
function getTrimmedImageCoordinates (image) {
	var width = image.width;
	var height = image.height;
	var canvas = getCanvasFromImage(image);
	var ctx = canvas.getContext('2d');
	// console.image(canvas.toDataURL());
	var imageData = ctx.getImageData(0, 0, width, height);
	var data = imageData.data;

	var x, y, alpha, pos = 0;

	var a = {
		x: width,
		y: height
	};
	var b = {
		x: 0,
		y: 0
	};
	var count = 0;
	for (y = 0; y < height; y++) {
		for (x = 0; x < width; x++) {
			alpha = data[pos+3];
			if (alpha) {
				if (count < 500) {
					count++;
				}
				if (x < a.x) {//get leftmost colored pixel
					a.x = x;
					// console.log('a.x',a.x)
				}

				if (y < a.y) {//get topmost colored pixel
					a.y = y;
					// console.log('a.y',a.y)
				}

				if (x > b.x) {//get rightmost colored pixel
					b.x = x;
					// console.log('b.x',b.x)
				}

				if (y > b.y) {//get bottommost colored pixel
					b.y = y;
					// console.log('b.y',b.y)
				}
			}
			pos += 4;
		}
	}
	return {
		a: a,
		b: b,
		y: a.y,
		x: a.x,
		width: b.x - a.x + 1,
		height: b.y - a.y + 1
	};
}

exports.fillAreaWithImageAndGetSrc = fillAreaWithImageAndGetSrc;
exports.cropImageAndGetSrc = cropImageAndGetSrc;
exports.drawImageFillArea = drawImageFillArea;
exports.getCanvasFromImage = getCanvasFromImage;
exports.getTrimmedImageCoordinates = getTrimmedImageCoordinates;