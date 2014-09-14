'use strict';
require('angular-file-upload');
require('ngstorage');
var JSZip = require('jszip');
var saveAs = require('../save-file');
var _ = require('lodash');

var loadImage = require('../image-loader');
var canvasUtils = require('../canvas-utils');

module.exports = ['$scope', '$filter', '$localStorage', 'FileUploader', function($scope, $filter, $localStorage, FileUploader) {
	$scope._ = _;

	var layers = $scope.layers = $scope;

	var opts = {};
	opts.thumbnail = {};
	opts.thumbnail.size = 30;
	opts.thumbnail.type = 1;

	opts.output = {};
	opts.output.attribute = 'id';
	opts.output.useTrimmedCanvas = true;
	opts.output.previewCode = true;
	opts.output.showOptions = true;
	layers.opts = $localStorage.$default(opts);

	layers.list = [];
	var Item = function (file, img) {
		var layer = this;
		layer.file = file;

		layer.name = file.name.split('.');
		layer.name.pop();//remove file extension
		layer.name = layer.name.join('.');

		layer.img = img;
		var c = layer.coordinates = canvasUtils.getTrimmedImageCoordinates(img);
		layer.coordinates.get = function (coordinateName) {
			var coordinateVal = layer.coordinates[coordinateName];
			if (layers.opts.output.useTrimmedCanvas) {
				return coordinateVal - layers.trimmed.a[coordinateName];
			}
			return coordinateVal;
		};

		layer.trimmedImg = new Image();
		layer.trimmedImg.src = canvasUtils.cropImageAndGetSrc(img, -c.x, -c.y, c.width, c.height);
		// console.image(layer.trimmedImg.src);


		layer.remove = function () {
			var list = layer.findLayerGroup();

			if (list) {
				for (var i = 0, l = layer.list.length; i < l; i++) {
					layer.list[i].remove();
				}
				list.splice(list.indexOf(layer), 1);
				layer.destroy();
				console.log('Layer', layer.name, 'removed');
			}
		};
		layer.findLayerGroup = function () {
			return (function walkLevel(list) {
				var parent;
				for (var i = 0, l = list.length; i < l; i++) {
					if (list.indexOf(layer) >= 0) {
						return list;
					}
					parent = walkLevel(list[i].list);
					if (parent) {
						return parent;
					}
				}
				return false;
			} (layers.list));
		};
		layer.destroy = function () {
			// console.log('destroying', layer);
			layer.file = null;
			layer.img = null;
		};
		layer.list = [];
	};
	layers.clear = function () {
		while(layers.list.length) {
			layers.list[0].remove();
		}
	};
	layers.save = function () {
		var zip = new JSZip();
		var folder = zip;
		var namespace = layers.opts.output.namespace;
		var zipName = 'HTML layers.zip';
		if (namespace) {
			namespace = namespace.replace(/[-_]+$/,'').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
			folder = zip.folder(namespace);
			zipName = namespace + '.layers.zip';
		}

		//save layers
		_.forEach(layers.list, function (layer) {
			var base64 = layer.trimmedImg.src.split('base64,', 2).pop();
			folder.file(layer.file.name, base64, {
				base64: true
			});
		});

		zip.file('index.html', $filter('layersHTML')(layers) );

		var content = 'data:application/zip;base64,' + zip.generate();
		saveAs(content, zipName);
	};
	var sortAscending = false;
	layers.sortByName = function () {
		layers.list = _.sortBy(layers.list, 'name');
		if (!sortAscending) {
			layers.list.reverse();
		}
		sortAscending = !sortAscending;
		// $scope.$apply();
	};
	layers.width = null;
	layers.height = null;
	layers.trimmed = {};
	layers.getFlattenedList = function () {
		var flattened = [];
		(function walkLevel(list) {
			for (var i = 0, l = list.length; i < l; i++) {
				flattened.push(list[i]);
				walkLevel(list[i].list);
			}
		} (layers.list));
		// console.log(_.pluck(fl attened, 'name'));
		return flattened;
	};
	layers.updateTrimmedCoordinates = function () {
		var a = {
			x: layers.width,
			y: layers.height
		};
		var b = {
			x: 0,
			y: 0
		};
		var layerCoordinates;
		var list = layers.getFlattenedList();
		for (var i = 0; i < list.length; i++) {
			layerCoordinates = list[i].coordinates;
			if (layerCoordinates.a.x < a.x) {
				a.x = layerCoordinates.a.x;
			}
			if (layerCoordinates.a.y < a.y) {
				a.y = layerCoordinates.a.y;
			}
			if (layerCoordinates.b.x > b.x) {
				b.x = layerCoordinates.b.x;
			}
			if (layerCoordinates.b.y > b.y) {
				b.y = layerCoordinates.b.y;
			}
		}
		layers.trimmed = {
			a: a,
			b: b,
			y: a.y,
			x: a.x,
			width: b.x - a.x + 1,
			height: b.y - a.y + 1
		};
	};
	layers.getTrimmedHeight = function () {
		var minX = layers.width;
		var maxX = 0;
		var layerCoordinates;
		var list = layers.getFlattenedList();
		for (var i = 0; i < list.length; i++) {
			layerCoordinates = list[i].coordinates;
			if (layerCoordinates.a.x < minX) {
				minX = layerCoordinates.a.x;
			}
			if (layerCoordinates.b.x > minX) {
				maxX = layerCoordinates.b.x;
			}
		}
		return maxX - minX;

	};
	layers.verifySize = function (file) {
		var image = this;
		if (!layers.canvasWidth) {
			layers.width = image.width;
			layers.height = image.height;
		}
		if (image.width === layers.width && image.height === layers.height) {
			layers.list.push(new Item(file, image));
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

	$scope.$watchCollection('layers.list', layers.updateTrimmedCoordinates);


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

	var userIsInformed = false;
	uploader.onWhenAddingFileFailed = function() {
		if (!userIsInformed) {
			alert('Slayer uses transparent pixels to trim images, use PNG images only');
			userIsInformed = true;
		}
	};
}];