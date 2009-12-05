/**
	Enhance recent changes patrol.
	Author: Borislav Manolov
	License: Public domain
	Documentation: [[МедияУики:Gadget-Quick patrol.js/doc]]
*/

if ( window.importScript && ! window.jQuery ) {
	importScript("МедияУики:Gadget-jQuery.js");
}


var WebRequest = {
	/** Get a parameter from the requested URL */
	getParam: function(param)
	{
		var m = this.getRequestUrl().match( new RegExp("[?&]" + param + "=([^&#]*)") );
		return null === m ? null : m[1];
	},

	requestUrl: null,

	getRequestUrl: function()
	{
		return this.requestUrl || location.href;
	},

	setRequestUrl: function(url)
	{
		this.requestUrl = url;
	}
};

gLang.addMessages({
	"markaspatrolledtext1" : "Отбелязване на следната редакция като проверена",
	"markaspatrolledtext"  : "Отбелязване на следните $1 редакции като проверени",
	"markedaspatrolledtext1": "Редакцията беше отбелязана като проверена.",
	"markedaspatrolledtext" : "Готово.",
	"showalldiffs"      : "Показване на редакциите",
	"recentchangespage" : "Специални:Последни промени",
	"nchanges"          : "\\d+ промени"
}, "bg");

/**
	Ajaxify patrol links.
	@uses jQuery
*/
var QuickPattroler = {
	linkClassWorking: "working",

	enable: function()
	{
		jQuery(".patrollink a").live("click", function(){
			QuickPattroler.executePatrol(this);
			return false;
		});
	},

	executePatrol: function(link)
	{
		var $link = jQuery(link).addClass( this.linkClassWorking );
		jQuery.post(link.href, function(data){
			$link.replaceWith( gLang.msg("markedaspatrolledtext1") );
			QuickPattroler.gotoRcIfWanted();
		});
	},

	gotoRcIfWanted: function()
	{
		if ( window.wgxQuickPatrolLoadRc && wgxQuickPatrolLoadRc ) {
			location.href = Creator.createInternUrl( gLang.msg("recentchangespage") );
		}
	}
};

