/**
 * Enhance recent changes diff links.
 * Author: Borislav Manolov
 * License: Public domain
 * Documentation: [[МедияУики:Gadget-Quick diff.js/doc]]
 */
var KEY_ESC = 27;

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
		this.getViewWindow().css("top", $link.position().top + 30)
			.find("#quickdiff-content").html(content)
			.end().show();
		if (mw.ext && mw.ext.Patroller) {
			new mw.ext.Patroller.bulk(new mw.ext.Patroller.quick()).enable($link[0].href);
		}
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

		if (mw.ext && mw.ext.Patroller) {
			new mw.ext.Patroller.quick().enable();
		}
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
		mw.util.addCSS(
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
				background: url(//upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fileclose.png/16px-Fileclose.png) no-repeat center center;\
				cursor: pointer;\
			}'
		);
	}

};

// prepare for fight
$(function(){
	if ( /^(Recentchanges|Watchlist|Contributions)/.test(mw.config.get('wgCanonicalSpecialPageName'))
			|| mw.config.get('wgAction') === "history"
	) {
		QuickDiff.enable();
	}
});