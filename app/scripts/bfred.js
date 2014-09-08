'use strict';
require('angular');

var slayer = angular.module('slayer', ['angularFileUpload','ui.tree']);
slayer.controller('SlayerController', require('./controllers/slayer.js'));
slayer.filter('layersHTML', require('./filters/layers-html.js'));