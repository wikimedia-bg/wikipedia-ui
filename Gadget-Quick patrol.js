/**
 * Enhance recent changes patrol.
 * Author: Borislav Manolov
 * License: Public domain
 * Documentation: [[МедияУики:Gadget-Quick patrol.js/doc]]
 */

mw.messages.set({
	'markaspatrolledtext1'  : 'Отбелязване на следната редакция като патрулирана',
	'markaspatrolledtext'   : 'Отбелязване на следните $1 редакции като патрулирани',
	'markedaspatrolledtext1': 'Редакцията беше отбелязана като патрулирана.',
	'markedaspatrolledtext' : 'Готово.',
	'showalldiffs'          : 'Показване на редакциите',
	'recentchangespage'     : 'Специални:Последни промени',
});

mw.ext = mw.ext || {};

mw.ext.Patroller = {};

mw.ext.Patroller.quick = function() {
	var my = this;

	my.linkClassWorking = 'working';
	my.diffLinkClassNotDone = 'not-done';

	my.enable = function($patrolLink, diffHref) {
		var revid = (diffHref.match(/diff=(\d+)/) || [])[1];
		$patrolLink.on('click', function(e) {
			my.executePatrol($patrolLink, revid);
			return false;
		});
	};

	my.executePatrol = function($patrolLink, revid) {
		$patrolLink.addClass(my.linkClassWorking);
		var token = mw.user.tokens.get('patrolToken');

		var api = new mw.Api();
		api.post({
			action: 'patrol',
			token: token,
			revid: revid
		}).done(function(data) {
			$patrolLink.replaceWith(mw.msg('markedaspatrolledtext1'));
			my.gotoRcIfWanted();
		}).fail(function() {
			$patrolLink.addClass(my.diffLinkClassNotDone);
			if(my.quick) {
				my.quick.handleError(data.error, $patrolLink);
			}
		});
	};

	my.gotoRcIfWanted = function() {
		if (window.wgxQuickPatrolLoadRc && wgxQuickPatrolLoadRc) {
			location.href = mw.util.getUrl(mw.msg('recentchangespage'));
		}
	};

	my.handleError = function(error, $link) {
		my.errors.push(error.code);
		$link.attr('title', error.info);
	};
};

/**
 * Enable bulk patrolling when multiple edits are reviewed at once
 * thru the enhanced recent changes
 */
