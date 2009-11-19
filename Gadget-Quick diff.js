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
		jQuery("a[href*=diff=]").click(function(event){
			var $link = jQuery(this).addClass("working");
			var href = this.href + "&action=render"
				+ ( event.ctrlKey ? "" : "&diffonly=1" );
			jQuery.get(href, function(data){
				QuickDiff.viewDiff(data, $link);
				$link.removeClass("working").addClass("done");
			});
			return false;
		});
	},

	viewDiff: function(content, $link)
	{
		this.getViewWindow().css("top", $link.offset().top).html(content).show();
		this.enableBunchPatroller($link);
	},

	viewWindow: null,

	getViewWindow: function()
	{
		if ( null === this.viewWindow ) {
			this.prepareViewWindow();
		}

		return this.viewWindow;
	},

	prepareViewWindow: function()
	{
		this.viewWindow = this.buildViewWindow();

		importStylesheetURI(stylepath + "/common/diff.css");
		this.addCss();

		this.enableQuickPatroller();
	},

	buildViewWindow: function()
	{
		return jQuery('<div id="quickdiff"/>')
			.css({ position: "absolute" })
			.dblclick(function(){
				jQuery(this).hide();
			})
			.appendTo("#content");
	},

	addCss: function()
	{
		appendCSS('#quickdiff {'
			+ '	border: medium outset silver;'
			+ '	background-color: white;'
			+ '}'
		);
	},

	enableQuickPatroller: function()
	{
		if ( window.QuickPattroler ) QuickPattroler.enable();
	},

	enableBunchPatroller: function($link)
	{
		if ( window.BunchPatroller ) {
			WebRequest.setRequestUrl($link[0].href);
			BunchPatroller.enable();
		}
	}
};

// prepare for fight
addOnloadHook(function(){
	if ( /^(Recentchanges|Watchlist|Contributions)/.test(wgCanonicalSpecialPageName)
			|| "history" == wgAction
	) {
		QuickDiff.enable();
	}
});