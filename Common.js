/** Namespace constants */
mw.ns = mw.ns || {
	MEDIA          : -2,
	SPECIAL        : -1,
	MAIN           : 0,
	TALK           : 1,
	USER           : 2,
	USER_TALK      : 3,
	PROJECT        : 4,
	PROJECT_TALK   : 5,
	IMAGE          : 6,
	IMAGE_TALK     : 7,
	MEDIAWIKI      : 8,
	MEDIAWIKI_TALK : 9,
	TEMPLATE       : 10,
	TEMPLATE_TALK  : 11,
	HELP           : 12,
	HELP_TALK      : 13,
	CATEGORY       : 14,
	CATEGORY_TALK  : 15
};

mw.ext = mw.ext || {};

/**
 * Checks whether the current page action is one of the given ones
 * @param string|array actions
 * @return boolean
 */
mw.ext.isAction = function(actions) {
	if (!$.isArray(actions)) {
		actions = [actions];
	}
	return $.inArray(mw.config.get('wgAction'), actions) !== -1;
};

// Calls to setCustomMiscButton() from a personal common.js causes an error in Google Chrome
window.setCustomMiscButton = window.setCustomMiscButton || function () {
	console.log('A call to an undefined function setCustomMiscButton(). This message comes from МедияУики:Common.js');
};

/**
 * Checks whether the current page namespace is one of the given ones
 * @param string|array namespaces
 * @return boolean
 */
mw.ext.isNs = function(namespaces) {
	if (!$.isArray(namespaces)) {
		namespaces = [namespaces];
	}
	return $.inArray(mw.config.get('wgNamespaceNumber'), namespaces) !== -1;
};

mw.vars = {

	use: function(baseName) {
		this.end();
		this._currentBag = this._getBagFor(baseName + '.*');
		return this;
	},
	end: function() {
		this._currentBag = null;
	},

	set: function(name, value) {
		this._getBagFor(name)[this._extractLastNamePart(name)] = value;
		return this;
	},
	get: function(name, defaultValue) {
		return this._getBagFor(name)[this._extractLastNamePart(name)] || defaultValue;
	},

	_getBagFor: function(name) {
		var nameParts = name.split(this._nsDelim);
		var bag = this._currentBag;
		if (!bag) {
			var firstPart = nameParts.shift();
			if (!this._store.hasOwnProperty(firstPart)) {
				this._store[firstPart] = {};
			}
			bag = this._store[firstPart];
		}
		if (nameParts.length === 0) {
			return bag;
		}
		nameParts.pop();
		$.each(nameParts, function(i, namePart) {
			if (!bag[namePart]) {
				bag[namePart] = {};
			}
			// point the bag one level deeper
			bag = bag[namePart];
		});
		return bag;
	},

	_extractLastNamePart: function(name) {
		return name.split(this._nsDelim).pop();
	},

	_store: {},
	_currentBag: null,
	_nsDelim: '.'
};

mw.messages.set({
	// Featured article marker
	"fa-linktitle" : "Тази статия на друг език е избрана.",

	// Transclusion tool
	"ta-emptyfield" : "Не сте въвели име за подстраницата.",
	"ta-summary" : "Автоматично вграждане на [[$1]]",
	"ta-bpsummary" : "Нова тема: [[$1]]",

	// Toolbox add-ons
	"tb-subpages": "Подстраници",
});

// for backwards compatibility
var gLang = { msg: mw.msg, addMessages: function(){} };


/* * * * * * * * * *   Toolbox add-ons   * * * * * * * * * */

/***** subPagesLink ********
 * Adds a link to subpages of current page
 * (copied from [[commons:MediaWiki:Common.js]] and slightly modified)
 */
