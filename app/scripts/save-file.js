'use strict';
module.exports = function saveAs(uri, filename) {
	var link = document.createElement('a');
	if (typeof link.download === 'string') {
		document.body.appendChild(link);
		link.download = filename;
		link.href = uri;
		link.click();
		document.body.removeChild(link);
	} else {
		location.replace(uri);
	}
};