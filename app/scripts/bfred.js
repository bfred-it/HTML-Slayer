'use strict';
require('angular');

var slayer = angular.module('slayer', ['angularFileUpload','ui.tree', 'ngStorage']);
slayer.controller('SlayerController', require('./controllers/slayer.js'));
slayer.filter('layersHTML', require('./filters/layers-html.js'));
slayer.directive('vbox', require('./directives/svg-viewbox.js'));
// slayer.directive('ToggleGroupDirective', require('./directives/toggle-group.js'));