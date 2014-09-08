'use strict';

var _ = require('lodash');
var formatHTML = _.template('<div style="position: relative; width: <%- width %>px; height: <%- height %>px;"> \n<% _.forEach(list, function(layer) { %>\t<img style="position: absolute; top: <%- layer.coordinates.y %>px; left: <%- layer.coordinates.x %>px;" src="<%- layer.file.name %>" id="<%- layer.name %>" alt="" /> \n<% }); %></div>');
module.exports = function() {
  return function(input) {
  	return formatHTML(input);
  };
};