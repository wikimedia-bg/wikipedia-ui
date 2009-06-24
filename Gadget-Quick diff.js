/**
	Enhance recent changes diff links.
	Author: Borislav Manolov
	License: Public domain
*/

if ( window.importScript && ! window.jQuery ) {
	importScript("МедияУики:Gadget-jQuery.js");
}


/**
	@uses jQuery
*/
var QuickDiff = {

	enable: function()
	{
		$("a[href*=diff]").click(function(){
			var $link = $(this).addClass("working");
			$.get(this.href + "&diffonly=1&action=render", function(data){
				QuickDiff.viewDiff(data, $link.offset().top);
				$link.removeClass("working");
			});
			return false;
		});
	},

	viewDiff: function(content, top)
	{
		this.prepareViewer();
		this.viewWindow.css("top", top).html(content).show();
	},

	viewWindow: null,

	prepareViewer: function()
	{
		if ( null !== this.viewWindow ) {
			return;
		}

		importStylesheetURI(stylepath + "/common/diff.css");

		this.viewWindow = $('<div id="quickdiff"/>')
			.css({
				position: "absolute",
				top: 0,
				border: "medium outset silver"
			})
			.dblclick(function(){
				$(this).hide();
			})
			.appendTo("#content");
		if ( window.QuickPattroler ) {
			QuickPattroler.enable();
		}
	}
};

// prepare for fight
addOnloadHook(function(){
	if ( /^(Recentchanges|Watchlist)/.test(wgCanonicalSpecialPageName) ) {
		QuickDiff.enable();
	}
});