var subPagesLink = {
	wo_ns : [mw.ns.MEDIA, mw.ns.SPECIAL, mw.ns.IMAGE, mw.ns.CATEGORY],

	install: function() {
		if ( document.getElementById("p-tb") && !mw.ext.isNs(subPagesLink.wo_ns) ) {
			mw.util.addPortletLink( 'p-tb',
				mw.util.getUrl('Special:Prefixindex/' + mw.config.get('wgPageName') +'/'),
				mw.msg("tb-subpages"), 't-subpages' );
		}
	}
};
mw.loader.using( 'mediawiki.util' ).then( function() {
	subPagesLink.install();

	if ( $.inArray("sysop", mw.config.get('wgUserGroups')) !== -1 && mw.config.get('wgCanonicalNamespace').indexOf("User") === 0 ) {
		mw.util.addPortletLink( 'p-tb',
			mw.util.getUrl('Специални:Потребителски права/' + mw.config.get('wgTitle')),
			"Управление на правата", 't-userrights' );
	}
});


// поздравително съобщение за нерегистрираните потребители
$(function() {
	var shouldSeeWelcomeMsg = mw.ext.isAction("view") // преглед на страница
		&& mw.config.get("wgUserName") === null // нерегистриран потребител
		&& mw.config.get("wgCanonicalNamespace") === "" // основно именно пространство = статия
		&& mw.config.get("wgRestrictionEdit") === [] // няма защита
		&& mw.config.get("wgIsProbablyEditable") === true // може да се редактира
		&& (document.referrer !== "") // има препращач
		&& (/bg\.wikipedia\.org/.test(document.referrer) === false) // идва извън Уикипедия
		;
	if (shouldSeeWelcomeMsg) {
		mw.util.$content.prepend('<div class="custom-usermessage"><b>Добре дошли</b> в Уикипедия! Можете не само да четете тази статия, но също така и да я <b><a href="/wiki/%D0%A3%D0%B8%D0%BA%D0%B8%D0%BF%D0%B5%D0%B4%D0%B8%D1%8F:%D0%92%D1%8A%D0%B2%D0%B5%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5" title="Повече информация за редактирането на статии в Уикипедия">редактирате и подобрите</a></b>.</div>');
	}
});


// Използвайте този код, за да пренасочите връзката от логото на Уикипедия
// към определена страница в енциклопедията. За целта разкоментирайте кода
// по-долу (премахнете двойните наклонени черти в началото на всеки ред) и
// поставете името на съответната страница в посоченото място.
//mw.hook('wikipage.content').add(function(){
//    var logoLink = document.getElementById('p-logo').childNodes[0];
//    logoLink.title = 'Текст в popup'; // <-- поставете между апострофите текста, който искате да излиза в popup при посочване
//    logoLink.href = '/wiki/Име на страницата'; // <-- поставете името на страницата между апострофите, но запазете /wiki/ отпред
//});

// Преименуване на етикета "Статия" за началната страница
if (mw.config.get('wgIsMainPage') || mw.config.get('wgPageName') == 'Беседа:Начална_страница') {
    $(function () {
        var nstab = document.getElementById('ca-nstab-main');
        if (nstab && mw.config.get('wgUserLanguage')=='bg') {
            while (nstab.firstChild) { nstab = nstab.firstChild; }
            nstab.nodeValue = 'Начална страница';
        }
    });
}

/**
 * Script pour alterner entre plusieurs cartes de géolocalisation
 * Функции за замяна на картите в Шаблон:ПК група
 */
function GeoBox_Init() {
	$('.img_toggle').each(function() {
		var $container = $(this);
		var $ToggleLinksDiv = $('<ul>');
		var cssItemShown = { bottom: "1px", color: "black", background: "#fff", borderTop: "none" };
		var cssItemHidden = { bottom: "0", color: "#444", background: "#f5f5f5", borderTop: "1px solid #aaa" };
		$container.find('.location-map').each(function(idx) {
			var ThisBox = this;
			var toggle = $('<a href="#">'+ThisBox.getElementsByTagName('img')[0].alt+'</a>').on('click', function(e) {
				if ($container.hasClass('slideshow') && e.bubbles) {
					clearInterval(slideshow);
				}
				$container.find('.location-map').hide();
				$(ThisBox).fadeIn();
				$ToggleLinksDiv.find('li').css(cssItemHidden);
				$(this).parent().css(cssItemShown);
				return false;
			});
			var $li = $('<li>').append(toggle).appendTo($ToggleLinksDiv);
			if (idx === 0) {
				$li.css(cssItemShown);
			} else {
				ThisBox.style.borderTop = '0';
				$(ThisBox).hide();
				$li.css(cssItemHidden);
			}
		});
		$container.append($ToggleLinksDiv);
		if ($container.hasClass('slideshow')) {
			var index = 0;
			$anchors = $ToggleLinksDiv.find('A');
			slideshow = setInterval(function () {
				index = index < $anchors.length - 1 ? index + 1 : 0;
				$($anchors[index]).click();
			}, 5000);
		}
	});
}

