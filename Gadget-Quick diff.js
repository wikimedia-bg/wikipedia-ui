/**
 * Enhance recent changes diff links.
 * Author: Borislav Manolov
 * License: Public domain
 * Documentation: [[МедияУики:Gadget-Quick diff.js/doc]]
 */


if ( window.importScript && ! window.jQuery ) {
	importScript("МедияУики:Gadget-jQuery.js");
}

var KEY_ESC = 27;

/**
 * @uses jQuery
 */
var QuickDiff = {

	enable: function()
	{
		jQuery('a[href*="diff="]').click(function(event){
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
		this.getViewWindow().css("top", $link.offset().top)
			.find("#quickdiff-content").html(content)
			.end().show();
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

		mw.loader.load("mediawiki.action.history.diff", "text/css");
		this.addCss();

		this.enableQuickPatroller();
	},

	buildViewWindow: function()
	{
		var $win = jQuery('<div id="quickdiff"><div id="quickdiff-close"/><div id="quickdiff-content"/></div>');
		var closeWin = function(){
			$win.hide();
		};
		$win.dblclick(closeWin).appendTo("#bodyContent").find("#quickdiff-close").click(closeWin);
		$(document).keyup(function(e) {
			if (e.keyCode == KEY_ESC) { closeWin() }
		});

		return $win;
	},

	addCss: function()
	{
		appendCSS(
			'#quickdiff {\
				position: absolute;\
				width: 100%;\
				border: thin outset silver;\
				box-shadow: 0 0 30px #888888;\
				background-color: white;\
			}\
			#quickdiff-close {\
				position: absolute;\
				top: 0;\
				right: 0;\
				width: 20px;\
				height: 20px;\
				background: url(http://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fileclose.png/16px-Fileclose.png) no-repeat center center;\
				cursor: pointer;\
			}'
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