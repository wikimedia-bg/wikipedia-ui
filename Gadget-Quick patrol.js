if ( window.importScript && typeof jQuery == "undefined" ) {
	importScript("МедияУики:Gadget-jQuery.js");
}

/**
	Ajaxify patrol links.
	@uses jQuery
*/
addOnloadHook(function(){
	$(".patrollink a").click(function(){
		var $link = $(this).addClass("loading");
		$.post(this.href, function(data){
			$link.after("Версията беше отбелязана като проверена.").remove();
		});
		return false;
	});
});