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
			var $link = QuickDiff.$currentDiffLink = jQuery(this).addClass("working");
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

        function mkRollbkLink(n) {
            var links = [ {}
                        , { label: 'добро', info: 'Отмяна с резюме за добронамерени редакции' }
                        , { label: 'с резюме', info: 'Отмяна с ръчно въведено резюме' }
                        ];
            var link = links[n];
            return $('<a href="#' + link.info + '" title="' + link.info + '">' + link.label + '</a>')
                   .click(function (e) {
                       e.preventDefault();
                       QuickDiff.rollbk(n);
                   });
        }

		var $rollbkLink = QuickDiff.$rollbkLink = $('#quickdiff .mw-rollback-link a').click(function (e) {
    		e.preventDefault();
    		QuickDiff.rollbk();
		});

        if (mw.config.get('wgContentLanguage') == 'bg') {
            $('.mw-rollback-link').before('<br/>');
            var $afterSpan = $('<span class="afterRollbkLink"/>').append(': ').append( mkRollbkLink(1) )
                             .append(', ').append( mkRollbkLink(2) );
            $rollbkLink.after($afterSpan);
        }
	},

    rollbkWithToken: function(token, summary) {
        var $rollbkLink = QuickDiff.$rollbkLink.addClass('working');
        var href = $rollbkLink.attr('href');
        var title = (href.match(/(?:\?|&)title=([^&]*)(&|$)/) || ['', ''])[1];
        var user = (href.match(/(?:\?|&)from=([^&]*)(&|$)/) || ['', ''])[1];
        var $userLink = $('.diff-ntitle .mw-userlink');
        var userTalkPage = 'Потребител беседа:' + $userLink.text();
        var userLinkAddr = ( $userLink.hasClass('mw-anonuserlink') ? $userLink.attr('title') : 'Потребител:' + $userLink.text() );
        if (summary)
            summary = 'Премахнати ' + (summary == 1 ? '[[У:ДОБРО|добронамерени]] ' : '')
                    + 'редакции на [[' + userLinkAddr + '|' + $userLink.text()
                    + ']] ([[' + userTalkPage + '|б.]])'
                    + (typeof summary == 'string' ? ': ' + summary : '');
        var rollbkUrl = 'https://bg.wikipedia.org/w/api.php?action=rollback&title='
                          + title + '&user=' + user + '&format=json'
                          + (summary ? '&summary=' + encodeURIComponent(summary) : '');
        $.post(rollbkUrl, {token: token}, function (resp) {
              var error = resp.error && resp.error.info;
              if (error) { $rollbkLink.removeClass('working'); alert(error); }
              else {
                  $rollbkLink.replaceWith($('<span class="done">' + $rollbkLink.text() + '</span>'));
                  $('.afterRollbkLink').remove();
              }
        });
    },

    rollbk: function(summary) {
        var link = QuickDiff.$rollbkLink;
		if (!link[0]) return;
        if (summary == 2) {
            summary = prompt('Въведете коментар за отмяната:');
            if (!summary) return;
        }
        link.addClass('working');
        $.getJSON('https://bg.wikipedia.org/w/api.php?action=query&meta=tokens&type=rollback&format=json',
                  function (resp) {
            var token = resp && resp.query && resp.query.tokens && resp.query.tokens.rollbacktoken;
            if (token) QuickDiff.rollbkWithToken(token, summary);
            else { // no token in response for some reason
                QuickDiff.$rollbkLink.removeClass('working');
                QuickDiff.$rollbkLink.attr('target', '_blank')[0].click();
            }
        });
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
			if ($win) {
				$win.hide();
			}
		};
		$win.on('dblclick', closeWin).appendTo("#bodyContent").find("#quickdiff-close").click(closeWin);
		$(document).keyup(function(e) {
			if (e.keyCode == KEY_ESC) { closeWin() }
		});
		$(document.body).on("click", function(event) {
			if ($(event.target).parents('#quickdiff').length === 0) {
				closeWin();
			}
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
			|| mw.config.get('wgPageName') === "Уикипедия:Активни_беседи"
	) {
		QuickDiff.enable();
	}
});