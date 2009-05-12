if ( window.importScript && !jQuery ) {
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
			$link.after("{{int:Markedaspatrolledtext}}").remove();
		});
		return false;
	});
});