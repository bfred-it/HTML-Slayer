'use strict';
require('angular');

var slayer = angular.module('slayer', ['angularFileUpload','ui.tree', 'ngStorage']);
slayer.controller('SlayerController', require('./controllers/slayer.js'));
slayer.filter('layersHTML', require('./filters/layers-html.js'));//http://currentlyunderdevelopment.blogspot.it/2013/03/recursive-handlebars-templates-made-easy.html
slayer.directive('vbox', require('./directives/svg-viewbox.js'));
// slayer.directive('ToggleGroupDirective', require('./directives/toggle-group.js'));