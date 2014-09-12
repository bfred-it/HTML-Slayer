'use strict';
module.exports = function() {
  return {
    link: function(scope, element, attrs) {
      attrs.$observe('vbox', function(value) {
        element.attr('viewBox', value);
      });
    }
  };
};