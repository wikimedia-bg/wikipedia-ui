/**
	Enhance recent changes patrol.
	Author: Borislav Manolov
	License: Public domain
*/

if ( window.importScript && typeof jQuery == "undefined" ) {
	importScript("МедияУики:Gadget-jQuery.js");
}


var WebRequest = {
	/** Get a parameter from the URL */
	getParam: function(param)
	{
		var m = location.href.match( new RegExp("[?&]" + param + "=([^&#]*)") );
		return null === m ? null : m[1];
	}
};

gLang.addMessages({
	"markaspatrolledtext1" : "Отбелязване на следната редакция като проверена",
	"markaspatrolledtext"  : "Отбелязване на следните $1 редакции като проверени",
	"markedaspatrolledtext1": "Редакцията беше отбелязана като проверена.",
	"markedaspatrolledtext" : "Готово.",
	"firstrevision"     : "Първа",
	"recentchangespage" : "Специални:Последни промени",
	"nchanges"          : "\\d+ промени"
}, "bg");

/**
	Ajaxify patrol links.
	@uses jQuery
*/
var QuickPattroler = {
	linkClassLoading: "loading",

	ajaxifyLinks: function()
	{
		$(".patrollink a").click(function(){
			QuickPattroler.executePatrol(this);
			return false;
		});
	},

	executePatrol: function(link)
	{
		var $link = $(link).addClass( this.linkClassLoading );
		$.post(link.href, function(data){
			$link.replaceWith( gLang.msg("markedaspatrolledtext1") );
			QuickPattroler.gotoRcIfWanted();
		});
	},

	gotoRcIfWanted: function()
	{
		if ( typeof wgxQuickPatrolLoadRc == "boolean" && wgxQuickPatrolLoadRc ) {
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
	diffLinkClassDone: "done",
	diffLinkClassNotDone: "not-done",

	/** Works on Special:Recentchanges */
	makeBunchDiffsPatrollable: function()
	{
		$("div.mw-changeslist-hidden").each(function(){
			BunchPatroller.makeBunchDiffPatrollable(this);
		});
	},

	makeBunchDiffPatrollable: function(changeslist)
	{
		var $rcidLinks = $("a[href*=rcid]", changeslist);
		var rcids = BunchPatroller.getJoinedValueFromHrefs($rcidLinks, /rcid=(\d+)/);
		if ( "" !== rcids ) {
			var diffs = BunchPatroller.getJoinedValueFromHrefs($rcidLinks, /diff=(\d+)/, /oldid=(\d+)/);
			this.enhanceBunchDiffLink($(changeslist).prev(), rcids, diffs);
		}
	},

	getJoinedValueFromHrefs: function($links, regexp, regexpAlt)
	{
		return $links.map(function(){
			var m = $(this).attr("href").match(regexp);
			if ( null === m && typeof regexpAlt == "object" ) {
				// test the fallback regexp
				m = $(this).attr("href").match(regexpAlt);
			}
			return null === m ? 0 : m[1];
		}).get().join(this.paramDelim);
	},

	/* 
		Add extra parameters to the href attribute of the bunch diff link.
		If there is no diff link (by new pages) one is created.
	*/
	enhanceBunchDiffLink: function($holder, rcids, diffs)
	{
		var extraParams = "&" + BunchPatroller.rcidsParam + "=" + rcids
			+ "&" + BunchPatroller.diffsParam + "=" + diffs;

		var $link = $("a[href*=diff]", $holder);
		if ( $link.length ) {
			$link.attr("href", function(){
				return this.href + extraParams;
			});
		} else {
			this.addBunchDiffLinkTo(
				$("td:eq(1)", $holder), // second table cell
				diffs.split(this.paramDelim).shift(), // first id
				extraParams
			);
		}
	},

	addBunchDiffLinkTo: function($holder, diff, extraParams)
	{
		$holder.html( $holder.html().replace(
			new RegExp( gLang.msg("nchanges") ),
			'<a href="' + wgScript + "?diff=" + diff + "&oldid=" + diff
				+ extraParams + '">$&</a>') );
	},

	/** Works on diff pages */
	enable: function()
	{
		$bunchPatrolLinkHolder = $("#mw-diff-ntitle4");
		if ( 0 == $bunchPatrolLinkHolder.length ) {
			return; // not a diff page, get out of here
		}

		var rcidsRaw = WebRequest.getParam(this.rcidsParam);
		if ( ! rcidsRaw ) {
			return; // no rcids to patrol
		}

		var rcids = rcidsRaw.split(this.paramDelim);
		this.addPatrolLink($bunchPatrolLinkHolder, rcids);

		var diffs = WebRequest.getParam(this.diffsParam).split(this.paramDelim);
		this.addDiffLinks($bunchPatrolLinkHolder, rcids, diffs);
	},

	addPatrolLink: function($holder, rcids)
	{
		if ( $holder.children().length ) {
			$holder.append("<br/>");
		}
		$('<a href="#executePatrol"/>')
			.text( rcids.length == 1
				? gLang.msg("markaspatrolledtext1")
				: gLang.msg("markaspatrolledtext", rcids.length) )
			.click(function(){
				$(this).addClass( QuickPattroler.linkClassLoading );
				BunchPatroller.executePatrol(rcids, this);
				return false;
			})
			.appendTo($holder);
	},

	addDiffLinks: function($holder, rcids, diffs)
	{
		var $list = $("<ul/>");
		$.each(diffs, function(i, diff){
			$list.append( BunchPatroller.getDiffLink(rcids[i], diff) );
		});
		$list.appendTo($holder);
	},

	getDiffLink: function(rcid, diff)
	{
		return '<li><a'
			+ ' id="' + BunchPatroller.getDiffLinkId(rcid) + '"'
			+ ' href="' + wgScript + '?oldid=prev&diff=' + diff + '&rcid=' + rcid + '"'
			+ '>' + diff +'</a></li>';
	},

	getDiffLinkId: function(rcid)
	{
		return "patrol-link-" + rcid;
	},

	executePatrol: function(rcids, motherLink)
	{
		var token = this.getToken();

		$.each(rcids, function(i, rcid){
			BunchPatroller.executePatrolOne(token, rcid);
		});

		this.executeOnPatrolDone(function() {
			$(motherLink).replaceWith( gLang.msg("markedaspatrolledtext") );
			QuickPattroler.gotoRcIfWanted();
		}, rcids);
	},

	intervalId: 0,
	executeOnPatrolDone: function(callback, rcids)
	{
		this.intervalId = setInterval(function(){
			if ( BunchPatroller.numPatrolsProcessed >= rcids.length ) {
				clearInterval(BunchPatroller.intervalId);
				callback();
			}
		}, 200);
	},

	numPatrolsProcessed: 0,
	executePatrolOne: function(token, rcid)
	{
		var $diffLink = $("#" + BunchPatroller.getDiffLinkId(rcid));
		$diffLink.addClass( QuickPattroler.linkClassLoading );
		$.post(BunchPatroller.apiPath, {
			action : "patrol",
			token  : token,
			rcid   : rcid,
			format : "json"
		}, function(data){
			$diffLink.removeClass( QuickPattroler.linkClassLoading );
			if ( typeof data.error == "undefined" ) {
				$diffLink.addClass(BunchPatroller.diffLinkClassDone);
			} else {
				$diffLink.addClass(BunchPatroller.diffLinkClassNotDone)
					.attr("title", data.error.info);
			}
			BunchPatroller.numPatrolsProcessed++;
		}, "json");
	},

	tokenCookie: "patrolToken",
	tokenCookieTtl: 0.1, // days

	getToken: function()
	{
		var token = Cookie.read(this.tokenCookie);
		if ( ! token ) {
			token = this.getTokenFromApi();
			Cookie.create(this.tokenCookie, token, this.tokenCookieTtl);
		}

		return token;
	},

	getTokenFromApi: function()
	{
		var token = null;
		$.ajax({
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
	}

};

// prepare for fight
addOnloadHook(function(){
	if ( wgCanonicalSpecialPageName
			&& wgCanonicalSpecialPageName.indexOf("Recentchanges") === 0
	) {
		BunchPatroller.makeBunchDiffsPatrollable();
	} else if ( "view" == wgAction ) {
		QuickPattroler.ajaxifyLinks();
		BunchPatroller.enable();
	}
});