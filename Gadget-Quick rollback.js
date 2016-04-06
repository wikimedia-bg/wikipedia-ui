// Quick Rollback е инструмент за администратори, който позволява отмяна на редакции без да се напуска текущата страница. В допълнение към стандартните препратки [отмяна] се добавят по две нови препратки – „доб“ (отбелязва в резюмето, че отменените редакции са били добронамерени) и „ком“ (позволява да се въведе коментар, който да бъде включен в резюмето).

mw.ext = mw.ext || {};

// $('.quickRollbackLinks').remove();
// $('body').off("click", ".mw-rollback-link a");

mw.ext.QuickRollback = {

    mkRollbkLink: function (n) {
        var links = [ {}
                    , { label: 'доб', info: 'Отмяна с резюме за добронамерени редакции', type: 'good' }
                    , { label: 'ком', info: 'Отмяна с ръчно въведен коментар в резюмето', type: 'comm' }
                    ];
        var lnk = links[n];
        return $('<a href="#' + lnk.info + '" title="' + lnk.info
                + '" class="quickRollback_' + lnk.type + '">' + lnk.label + '</a>');
    },

    enable: function ($link) {
        var onClick = function (e) {
            e.preventDefault();
            mw.ext.QuickRollback.executeRollback(this);
        };
        var mkRollbkLink = mw.ext.QuickRollback.mkRollbkLink;
        var $rollbkLinks = $link || $('.mw-rollback-link a');
        var $afterSpan = $('<span class="quickRollbackLinks"/>').append(': ').append( mkRollbkLink(1) )
                         .append(', ').append( mkRollbkLink(2) );
        $rollbkLinks.each(function (i, link) {
            $(link).after($afterSpan.clone());
        });
        if ($link) $link.click(onClick);
        else $("body").on("click", ".mw-rollback-link a", onClick);
    },

    rollbkWithToken: function ($link, token, summary) {
        var $rollbkLink = $link.closest('.mw-rollback-link').children('a').first();
        var href = $rollbkLink.attr('href');
        var titleEncoded = (href.match(/(?:\?|&)title=([^&]*)(&|$)/) || ['', ''])[1];
        var userEncoded = (href.match(/(?:\?|&)from=([^&]*)(&|$)/) || ['', ''])[1];
        var user = decodeURIComponent(userEncoded);
        var goodFaithLink = $link.hasClass('quickRollback_good');
        if (summary || goodFaithLink)
            summary = 'Премахнати ' + (goodFaithLink ? '[[У:ДОБРО|добронамерени]] ' : '')
                    + '[[Special:Contributions/' + user + '|редакции на ' + user
                    + ']] ([[User talk:' + user + '|б.]])'
                    + (typeof summary == 'string' ? ': ' + summary : '');
        var rollbkUrl = 'https://bg.wikipedia.org/w/api.php?action=rollback&title='
                          + titleEncoded + '&user=' + userEncoded + '&format=json'
                          + (summary ? '&summary=' + encodeURIComponent(summary) : '');

        $.post(rollbkUrl, {token: token}, function (resp) {
              var error = resp.error;
              var msgs = {
              	  'onlyauthor': 'Последният редактор е и единствен автор на страницата.\n'
                              + 'Не може да бъде извършена отмяна на редакциите.',
              	  'alreadyrolled': 'Редакциите веча са били отменени.'
              };
              if (error) {
              	   $link.removeClass('working');
              	   alert( msgs[error.code] || error.info );
              }
              else {
                  $rollbkLink.parent().find('.quickRollbackLinks').remove();
                  $rollbkLink.replaceWith($('<span class="done">' + $rollbkLink.text() + '</span>'));
              }
        });
    },

    executeRollback: function(link) {
        var summary;
        var $link = $(link);
        if ($link.hasClass('quickRollback_comm')) {
            summary = prompt('Въведете коментар за отмяната:');
            if (!summary) return;
        }
        $link.addClass('working');
        $.getJSON('https://bg.wikipedia.org/w/api.php?action=query&meta=tokens&type=rollback&format=json',
                  function (resp) {
            var token = resp && resp.query && resp.query.tokens && resp.query.tokens.rollbacktoken;
            if (token) mw.ext.QuickRollback.rollbkWithToken($link, token, summary);
            else { // no token in response for some reason
                $link.removeClass('working');
                $link.attr('target', '_blank')[0].click();
            }
        });
    }

};

mw.ext.QuickRollback.enable();