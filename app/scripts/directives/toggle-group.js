'use strict';
module.exports = function() {
	return {
		restrict: 'A',
		transclude: true,
		template: '<div ng-transclude></div>'
	};
};