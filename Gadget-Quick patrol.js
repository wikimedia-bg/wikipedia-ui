if ( window.importScript && typeof jQuery == "undefined" ) {
	importScript("МедияУики:Gadget-jQuery.js");
}

/**
	Ajaxify patrol links.
	@uses jQuery
*/
var wgxQuickPatrolLoadRc = false;

addOnloadHook(function(){
	$(".patrollink a").click(function(){
		var $link = $(this).addClass("loading");
		$.post(this.href, function(data){
			$link.after("Версията беше отбелязана като проверена.").remove();
			if ( wgxQuickPatrolLoadRc ) {
				location.href = Creator.createInternUrl("Специални:Последни промени");
			}
		});
		return false;
	});
});