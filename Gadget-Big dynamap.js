importScript("МедияУики:JQuery.js");

/** 
	Create a bigger map for each [[Шаблон:ПК|dynamic map]].
	The new map should be shown on a mouse click.
	The old image links are disabled.
	@uses jQuery
*/
addOnloadHook(function() {
	var _dynamapDone = false;
	$("div.dynamap").each(function(){
		if ( _dynamapDone ) {
			return false;
		}

		var newMap = $(this).clone();
		var newImg = $("img", newMap).eq(0); // the map image
		var oldWidth = newImg[0].width;
		var newWidth = 600;
		newImg[0].src = newImg[0].src.replace(/\d+px/, newWidth + "px");
		newImg[0].width = newWidth;
		newImg[0].height *= (newWidth / oldWidth);

		var mapOffset = $(this).offset();
		newMap.css({
			"z-index" : 10,
			position  : "absolute",
			display   : "none",
			width     : newWidth + "px",
			top       : mapOffset.top,
			left      : mapOffset.left - ( newWidth - oldWidth ) + 5
		}).click(function(){
			$(this).hide();
			return false;
		}).appendTo(document.body);

		$("a", this).click(function(){
			newMap.show();
			return false;
		});

		_dynamapDone = true;
		return false;
	});
});