'use strict';
require('angular-ui-tree');

module.exports = function($scope) {
	$scope.options = {
		dropped: function () {
			$scope.updateTrimmedCoordinates();
		}
	};
};