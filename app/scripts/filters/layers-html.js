'use strict';
var jade = require('jade');
var _ = require('lodash');
var formatHTML = jade.compile(require('./layers-html.jade'), {
	pretty: '\t'
});

function composeCssText (obj) {
	return _.reduce(obj, function (list, val, prop) {
		if (typeof val === 'number' && val !== 0) {
			val = val + 'px';
		}
		list.push(prop+': '+val);
		return list;
	}, []).join('; ');
}
function applyOffset (style, offset) {
	if (offset.left) {
		style.left -= offset.left;
	}
	if (offset.top) {
		style.top -= offset.top;
	}
}

// var template = require('./layers-html.html');
// var formatHTML = _.template(template);
module.exports = function() {
	return function(ls) {
		ls.__ = {};

		ls.__.style = {};
		ls.__.style.position = 'relative';
		if (ls.opts.output.useTrimmedCanvas) {
			ls.__.style.width = ls.trimmed.width;
			ls.__.style.height = ls.trimmed.height;
		} else {
			ls.__.style.width = ls.width;
			ls.__.style.height = ls.height;
		}
		ls.__.style = composeCssText(ls.__.style);

		if (ls.opts.output.attribute && ls.opts.output.namespace) {
			ls.__[ls.opts.output.attribute] = ls.opts.output.namespace.replace(/[-_]+$/,'');
		}

		var adjustLayers = function (list, levelOffset) {
			_.forEach(list, function (layer) {
				layer.__ = {};
				layer.__.style = {};

				var positionedEl = layer.__;
				var isParent = layer.list.length && !ls.opts.output.createGroups;
				var offset = levelOffset || {
					left: 0,
					top: 0
				};

				if (isParent) {
					layer.__.group = {};
					layer.__.group.style = {};
					positionedEl = layer.__.group;
				} else {
					positionedEl = layer.__;
				}

				if (ls.opts.output.attribute) {
					var prefix = '';
					if (ls.opts.output.namespace) {
						prefix = ls.opts.output.namespace;
						if (/[^-_]$/.test(prefix)) {
							prefix = prefix + '-';
						}
					}
					positionedEl[ls.opts.output.attribute] = prefix + layer.name;
				}

				if (ls.opts.output.namespace) {
					layer.__.filename = ls.opts.output.namespace.replace(/[-_]+$/,'').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+'/' + layer.file.name;
				} else {
					layer.__.filename = layer.file.name;
				}


				positionedEl.style.position = 'absolute';
				positionedEl.style.left = layer.coordinates.get('x');
				positionedEl.style.top = layer.coordinates.get('y');

				var offsetLeft = positionedEl.style.left;
				var offsetTop = positionedEl.style.top;

				//offset should be adjusted to consider parents' offsets
				applyOffset(positionedEl.style, offset);

				if (isParent) {
					offset.left = offsetLeft;
					offset.top = offsetTop;
				}

				if (!ls.opts.output.imgTag) {
					positionedEl.style.width = layer.coordinates.width;
					positionedEl.style.height = layer.coordinates.height;
					positionedEl.style.background = 'url(' + layer.__.filename + ')';
				}


				//compose css
				layer.__.style = composeCssText(layer.__.style);
				if (!layer.__.style) {
					delete layer.__.style;
				}
				if (isParent) {
					layer.__.group.style = composeCssText(layer.__.group.style);
				}

				//recursive
				adjustLayers(layer.list, offset);
			});
		};
		adjustLayers(ls.list);
		return formatHTML(ls);
	};
};