if ( window.importScript && typeof jQuery == "undefined" ) {
	importScript("МедияУики:Gadget-jQuery.js");
}

/**
	Ajaxify patrol links.
	@uses jQuery
*/
addOnloadHook(function(){
	$("div.patrollink a").click(function(){
		var $link = $(this);
		$.post(this.href, function(data){
			$link.after("{{MediaWiki:Markedaspatrolledtext}}").remove();
		});
		return false;
	});
});