if ( window.importScript && ! window.jQuery ) {
	importScript("МедияУики:Gadget-jQuery.js");
}

/**
	Create a bigger map for each [[Шаблон:ПК|dynamic map]].
	The new map should be shown on a mouse click.
	The old image links are disabled.
	@uses jQuery
*/
addOnloadHook(function() {
	jQuery("div.dynamap").each(function(){
		var newMap = jQuery(this).clone();
		var newImg = jQuery("img", newMap).eq(0); // the map image
		var oldWidth = newImg[0].width;
		var newWidth = 600;
		newImg[0].src = newImg[0].src.replace(/\d+(px)/, newWidth + "$1");
		newImg[0].width = newWidth;
		newImg[0].height *= newWidth / oldWidth;

		var mapOffset = jQuery(this).offset();
		newMap.css({
			"z-index" : 10,
			position  : "absolute",
			top       : mapOffset.top,
			left      : mapOffset.left - ( newWidth - oldWidth ) + 5,
			width     : newWidth + "px"
		}).click(function(){
			jQuery(this).hide();
			return false;
		}).hide().appendTo(document.body);

		jQuery("a", this).click(function(){
			newMap.show();
			return false; // tell the browser to not follow the image link
		});
	});
});