/**
	Enable bunch patrolling when multiple edits are reviewed at once
	thru the enhanced recent changes
	@uses jQuery
*/
var BunchPatroller = {

	apiPath: wgScriptPath + "/api.php",
	rcidsParam: "rcids",
	diffsParam: "diffs",
	paramDelim: ",",
	bunchDiffLinkClass: "bunch-duff-link",
	diffLinkClass: "duff-link",
	diffLinkClassDone: "done",
	diffLinkClassNotDone: "not-done",
	classLoading: "loading",

	/* track number of patrolled edits */
	numEditsPatrolled: 0,

	/* error codes returned from API */
	errors: [],

	/** Works on Special:Recentchanges */
	makeBunchDiffsPatrollable: function()
	{
		jQuery("div.mw-changeslist-hidden").each(function(){
			BunchPatroller.makeBunchDiffPatrollable(this);
		});
	},

	makeBunchDiffPatrollable: function(changeslist)
	{
		var $rcidLinks = jQuery("a[href*=rcid]", changeslist);
		var rcids = BunchPatroller.getJoinedValueFromHrefs($rcidLinks, /rcid=(\d+)/);
		if ( "" !== rcids ) {
			var diffs = BunchPatroller.getJoinedValueFromHrefs($rcidLinks, /diff=(\d+)/, /oldid=(\d+)/);
			this.enhanceBunchDiffLink(jQuery(changeslist).prev(), rcids, diffs);
		}
	},

	getJoinedValueFromHrefs: function($links, regexp, regexpAlt)
	{
		return $links.map(function(){
			var m = jQuery(this).attr("href").match(regexp);
			if ( null === m && typeof regexpAlt == "object" ) {
				// test the fallback regexp
				m = jQuery(this).attr("href").match(regexpAlt);
			}
			return null === m ? 0 : m[1];
		}).get().join(this.paramDelim);
	},

	/**
		Add extra parameters to the href attribute of the bunch diff link.
		If there is no diff link (by new pages) one is created.
	*/
	enhanceBunchDiffLink: function($holder, rcids, diffs)
	{
		var extraParams = "&" + BunchPatroller.rcidsParam + "=" + rcids
			+ "&" + BunchPatroller.diffsParam + "=" + diffs;

		var $link = jQuery("a[href*=diff]", $holder);
		if ( $link.length ) {
			$link.attr("href", function(){
				return this.href + extraParams;
			}).addClass( BunchPatroller.bunchDiffLinkClass );
		} else {
			this.addBunchDiffLinkTo(
				jQuery("td:eq(1)", $holder), // second table cell
				diffs.split(this.paramDelim).shift(), // first id
				extraParams
			);
		}
	},

	addBunchDiffLinkTo: function($holder, diff, extraParams)
	{
		$holder.html( $holder.html().replace(
			new RegExp( gLang.msg("nchanges") ),
			'<a href="' + wgScript + "?diff=" + diff + "&oldid=" + diff + extraParams
				+ '" class="' + BunchPatroller.bunchDiffLinkClass + '">$&</a>') );
	},

	/** Works on diff pages */
	enable: function()
	{
		$bunchPatrolLinkHolder = jQuery("#mw-diff-ntitle4");
		if ( 0 == $bunchPatrolLinkHolder.length ) {
			return; // not a diff page, get out of here
		}

		var rcidsRaw = WebRequest.getParam(this.rcidsParam);
		if ( ! rcidsRaw ) {
			return; // no rcids to patrol
		}

		var rcids = rcidsRaw.split(this.paramDelim);
		this.addPatrolLinkTo($bunchPatrolLinkHolder, rcids);

		var diffs = WebRequest.getParam(this.diffsParam).split(this.paramDelim);
		this.addDiffLinksTo($bunchPatrolLinkHolder, rcids, diffs);

		this.addShowAllDiffsLinkTo($bunchPatrolLinkHolder);
	},

	addPatrolLinkTo: function($holder, rcids)
	{
		if ( $holder.children().length ) {
			$holder.append("<br/>");
		}
		jQuery('<a href="#executePatrol"/>')
			.text( rcids.length == 1
				? gLang.msg("markaspatrolledtext1")
				: gLang.msg("markaspatrolledtext", rcids.length) )
			.click(function(){
				jQuery(this).addClass( QuickPattroler.linkClassWorking );
				BunchPatroller.executePatrol(rcids, this);
				return false;
			})
			.appendTo($holder);
	},

	addDiffLinksTo: function($holder, rcids, diffs)
	{
		var $list = jQuery("<ul/>");
		jQuery.each(diffs, function(i, diff){
			$list.append( BunchPatroller.getDiffLink(rcids[i], diff) );
		});
		$list.appendTo($holder);
	},

	addShowAllDiffsLinkTo: function($holder)
	{
		jQuery('<a href="#alldiffs"/>')
			.text( gLang.msg("showalldiffs") )
			.click(function(){
				$all = jQuery('<div id="alldiffs"/>').insertAfter( $holder.parents(".diff") );

				jQuery("." + BunchPatroller.diffLinkClass, $holder).each(function(){
					BunchPatroller.loadDiffContentFor(this, $all);
				});

				jQuery(this).remove();
			})
			.appendTo($holder);
	},

	loadDiffContentFor: function(link, $holder)
	{
		var $out = jQuery("<div/>").appendTo($holder).addClass(this.classLoading).before("<hr/>");

		jQuery.get(link.href + "&diffonly=1&action=render", function(data){
			$out.html(data).removeClass( BunchPatroller.classLoading );
		});
	},

	getDiffLink: function(rcid, diff)
	{
		return '<li><a'
			+ ' id="' + this.getDiffLinkId(rcid) + '"'
			+ ' class="' + this.diffLinkClass + '"'
			+ ' href="' + wgScript + '?oldid=prev&diff=' + diff + '&rcid=' + rcid + '"'
			+ '>' + diff +'</a></li>';
	},

	getDiffLinkId: function(rcid)
	{
		return "diff-link-" + rcid;
	},

	executePatrol: function(rcids, motherLink)
	{
		var token = this.getToken();

		jQuery.each(rcids, function(i, rcid){
			BunchPatroller.executePatrolOne(token, rcid);
		});

		this.executeOnPatrolDone(function() {
			if ( BunchPatroller.checkForBadToken() ) {
				BunchPatroller.restartPatrol(rcids, motherLink);
				return;
			}
			jQuery(motherLink).replaceWith( gLang.msg("markedaspatrolledtext") );
			QuickPattroler.gotoRcIfWanted();
		}, rcids);
	},

	restartPatrol: function(rcids, motherLink)
	{
		this.errors = [];
		this.numEditsPatrolled = 0;
		jQuery("." + this.diffLinkClass).removeClass(BunchPatroller.diffLinkClassNotDone);
		BunchPatroller.clearToken().executePatrol(rcids, motherLink);
	},

	intervalId: 0,
	executeOnPatrolDone: function(callback, rcids)
	{
		this.intervalId = setInterval(function(){
			if ( BunchPatroller.numEditsPatrolled >= rcids.length ) {
				clearInterval(BunchPatroller.intervalId);
				callback();
			}
		}, 200);
	},

	executePatrolOne: function(token, rcid)
	{
		var $diffLink = jQuery("#" + BunchPatroller.getDiffLinkId(rcid));
		$diffLink.addClass( QuickPattroler.linkClassWorking );
		jQuery.post(BunchPatroller.apiPath, {
			action : "patrol",
			token  : token,
			rcid   : rcid,
			format : "json"
		}, function(data){
			$diffLink.removeClass( QuickPattroler.linkClassWorking );
			if ( data.error ) {
				$diffLink.addClass(BunchPatroller.diffLinkClassNotDone);
				BunchPatroller.handleError(data.error, $diffLink);
			} else {
				$diffLink.addClass(BunchPatroller.diffLinkClassDone);
			}
			BunchPatroller.numEditsPatrolled++;
		}, "json");
	},

	handleError: function(error, $diffLink)
	{
		this.errors.push(error.code);
		$diffLink.attr("title", error.info);
	},

	checkForBadToken: function()
	{
		return inArray("badtoken", this.errors);
	},

	tokenCookie: "patrolToken",

	getToken: function()
	{
		var token = Cookie.read(this.tokenCookie);
		if ( ! token ) {
			token = this.getTokenFromApi();
			Cookie.create(this.tokenCookie, token);
		}

		return token;
	},

	getTokenFromApi: function()
	{
		var token = null;
		jQuery.ajax({
			type:     "GET",
			url:       this.apiPath + "?action=query&list=recentchanges"
						+ "&rctoken=patrol&rclimit=1&format=json",
			async:     false,
			dataType: "json",
			success:  function(data){
				token = data.query.recentchanges[0].patroltoken;
			}
		});
		return token;
	},

	clearToken: function()
	{
		Cookie.erase(this.tokenCookie);
		return this;
	}

};

// prepare for fight
addOnloadHook(function(){
	if ( /^(Recentchanges|Watchlist)/.test(wgCanonicalSpecialPageName) ) {
		BunchPatroller.makeBunchDiffsPatrollable();
	} else if ( "view" == wgAction ) {
		QuickPattroler.enable();
		BunchPatroller.enable();
	}
});