'use strict';
require('angular');

var slayer = angular.module('slayer', ['angularFileUpload','ui.tree']);
slayer.controller('GetFilesController', require('./controllers/get-files.js'));
slayer.filter('layersHTML', require('./filters/layers-html.js'));
