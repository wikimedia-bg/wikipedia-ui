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
			$link.after("Редакцията беше отбелязана като проверена.").remove();
			QuickPattroler.gotoRcIfWanted();
		});
	},

	gotoRcIfWanted: function()
	{
		if ( typeof wgxQuickPatrolLoadRc == "boolean" && wgxQuickPatrolLoadRc ) {
			location.href = Creator.createInternUrl("Специални:Последни промени");
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
		var diffs = BunchPatroller.getJoinedValueFromHrefs($rcidLinks, /diff=(\d+)/);

		if ( "" !== rcids ) {
			// add our extra parameters to the href attribute of the bunch diff link
			$("a[href*=diff]", $(changeslist).prev()).attr("href", function(){
				return this.href
					+ "&" + BunchPatroller.rcidsParam + "=" + rcids
					+ "&" + BunchPatroller.diffsParam + "=" + diffs;
			});
		}
	},

	getJoinedValueFromHrefs: function($links, regexp)
	{
		return $links.map(function(){
			var m = $(this).attr("href").match(regexp);
			return null === m ? 0 : m[1];
		}).get().join(this.paramDelim);
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

	addPatrolLink: function(holder, rcids)
	{
		$('<a href="#executePatrol"/>')
			.text("Отбелязване на "
				+ (rcids.length == 1
					? "следната редакция като проверена"
					: "следните "+ rcids.length +" редакции като проверени")
			)
			.click(function(){
				$(this).addClass( QuickPattroler.linkClassLoading );
				BunchPatroller.executePatrol(rcids, this);
				return false;
			})
			.appendTo(holder);
	},

	addDiffLinks: function(holder, rcids, diffs)
	{
		var $list = $("<ul/>");
		$.each(diffs, function(i, diff){
			$list.append('<li><a'
				+ ' id="' + BunchPatroller.getDiffLinkId(rcids[i]) + '"'
				+ ' href="' + wgScript + '?oldid=prev&diff=' + diff + '&rcid=' + rcids[i] + '"'
				+ '>' + diff +'</a></li>'
			);
		});
		$list.appendTo(holder);
	},

	executePatrol: function(rcids, motherLink)
	{
		var token = this.getToken();

		$.each(rcids, function(i, rcid){
			BunchPatroller.executePatrolOne(token, rcid);
		});

		this.executeOnPatrolDone(function() {
			$(motherLink).remove();
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

	getDiffLinkId: function(rcid)
	{
		return "patrol-link-" + rcid;
	},

	tokenCookie: "patrolToken",
	tokenCookieTtl: 0.1,
	
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