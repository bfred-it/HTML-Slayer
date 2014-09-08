'use strict';
require('angular-file-upload');
require('angular-ui-tree');
var JSZip = require('jszip');
var saveAs = require('../save-file');
var _ = require('lodash');

var loadImage = require('../image-loader');
var canvasUtils = require('../canvas-utils');

module.exports = ['$scope', '$filter', 'FileUploader', function($scope, $filter, FileUploader) {
	$scope._ = _;

	var layers = $scope.layers = {};
	layers.opts = {};
	layers.opts.thumbnail = {};
	layers.opts.thumbnail.size = 30;
	layers.opts.thumbnail.type = 1;

	layers.list = [];
	layers.Item = function (file, img) {
		var layer = this;
		layer.file = file;

		layer.name = file.name.split('.');
		layer.name.pop();//remove file extension
		layer.name = layer.name.join('.');

		layer.img = img;
		var c = layer.coordinates = canvasUtils.getTrimmedImageCoordinates(img);
		layer.trimmedImg = new Image();
		layer.trimmedImg.src = canvasUtils.cropImageAndGetSrc(img, -c.x, -c.y, c.width, c.height);
		// console.image(layer.trimmedImg.src);


		layer.remove = function () {
			layers.list.splice(layers.list.indexOf(layer), 1);
			layer.destroy();
		};
		layer.destroy = function () {
			console.log('destroying', layer);
			layer.file = null;
			layer.img = null;
		};
	};
	layers.clear = function () {
		_.invoke(layers.list, 'destroy');
		layers.list.length = 0;
	};
	layers.save = function () {
		var zip = new JSZip();

		//save layers
		_.forEach(layers.list, function (layer) {
			var base64 = layer.trimmedImg.src.indexOf('base64,');
			zip.file(layer.file.name, layer.trimmedImg.src.substr(base64+7), {
				base64: true
			});
		});

		zip.file('index.html', $filter('layersHTML')(layers) );

		var content = 'data:application/zip;base64,' + zip.generate();
		saveAs(content, 'HTML layers.zip');
	};
	layers.sortByName = function () {
		layers.list.sort(function(item1, item2) {
			return item1.file.name < item2.file.name;
		});
		$scope.$apply();
	};
	layers.width = null;
	layers.height = null;
	layers.verifySize = function (file) {
		var image = this;
		if (!layers.canvasWidth) {
			layers.width = image.width;
			layers.height = image.height;
		}
		if (image.width === layers.width && image.height === layers.height) {
			layers.list.push(new layers.Item(file, image));
			$scope.$apply();
		}
	};
	layers.loadLayer = function(fileItem) {
		var reader = new FileReader();
		reader.onload = function (event) {
			loadImage(event.target.result, _.partial(layers.verifySize, fileItem._file), true);
		};
		reader.readAsDataURL(fileItem._file);
		fileItem.remove();
	};


	// DRAGGED FILES MANAGER
	var uploader = $scope.uploader = new FileUploader();
	uploader.filters.push({
		name: 'imageFilter',
		fn: function(item /*{File|FileLikeObject}*/) {
			var type = item.type.split('/').pop();
			return type === 'png';
		}
	});
	uploader.onAfterAddingFile = layers.loadLayer;

	uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
		console.info('onWhenAddingFileFailed', item, filter, options);
	};
	// uploader.onAfterAddingFile = function(fileItem) {
	// 	console.info('onAfterAddingFile', fileItem);
	// };
	uploader.onAfterAddingAll = function(addedFileItems) {
		console.info('onAfterAddingAll', addedFileItems);
	};
	uploader.onBeforeUploadItem = function(item) {
		console.info('onBeforeUploadItem', item);
	};
	uploader.onProgressItem = function(fileItem, progress) {
		console.info('onProgressItem', fileItem, progress);
	};
	uploader.onProgressAll = function(progress) {
		console.info('onProgressAll', progress);
	};
	uploader.onSuccessItem = function(fileItem, response, status, headers) {
		console.info('onSuccessItem', fileItem, response, status, headers);
	};
	uploader.onErrorItem = function(fileItem, response, status, headers) {
		console.info('onErrorItem', fileItem, response, status, headers);
	};
	uploader.onCancelItem = function(fileItem, response, status, headers) {
		console.info('onCancelItem', fileItem, response, status, headers);
	};
	uploader.onCompleteItem = function(fileItem, response, status, headers) {
		console.info('onCompleteItem', fileItem, response, status, headers);
	};
	uploader.onCompleteAll = function() {
		console.info('onCompleteAll');
	};

	console.info('uploader', uploader);
}];