mw.ext.Patroller.bulk = function(quick) {
	var my = this;

	my.quick = quick;
	my.revidsParam = 'patrol-revids';
	my.diffsParam = 'diffs';
	my.paramDelim = ',';
	my.bulkDiffLinkClass = 'bulk-duff-link';
	my.diffLinkClass = 'duff-link';
	my.linkClassWorking = my.quick.linkClassWorking;
	my.diffLinkClassDone = 'done';
	my.diffLinkClassNotDone = my.quick.diffLinkClassNotDone;
	my.classLoading = 'loading';

	/* track number of patrolled edits */
	my.numEditsPatrolled = 0;

	/* error codes returned from API */
	my.errors = [];

	/** Works on Special:Recentchanges */
	my.makeBulkDiffsPatrollable = function() {
		$('table.mw-enhanced-rc').each(function() {
			if ($(this).find('.unpatrolled').length) {
				my.makeBulkDiffPatrollable(this);
			}
		});
	};

	my.makeBulkDiffPatrollable = function(changeslist) {
		var $timeLinks = $('.unpatrolled', changeslist).closest('tr').find('.mw-enhanced-rc-time a');
		var revids = my.getJoinedValueFromHrefs($timeLinks, /oldid=(\d+)/);
		my.enhanceBulkDiffLink($('tr:first', changeslist), revids);
	};

	my.getJoinedValueFromHrefs = function($links, regexp, regexpAlt) {
		return $links.map(function(){
			var m = $(this).attr('href').match(regexp);
			if (m === null && typeof regexpAlt == 'object') {
				// test the fallback regexp
				m = $(this).attr('href').match(regexpAlt);
			}
			return m === null ? 0 : m[1];
		}).get().join(my.paramDelim);
	};

	/**
	 * Add extra parameters to the href attribute of the bulk diff link.
	 * If there is no diff link (by new pages) one is created.
	 */
	my.enhanceBulkDiffLink = function($holder, revids) {
		var extraParams = '&' + my.revidsParam + '=' + revids;

		var $link = $('a[href*="diff"]', $holder);
		if ($link.length) {
			$link.attr('href', function(){
				return this.href + extraParams;
			}).addClass(my.bulkDiffLinkClass);
		} else {
			my.addBulkDiffLinkTo(
				$('td:eq(4)', $holder), // fifth table cell
				revids.split(my.paramDelim),
				extraParams
			);
		}
	};

	my.addBulkDiffLinkTo = function($holder, revs, extraParams) {
		if (revs.length === 0) { return; }
		var title = $holder.find('.mw-changeslist-title').attr('title').replace(/\s+/g, '_');
		var oldid, diff;
		if (revs.length === 1) {
			if (!revs[0]) {
				oldid = $holder.closest('table').attr('data-mw-revid') || '';
				diff = oldid || '';
			} else {
				oldid = revs[0];
				diff = revs[0];
			}
		} else {
			$.each(revs, function(i) {
				oldid = Math.min(oldid, revs[i]);
				diff = Math.max(diff, revs[i]);
			});
		}
		$holder.html($holder.html().replace(
			/(?:\d+\s+промени|разл)/,
			'<a href="' + mw.config.get('wgScript') + '?title=' + title + '&diff=' + diff
			+ '&oldid=' + oldid + extraParams + '" class="' + my.bulkDiffLinkClass + '">$&</a>'));
	};

	/** Works on diff pages */
	my.enable = function(url) {
		$bulkPatrolLinkHolder = $('#mw-diff-ntitle4');
		if ($bulkPatrolLinkHolder.length == 0) {
			return; // not a diff page, get out of here
		}

		var revidsRaw = mw.util.getParamValue(my.revidsParam, url);
		if (!revidsRaw) {
			return; // no revids to patrol
		}

		var revids = revidsRaw.split(my.paramDelim);
		my.addPatrolLinkTo($bulkPatrolLinkHolder, revids);
		my.addDiffLinksTo($bulkPatrolLinkHolder, revids);
		my.addShowAllDiffsLinkTo($bulkPatrolLinkHolder);
	};

	my.addPatrolLinkTo = function($holder, revids) {
		$bulkPatrolLinkHolder.find('span.patrollink').remove();
		if ($holder.children().length) { $holder.append('<br>'); }
		$('<a href="#executePatrol">')
			.text(revids.length == 1
				? mw.msg('markaspatrolledtext1')
				: mw.msg('markaspatrolledtext', revids.length))
			.click(function() {
				$(this).addClass(my.linkClassWorking);
				my.executePatrol(revids, this);
				return false;
			})
			.appendTo($holder);
	};

	my.addDiffLinksTo = function($holder, revids) {
		var $list = $('<ul style="display: table; margin: 0.1em auto; text-align: center">');
		$.each(revids, function(i, revid){
			$list.append(my.getDiffLink(revid));
		});
		$list.appendTo($holder);
	};

	my.addShowAllDiffsLinkTo = function($holder) {
		$('<a href="#alldiffs">')
			.text(mw.msg('showalldiffs'))
			.click(function(){
				$all = $('<div id="alldiffs">').insertAfter($holder.parents('.diff'));
				$('.' + my.diffLinkClass, $holder).each(function(){
					my.loadDiffContentFor(this, $all);
				});
				$(this).remove();
				return false;
			})
			.appendTo($holder);
	};

	my.loadDiffContentFor = function(link, $holder) {
		var $out = $('<div>').appendTo($holder).addClass(my.classLoading).before('<hr>');
		$.get(link.href + '&diffonly=1&action=render', function(data){
			$out.html(data).removeClass(my.classLoading);
		});
	};

	my.getDiffLink = function(revid) {
		return '<li><a'
			+ ' id="' + my.getDiffLinkId(revid) + '"'
			+ ' class="' + my.diffLinkClass + '"'
			+ ' href="' + mw.config.get('wgScript') + '?oldid=prev&diff=' + revid + '"'
			+ '>' + revid +'</a></li>';
	};

	my.getDiffLinkId = function(revid) {
		return 'diff-link-' + revid;
	};

	my.executePatrol = function(revids, motherLink) {
		var token = mw.user.tokens.get('patrolToken');
		$.each(revids, function(i, revid) {
			my.executePatrolOne(token, revid);
		});

		my.executeOnPatrolDone(function() {
			$(motherLink).replaceWith(mw.msg('markedaspatrolledtext'));
			my.quick.gotoRcIfWanted();
		}, revids);
	};

	my.intervalId = 0;
	my.executeOnPatrolDone = function(callback, revids) {
		my.intervalId = setInterval(function() {
			if (my.numEditsPatrolled >= revids.length) {
				clearInterval(my.intervalId);
				callback();
			}
		}, 200);
	};

	my.executePatrolOne = function(token, revid) {
		var $diffLink = $('#' + my.getDiffLinkId(revid));
		$diffLink.addClass(my.linkClassWorking);
		var api = new mw.Api();
		api.post({
			action: 'patrol',
			token: token,
			revid: revid
		}).done(function(data) {
			$diffLink.removeClass(my.linkClassWorking).addClass(my.diffLinkClassDone);
		}).fail(function() {
			$diffLink.addClass(my.diffLinkClassNotDone);
			my.quick.handleError(data.error, $diffLink);
		}).always(function() {
			my.numEditsPatrolled++;
		});
	};

};

mw.ext.Patroller.init = function() {
	if ($.inArray('patroller', mw.config.get('wgUserGroups')) === -1 && $.inArray('sysop', mw.config.get('wgUserGroups')) === -1) {
		// user is not a patroller
		return;
	}
	var quick = new mw.ext.Patroller.quick();
	var bulk = new mw.ext.Patroller.bulk(quick);
	var isOnPageWithChanges = /^(Recentchanges|Watchlist)/.test(mw.config.get('wgCanonicalSpecialPageName'));
	mw.hook('wikipage.content').add(function() {
		if (isOnPageWithChanges) {
			bulk.makeBulkDiffsPatrollable();
		} else {
			bulk.enable();
		}
	});
};

mw.ext.Patroller.init();
