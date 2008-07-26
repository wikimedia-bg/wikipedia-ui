/**
	Try to hilite locally uploaded images.
	Add “LOCAL” to the title of the image parent.

	License: Public domain
	Author: Borislav Manolov
*/

addOnloadHook(function() {
	var sharedRepoKey = "wikipedia/commons/";
	var prefix = "LOCAL — ";

	var imgs = document.getElementsByTagName("img");
	for (var i = 0, img; img = imgs[i]; i++) {
		if ( img.src.indexOf(sharedRepoKey) == -1 ) {
			// change anchor title — browsers show this instead of img.alt/title
			img.parentNode.title = prefix + img.parentNode.title;
		}
	}
});