/**
 * Enhance recent changes patrol.
 * Author: Borislav Manolov
 * License: Public domain
 * Documentation: [[МедияУики:Gadget-Quick patrol.js/doc]]
 */

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
 * Ajaxify patrol links
 */
window.QuickPatroller = {
	linkClassWorking: "working",

	enable: function() {
		$("body").on("click", ".patrollink a", function(){
			QuickPatroller.executePatrol(this);
			return false;
		});
	},

	executePatrol: function(link) {
		var $link = $(link).addClass( this.linkClassWorking );
		$.post(link.href, function(data){
			$link.replaceWith(gLang.msg("markedaspatrolledtext1"));
			QuickPatroller.gotoRcIfWanted();
		});
	},

	gotoRcIfWanted: function() {
		if (window.wgxQuickPatrolLoadRc && wgxQuickPatrolLoadRc) {
			location.href = mw.util.getUrl(gLang.msg("recentchangespage"));
		}
	}
};

/**
 * Enable bulk patrolling when multiple edits are reviewed at once
 * thru the enhanced recent changes
 */
window.BulkPatroller = {

	revidsParam: "patrol-revids",
	diffsParam: "diffs",
	paramDelim: ",",
	bulkDiffLinkClass: "bulk-duff-link",
	diffLinkClass: "duff-link",
	diffLinkClassDone: "done",
	diffLinkClassNotDone: "not-done",
	classLoading: "loading",

	/* track number of patrolled edits */
	numEditsPatrolled: 0,

	/* error codes returned from API */
	errors: [],

	/** Works on Special:Recentchanges */
	makeBulkDiffsPatrollable: function() {
		$(".mw-collapsible.mw-enhanced-rc").each(function() {
			if ($(this).find(".unpatrolled").length) {
				BulkPatroller.makeBulkDiffPatrollable(this);
			}
		});
	},

	makeBulkDiffPatrollable: function(changeslist) {
		var $timeLinks = $(".unpatrolled", changeslist).closest("tr").find(".mw-enhanced-rc-time a");
		var revids = this.getJoinedValueFromHrefs($timeLinks, /oldid=(\d+)/);
		this.enhanceBulkDiffLink($("tr:first", changeslist), revids);
	},

	getJoinedValueFromHrefs: function($links, regexp, regexpAlt) {
		return $links.map(function(){
			var m = $(this).attr("href").match(regexp);
			if ( null === m && typeof regexpAlt == "object" ) {
				// test the fallback regexp
				m = $(this).attr("href").match(regexpAlt);
			}
			return null === m ? 0 : m[1];
		}).get().join(this.paramDelim);
	},

	/**
	 * Add extra parameters to the href attribute of the bulk diff link.
	 * If there is no diff link (by new pages) one is created.
	 */
	enhanceBulkDiffLink: function($holder, revids) {
		var extraParams = "&" + this.revidsParam + "=" + revids;

		var $link = $('a[href*="diff"]', $holder);
		if ($link.length) {
			$link.attr("href", function(){
				return this.href + extraParams;
			}).addClass(this.bulkDiffLinkClass);
		} else {
			this.addBulkDiffLinkTo(
				$("td:eq(1)", $holder), // second table cell
				diffs.split(this.paramDelim).shift(), // first id
				extraParams
			);
		}
	},

	addBulkDiffLinkTo: function($holder, diff, extraParams) {
		$holder.html( $holder.html().replace(
			new RegExp( gLang.msg("nchanges") ),
			'<a href="' + mw.config.get('wgScript') + "?diff=" + diff + "&oldid=" + diff + extraParams
				+ '" class="' + this.bulkDiffLinkClass + '">$&</a>') );
	},

	/** Works on diff pages */
	enable: function(url) {
		$bulkPatrolLinkHolder = $("#mw-diff-ntitle4");
		if ( 0 == $bulkPatrolLinkHolder.length ) {
			return; // not a diff page, get out of here
		}

		var revidsRaw = mw.util.getParamValue(this.revidsParam, url);
		if ( ! revidsRaw ) {
			return; // no revids to patrol
		}

		var revids = revidsRaw.split(this.paramDelim);
		this.addPatrolLinkTo($bulkPatrolLinkHolder, revids);

		this.addDiffLinksTo($bulkPatrolLinkHolder, revids);

		this.addShowAllDiffsLinkTo($bulkPatrolLinkHolder);
	},

	addPatrolLinkTo: function($holder, revids) {
		if ($holder.children().length) {
			$holder.append("<br/>");
		}
		$('<a href="#executePatrol"/>')
			.text( revids.length == 1
				? gLang.msg("markaspatrolledtext1")
				: gLang.msg("markaspatrolledtext", revids.length) )
			.click(function() {
				$(this).addClass(QuickPatroller.linkClassWorking);
				BulkPatroller.executePatrol(revids, this);
				return false;
			})
			.appendTo($holder);
	},

	addDiffLinksTo: function($holder, revids) {
		var $list = $("<ul/>");
		$.each(revids, function(i, revid){
			$list.append(BulkPatroller.getDiffLink(revid));
		});
		$list.appendTo($holder);
	},

	addShowAllDiffsLinkTo: function($holder) {
		$('<a href="#alldiffs"/>')
			.text( gLang.msg("showalldiffs") )
			.click(function(){
				$all = $('<div id="alldiffs"/>').insertAfter( $holder.parents(".diff") );

				$("." + BulkPatroller.diffLinkClass, $holder).each(function(){
					BulkPatroller.loadDiffContentFor(this, $all);
				});

				$(this).remove();
			})
			.appendTo($holder);
	},

	loadDiffContentFor: function(link, $holder) {
		var $out = $("<div/>").appendTo($holder).addClass(this.classLoading).before("<hr/>");

		$.get(link.href + "&diffonly=1&action=render", function(data){
			$out.html(data).removeClass(BulkPatroller.classLoading);
		});
	},

	getDiffLink: function(revid) {
		return '<li><a'
			+ ' id="' + this.getDiffLinkId(revid) + '"'
			+ ' class="' + this.diffLinkClass + '"'
			+ ' href="' + mw.config.get('wgScript') + '?oldid=prev&diff=' + revid + '"'
			+ '>' + revid +'</a></li>';
	},

	getDiffLinkId: function(revid) {
		return "diff-link-" + revid;
	},

	executePatrol: function(revids, motherLink) {
		var api = new mw.Api();
		api.getToken("patrol").done(function(token) {
			$.each(revids, function(i, revid) {
				BulkPatroller.executePatrolOne(token, revid);
			});
	
			BulkPatroller.executeOnPatrolDone(function() {
				$(motherLink).replaceWith(gLang.msg("markedaspatrolledtext"));
				QuickPatroller.gotoRcIfWanted();
			}, revids);
		});
	},

	intervalId: 0,
	executeOnPatrolDone: function(callback, revids) {
		this.intervalId = setInterval(function() {
			if (BulkPatroller.numEditsPatrolled >= revids.length) {
				clearInterval(BulkPatroller.intervalId);
				callback();
			}
		}, 200);
	},

	executePatrolOne: function(token, revid) {
		var $diffLink = $("#" + BulkPatroller.getDiffLinkId(revid));
		$diffLink.addClass(QuickPatroller.linkClassWorking);
		var api = new mw.Api();
		api.post({
			action: "patrol",
			token: token,
			revid: revid
		}).done(function(data) {
			$diffLink.removeClass(QuickPatroller.linkClassWorking).addClass(BulkPatroller.diffLinkClassDone);
		}).fail(function() {
			$diffLink.addClass(BulkPatroller.diffLinkClassNotDone);
			BulkPatroller.handleError(data.error, $diffLink);
		}).always(function() {
			BulkPatroller.numEditsPatrolled++;
		});
	},

	handleError: function(error, $diffLink) {
		this.errors.push(error.code);
		$diffLink.attr("title", error.info);
	}

};

mw.hook('wikipage.content').add(function(){
	if ( /^(Recentchanges|Recentchangeslinked|Watchlist)/.test(mw.config.get('wgCanonicalSpecialPageName')) ) {
		BulkPatroller.makeBulkDiffsPatrollable();
	} else if (mw.config.get('wgAction') === "view") {
		QuickPatroller.enable();
		BulkPatroller.enable();
	}
});