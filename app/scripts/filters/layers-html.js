'use strict';

var _ = require('lodash');
var template = require('./layers-html.html');
var formatHTML = _.template(template);
module.exports = function() {
	return function(ls) {
		ls.__ = {};

		if (ls.opts.output.useTrimmedCanvas) {
			ls.__.width = ls.trimmed.width;
			ls.__.height = ls.trimmed.height;
		} else {
			ls.__.width = ls.width;
			ls.__.height = ls.height;
		}
		ls.__.style = [
			'position: relative;',
			'width: ' + ls.__.width + 'px;',
			'height: ' + ls.__.height + 'px;'
		];

		if (ls.opts.output.attribute && ls.opts.output.namespace) {
			ls.__.idAttr = ls.opts.output.attribute + '="' + ls.opts.output.namespace.replace(/[-_]+$/,'') + '" ';
		}

		_.forEach(ls.list, function (layer) {
			layer._ = {};

			layer._.style = [
				'position: absolute;',
				'top: ' + layer.coordinates.get('y') + 'px;',
				'left: ' + layer.coordinates.get('x') + 'px;'
			];

			if (ls.opts.output.attribute) {
				layer._.idAttr = ls.opts.output.attribute + '="' + (ls.opts.output.namespace?ls.opts.output.namespace:'')+layer.name + '" ';
			}

			if (ls.opts.output.namespace) {
				layer._.filename = ls.opts.output.namespace.replace(/[-_]+$/,'').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+'/' + layer.file.name;
			} else {
				layer._.filename = layer.file.name;
			}
		});
		return formatHTML(ls);
	};
};