'use strict';
var jade = require('jade');
var _ = require('lodash');
var formatHTML = jade.compile(require('./layers-html.jade'), {
	pretty: '\t'
});

// var template = require('./layers-html.html');
// var formatHTML = _.template(template);
module.exports = function() {
	return function(ls) {
		ls.__ = {};
		ls.__ = {};

		if (ls.opts.output.useTrimmedCanvas) {
			ls.__.width = ls.trimmed.width;
			ls.__.height = ls.trimmed.height;
		} else {
			ls.__.width = ls.width;
			ls.__.height = ls.height;
		}
		ls.__.style = [
			'position: relative',
			'width: ' + ls.__.width + 'px',
			'height: ' + ls.__.height + 'px'
		];

		if (ls.opts.output.attribute && ls.opts.output.namespace) {
			ls.__[ls.opts.output.attribute] = ls.opts.output.namespace.replace(/[-_]+$/,'');
		}

		var adjustLayers = function (list) {
			_.forEach(list, function (layer) {
				layer.__ = {};

				layer.__.style = [
					'position: absolute',
					'top: ' + layer.coordinates.get('y') + 'px',
					'left: ' + layer.coordinates.get('x') + 'px'
				];

				if (ls.opts.output.attribute) {
					var prefix = '';
					if (ls.opts.output.namespace) {
						prefix = ls.opts.output.namespace;
						if (/[^-_]$/.test(prefix)) {
							prefix = prefix + '-';
						}
					}
					layer.__[ls.opts.output.attribute] = prefix + layer.name;
				}

				if (ls.opts.output.namespace) {
					layer.__.filename = ls.opts.output.namespace.replace(/[-_]+$/,'').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+'/' + layer.file.name;
				} else {
					layer.__.filename = layer.file.name;
				}

				if (!ls.opts.output.imgTag) {
					layer.__.style.push('width: '+layer.coordinates.width+'px');
					layer.__.style.push('height: '+layer.coordinates.height+'px');
					layer.__.style.push('background-image: url('+layer.__.filename+')');
				}

				//recursive
				adjustLayers(layer.list);
			});
		};
		adjustLayers(ls.list);
		return formatHTML(ls);
	};
};