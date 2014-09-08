'use strict';

var _ = require('lodash');
var template = require('./layers-html.html');
var formatHTML = _.template(template);
module.exports = function() {
  return function(input) {
  	return formatHTML(input);
  };
};