if (mw.ext.isAction(["view", "purge", "submit"])) {
	mw.hook( 'wikipage.content' ).add( GeoBox_Init );
}



/**
 * Слагайте колкото се може по-малко команди в МедияУики:Common.js, понеже те се
 * изпълняват безусловно от всички потребители за всяка страница.  По възможност
 * създавайте джаджи, които са включени по подразбиране вместо да добавяте код
 * тук, защото джаджите са оптимизирани ResourceLoader модули, има възможност да
 * им бъдат добавяни зависимости и т.н.
 *
 * Понеже Common.js не е джаджа, няма къде да бъдат описани нужните зависимости.
 * Затова се използва mw.loader.using callback, в който се описва и изпълнява
 * всичко.  В повечето случаи зависимостите вече ще са заредени (или в момента
 * ще се зареждат) от браузъра и callback-ът няма да бъде забавен.  Дори в
 * случай, че някоя зависимост още не е свалена и изпълнена, callback-ът ще се
 * погрижи това да се случи преди да започне изпълнението си.
 */
/*global mw, $, importStylesheet, importScript */
/*jshint curly:false eqnull:true, strict:false, browser:true, */

mw.loader.using( ['mediawiki.util', 'jquery.client'], function () {
/* Начало на mw.loader.using callback */

/**
 * Промени по Начална страница
 *
 * Описание: Добавяне на допълнителна препратка в края на списъка с езици, водеща до пълния списък с езикови версии на Уикипедия.
 * Поддържа се от: [[:en:User:AzaToth]], [[:en:User:R. Koot]], [[:en:User:Alex Smotrov]]
 */

if ( mw.config.get( 'wgPageName' ) === 'Начална_страница' || mw.config.get( 'wgPageName' ) === 'Беседа:Начална_страница' ) {
    $( document ).ready( function () {
        mw.util.addPortletLink( 'p-lang', '//meta.wikimedia.org/wiki/List_of_Wikipedias',
            'Пълен списък', 'interwiki-completelist', 'Пълен списък с Уикипедия на всички езици (страницата е на английски)' );
    } );
}

/**
 * Взимане на URL параметър от текущото URL
 *
 * @deprecated: Използвайте mw.util.getParamValue с правилно escape-ване
 */
mw.log.deprecate( window, 'getURLParamValue', function () {
    return mw.util.getParamValue.apply( mw.util, arguments );
}, 'Use mw.util.getParamValue() instead' );


/**
 * Скриваеми таблици **********************************************************
 *
 * Описание: Позволява скриването на таблици като само заглавието остава
 *           видимо.  Вижте [[:en:Wikipedia:NavFrame]].
 * Поддържа се от: [[:en:User:R. Koot]]
 */

var autoCollapse = 2;
var collapseCaption = 'Скриване';
var expandCaption = 'Показване';

window.collapseTable = function ( tableIndex ) {
    var Button = document.getElementById( 'collapseButton' + tableIndex );
    var Table = document.getElementById( 'collapsibleTable' + tableIndex );

    if ( !Table || !Button ) {
        return false;
    }

    var Rows = Table.rows;
    var i;

    if ( Button.firstChild.data === collapseCaption ) {
        for ( i = 1; i < Rows.length; i++ ) {
            Rows[i].style.display = 'none';
        }
        Button.firstChild.data = expandCaption;
    } else {
        for ( i = 1; i < Rows.length; i++ ) {
            Rows[i].style.display = Rows[0].style.display;
        }
        Button.firstChild.data = collapseCaption;
    }
};

function createCollapseButtons() {
    var tableIndex = 0;
    var NavigationBoxes = {};
    var Tables = document.getElementsByTagName( 'table' );
    var i;

    function handleButtonLink( index, e ) {
        window.collapseTable( index );
        e.preventDefault();
    }

    for ( i = 0; i < Tables.length; i++ ) {
        if ( $( Tables[i] ).hasClass( 'collapsible' ) ) {

            /* само ако има заглавен ред се добавя бутон и се увеличава брояча */
            var HeaderRow = Tables[i].getElementsByTagName( 'tr' )[0];
            if ( !HeaderRow ) continue;
            var Header = HeaderRow.getElementsByTagName( 'th' )[0];
            if ( !Header ) continue;

            NavigationBoxes[ tableIndex ] = Tables[i];
            Tables[i].setAttribute( 'id', 'collapsibleTable' + tableIndex );

            var Button     = document.createElement( 'span' );
            var ButtonLink = document.createElement( 'a' );
            var ButtonText = document.createTextNode( collapseCaption );

            Button.className = 'collapseButton';  /* Стиловете са описани в Common.css */

            ButtonLink.style.color = Header.style.color;
            ButtonLink.setAttribute( 'id', 'collapseButton' + tableIndex );
            ButtonLink.setAttribute( 'href', '#' );
            $( ButtonLink ).on( 'click', $.proxy( handleButtonLink, ButtonLink, tableIndex ) );
            ButtonLink.appendChild( ButtonText );

            Button.appendChild( document.createTextNode( '[' ) );
            Button.appendChild( ButtonLink );
            Button.appendChild( document.createTextNode( ']' ) );

            Header.insertBefore( Button, Header.firstChild );
            tableIndex++;
        }
    }

    for ( i = 0;  i < tableIndex; i++ ) {
        if ( $( NavigationBoxes[i] ).hasClass( 'collapsed' ) || ( tableIndex >= autoCollapse && $( NavigationBoxes[i] ).hasClass( 'autocollapse' ) ) ) {
            window.collapseTable( i );
        }
        else if ( $( NavigationBoxes[i] ).hasClass ( 'innercollapse' ) ) {
            var element = NavigationBoxes[i];
            while ((element = element.parentNode)) {
                if ( $( element ).hasClass( 'outercollapse' ) ) {
                    window.collapseTable ( i );
                    break;
                }
            }
        }
    }
}

mw.hook( 'wikipage.content' ).add( createCollapseButtons );

/**
 * Allow non-complete collapsing of a table while some leading rows remain visible.
 * The number of visible rows can be controlled by a 'data-visible-rows' attribute on the table. Default is: 3 visible rows.
 */
mw.hook('wikipage.content').add(function($content) {
	$content.find("table.semicollapsible").each(function(i, table) {
		var $table = $(table);
		var randomId = Math.ceil(Math.random() * 1000000000);
		var $newTBody = $('<tbody id="mw-customcollapsible-'+randomId+'" class="mw-collapsible mw-collapsed"></tbody>').appendTo($table);
		var numberOfVisibleRows = $table.data('visible-rows') || 3;
		var $rowsToHide = $table.find('tr').slice(numberOfVisibleRows + 1).appendTo($newTBody);
		// TODO does not account for existing colspans
		var columnCount = $rowsToHide.eq(0).find('td').length;
		var toggleText = '↓ Показване на още данни';
		$newTBody.before('<tbody><tr><td colspan="'+columnCount+'"><div class="mw-customtoggle-'+randomId+'" style="text-align:center"><b>'+toggleText+'</b></div></td></tr></tbody>');

		mw.loader.using('jquery.makeCollapsible', function() {
			$newTBody.makeCollapsible();
		});
	});
});


(function() {
	if ($.inArray(mw.config.get('wgCanonicalSpecialPageName'), ['Recentchanges', 'Watchlist']) === -1) {
		return;
	}
	// add a class to all rows with changes by CategoryMaster
	$('.mw-tag-marker-CategoryMaster').each(function() {
		$(this).closest('tr').addClass('mw-changeslist-CategoryMaster');
	});
})();

/* Край на mw.loader.using callback */
} );
/* НЕ ДОБАВЯЙТЕ КОМАНДИ ПОД ТОЗИ РЕД */
