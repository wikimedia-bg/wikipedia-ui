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


mw.messages.set({
	// Projects
	"wikipedia": "Уикипедия",
	"wiktionary": "Уикиречник",
	"wikiquote": "Уикицитат",
	"wikibooks": "Уикикниги",
	"wikisource": "Уикиизточник",
	"wikinews": "Уикиновини",
	"wikiversity": "Уикиверситет",
	"wikispecies": "Уикивидове",
	"commons": "Общомедия",

	// Featured article marker
	"fa-linktitle" : "Тази статия на друг език е избрана.",

	// Transclusion tool
	"ta-emptyfield" : "Не сте въвели име за подстраницата.",
	"ta-summary" : "Автоматично вграждане на [[$1]]",
	"ta-bpsummary" : "Нова тема: [[$1]]",

	// Toolbox add-ons
	"tb-subpages": "Подстраници",
	"tb-inother": "В други проекти"
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
}
$( function() {
	subPagesLink.install();

	if ( $.inArray("sysop", mw.config.get('wgUserGroups')) !== -1 && mw.config.get('wgCanonicalNamespace').indexOf("User") === 0 ) {
		mw.util.addPortletLink( 'p-tb',
			mw.util.getUrl('Специални:Потребителски права/' + mw.config.get('wgTitle')),
			"Управление на правата", 't-userrights' );
	}
});


/**
* ProjectLinks
*
* by [[en:wikt:user:Pathoschild]] (idea from an older, uncredited script)
* generates a sidebar list of links to other projects
*
* (copied from [[en:wikt:MediaWiki:Monobook.js]] and modified)
*/
function Projectlinks() {
	var ptb = $("#p-tb");
	if ( ! ptb.length ) {
		return; // no toolbox, no place to go, asta la vista
	}

	var wrappers = $('.interProject');
	if ( wrappers.length == 0 ) {
		return;
	}

	var projects = {
		"wiktionary": mw.msg("wiktionary"),
		"wikiquote": mw.msg("wikiquote"),
		"wikibooks": mw.msg("wikibooks"),
		"wikisource": mw.msg("wikisource"),
		"wikinews": mw.msg("wikinews"),
		"wikispecies": mw.msg("wikispecies"),
		"wikiversity": mw.msg("wikiversity"),
		"commons.wiki": mw.msg("commons")
	};

	function getProjectName(url) {
		for ( var code in projects ) {
			if ( url.indexOf( code ) != -1 ) {
				return projects[code];
			}
		}
		return "";
	}

	// get projectlinks
	var elements = [];
	wrappers.each(function() {
		var link = $(this).find('a:first').clone();
		elements.push(link.text(getProjectName(link[0].href)));
	});

	// sort alphabetically
	elements.sort(function(a, b) {
		return (a.text() < b.text()) ? -1 : 1;
	});

	// create list
	var pllist = $('<ul>');
	$.each(elements, function(i, element) {
		$('<li>', { html: element }).appendTo(pllist);
	});
	// and navbox
	var plheader = $('<h3>', {text: mw.msg("tb-inother")});
	var plbox = $('<div>', {'class': 'body', html: pllist}).show();
	var portlet = $('<div>', {'class': 'portal', id: 'p-sl'}).append(plheader, plbox);
	ptb.after(portlet);
}

mw.hook('wikipage.content').add(Projectlinks);


// поздравително съобщение за нерегистрираните потребители
$(function() {
	var shouldSeeWelcomeMsg = mw.ext.isAction("view") // преглед на страница
		&& mw.config.get("wgUserName") === null // нерегистриран потребител
		&& mw.config.get("wgCanonicalNamespace") === "" // основно именно пространство = статия
		&& mw.config.get("wgRestrictionEdit") === [] // няма защита
		&& mw.config.get("wgIsProbablyEditable") === true // може да се редактира
		&& (document.referrer != "") // има препращач
		&& (/bg\.wikipedia\.org/.test(document.referrer) === false) // идва извън Уикипедия
		;
	if (shouldSeeWelcomeMsg) {
		mw.util.$content.prepend('<div class="custom-usermessage"><b>Добре дошли</b> в Уикипедия! Можете не само да четете тази статия, но също така и да я <b><a href="/wiki/%D0%A3%D0%B8%D0%BA%D0%B8%D0%BF%D0%B5%D0%B4%D0%B8%D1%8F:%D0%92%D1%8A%D0%B2%D0%B5%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5" title="Повече информация за редактирането на статии в Уикипедия">редактирате и подобрите</a></b>.</div>');
	}
});


/**
 * Extends the functionality of an inputbox in a div.mwbot element.
 * Appends { { MAINPAGE/SUBPAGE } } to MAINPAGE upon creation of MAINPAGE/SUBPAGE
 */
var Memory = {
	memoryTtl: 86400, // last this many seconds
	allowedActions: ["transcludeSubpage"],
	delim1: "::",
	delim2: ";;",

	memorize: function(jsAction, jsArgs, mwPage, mwAction) {
		mw.cookie.set(
			Memory.getCookieName(mwPage, mwAction),
			jsAction + Memory.delim1 + jsArgs.join(Memory.delim2),
			new Date(Date.now() + Memory.memoryTtl*1000));
	},

	executeCurrentAction: function() {
		var cookieName = Memory.getCookieName(mw.config.get('wgPageName'), mw.config.get('wgAction'));
		var rawData = mw.cookie.get(cookieName);
		if (rawData) {
			mw.cookie.set(cookieName, null);
			var p = rawData.split(Memory.delim1);
			if ( $.inArray(p[0], Memory.allowedActions) !== -1 ) {
				eval(p[0] + '("'
					+ p[1].replace(/"/g, '\\"').split(Memory.delim2).join('", "')
					+ '")');
			}
		}
	},

	getCookieName: function (mwPage, mwAction) {
		return "on" + mwAction + "_" + mwPage;
	}
};


function attachMemorizers() {
	$('.mwbot').find('form[name="createbox"]').each(function() {
		attachMemorizer(this);
	});
}

function attachMemorizer(form) {
	var mainpage = form.title.value.replace(/\/+$/g, '');
	if ( mainpage == "" ) {
		mainpage = mw.config.get('wgPageName');
	}
	form.title.value = "";
	jQuery(form).submit(function() {
		if ( $.trim(this.title.value) == "" ) {
			alert( mw.msg("ta-emptyfield") );
			return false;
		}
		var subpage = this.title.value;
		var prefix = mainpage + "/";
		var prefindex = subpage.indexOf(prefix);
		if ( prefindex == 0 ) { // the prefix is already there, remove it
			subpage = subpage.substr(prefix.length);
		}
		var fullpage = prefix + subpage;
		this.title.value = fullpage;
		// allow summary prefilling by new section
		$('<input>', {type: 'hidden', name: "preloadtitle", value: subpage }).appendTo(this);
		Memory.memorize("transcludeSubpage",
			[mainpage, subpage],
			fullpage.replace(/ /g, "_"), "view");
		return true;
	});
}

function transcludeSubpage(mainpage, subpage) {
	if ( $.trim(mainpage) == "" || $.trim(subpage) == "" ) {
		return;
	}
	var api = new mw.Api();
	var fullpage = mainpage + "/" + subpage;
	api.postWithToken("edit", {
		action: "edit",
		title: mainpage,
		summary: mw.msg("ta-summary", fullpage),
		appendtext: "\n{"+"{" + fullpage + "}}"
	});
}

mw.loader.using(["mediawiki.cookie"]).done(function() {
	attachMemorizers();
	$(".done-by-script").hide();
	$(".showme").show();
	Memory.executeCurrentAction();
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
if (mw.config.get('wgPageName') == 'Начална_страница' || mw.config.get('wgPageName') == 'Беседа:Начална_страница') {
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
			$anchors = $container.find('A');
			slideshow = setInterval(function () {
				index = index < $anchors.length - 1 ? index + 1 : 0;
				$($anchors[index]).click();
			}, 1000);
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

mw.loader.using( ['mediawiki.util', 'mediawiki.notify', 'jquery.client'], function () {
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
 * Пренасочване на addPortletLink към mw.util
 *
 * @deprecated: Използвайте mw.util.addPortletLink.
 */
mw.log.deprecate( window, 'addPortletLink', function () {
    return mw.util.addPortletLink.apply( mw.util, arguments );
}, 'Използвайте mw.util.addPortletLink() вместо това' );

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