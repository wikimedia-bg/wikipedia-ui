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

	// Edit tools
	"et-addchar": "Вмъкване на знака „$1“",
	"et-addpref": "Вмъкване на ",
	"et-ddmenutitle": "Оттук можете да вмъкнете празен шаблон",
	"et-ajaxerror": "Неуспешна връзка: $1 $2\nСтраница: $3\nАдрес: $4",
	"et-tplloading": "Шаблонът се зарежда…",

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
var gLang = { msg: mw.msg };


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


/* * *   Extra buttons for text insertion   * * */

// от тези данни ще се генерират допълнителни бутони с insertTags()
var customInsButtons = {
	// "CODE" : ["LEFT", "MIDDLE", "RIGHT", "SHOWN TEXT", "TITLE"],
	"b1" : ["#виж ["+"[", "Страница", "]]", "вж", "+команда за пренасочване"],
	"b2" : ["<code>", "моля, въведете програмен код", "</code>", "<tt>код</tt>", "Текст в равноширок шрифт — обикновено код"],
	"b3" : ["<sub>", "моля, въведете индекс", "</sub>", "a<sub>x</sub>", "+долен индекс"],
	"b4" : ["<sup>", "моля, въведете степен", "</sup>", "a<sup>x</sup>", "+горен индекс"],
	"b5" : ["\u00a0", "", "", "nbsp", "+несекаем интервал"],
	"b6" : ["„", "текст в кавички", "“", "„“", "+български кавички"],
	"b7" : ["<del>", "зачертан текст", "</del>", "<del>del</del>", "Отбелязване на текст като изтрит"],
	"b8" : ["{"+"{", "", "}}", "{"+"{}}", "+скоби за шаблон"],
	"b9" : ["|", "", "", "&nbsp;|&nbsp;", "+отвесна черта — |"],
	"b10" : ["—", "", "", "—", "+дълга чертица — mdash"],
	"b11" : ["–", "", "", "&nbsp;–&nbsp;", "+средна чертица — ndash"],
	"b12" : ["", "", "&#768;", "удар.", "+ударение за гласна буква (маркирайте една буква)"],
	"b13" : ["<"+"!-- ", "моля, въведете коментар", " -->", "&lt;!--", "+коментар"],
	"b14" : ["{"+"{ЗАМЕСТ:-)}}", "", "", ":-)", "+шаблон „Усмивка“"],
	"b15" : ["{"+"{ЗАМЕСТ:D}}", "", "", ":-D", "+шаблон „Ухилено човече“"],
	"b16" : ["[[en:", "en", "]]", "en:", "+английско междуики"],
	"b19" : ["{"+"{Br}}\n", "", "", "br", "+шаблон Br"],
	"b20" : ["{"+"{subst:", "", "}}", "subst:", "+заместване на шаблон"],
	"b21" : ["<ref>", "", "</ref>", "&lt;ref>", "+източник / бележка под линия"],
	"b21n" : ["<ref name=\"\">", "", "</ref>", "&lt;ref name>", "+многократна употреба на източник / бележка под линия"],
	"b22" : ["["+"[", "", "]]", "[[...]]", "+препратка без разделител"],
	"b23l" : ["["+"[", "", "|]]", "[[...|...]]", "+препратка с разделител (курсорът е отляво)"],
	"b23r" : ["["+"[|", "", "]]", "[[...]]", "+препратка с разделител (курсорът е отдясно)"],
	"b24" : ["["+"[:", "", "]]", "[[:...]]", "+текстова препратка"],
	"b25" : ["#", "", "", "...#...", "+диез"]
};

// cleanup by articles
if (mw.config.get('wgCanonicalNamespace') === '') {
	mw.loader.using("mediawiki.action.edit", function() {
		delete customInsButtons['b14'];
		delete customInsButtons['b15'];
		$('#mw-editbutton-signature').hide();
	});
}


/* * *   Extra buttons for miscelaneous functions   * * */

// името на елемента за допълнителните знаци
var charsElemId = "extraChars";

// данни за още бутони с код по желание
var customMiscButtons = {
	// "CODE" : ["CODE TO RUN", "SHOWN TEXT", "TITLE"],
	// уикификатора
	"#" : ["obrabotka(false)", "#", "Преобразуване на някои знаци"],
	"$" : ["obrabotka(true)", "$", "Преобразуване на числа към БДС"],
	// допълнителните знаци
	"ch" : ["toggleChars()", "Още…", "Виртуална клавиатура"]
};

/* * *   Drop down menus for template insertion   * * */

/* по идея на [[:he:MediaWiki:Summary|еврейската Уикипедия]] */
var tpl1 = {
	// "SHOWN TEXT" : "TEMPLATE CONTENT",
	"Елементи от статията…" : "-",
	"==  ==" : "\n== >>|<< ==\n",
	"===  ===" : "\n=== >>|<< ===\n",
	"Таблица" : "\n{| class=\"wikitable\"\n|+ >>|Заглавие на таблицата|<<\n! колона 1\n! колона 2\n! колона 3\n|-\n| ред 1, клетка 1\n| ред 1, клетка 2\n| ред 1, клетка 3\n|-\n| ред 2, клетка 1\n| ред 2, клетка 2\n| ред 2, клетка 3\n|}",
	"Галерия" : "<center><gallery caption=\">>|<<\">\n Image: | \n Image: | \n Image: | \n Image: | \n</gallery></center>",
	"Източници" : "\n== Източници ==\n<references />\n>>|<<",
	"Вижте също" : "\n== Вижте също ==\n* ["+"[>>|<<]]\n",
	"Външни препратки" : "\n== Външни препратки ==\n* [>>|<<]\n",
	"Сортиране по ключ" : "{"+"{СОРТКАТ:>>|<<}}",
	"Категория" : "["+"[Категория:>>|<<]]",
	"Мъниче" : "{"+"{мъниче>>|<<}}",
	"Към пояснение" : "{"+"{към пояснение|"+ mw.config.get('wgTitle') +"|>>|<<"+ mw.config.get('wgTitle') +" (пояснение)}}"
};

var atplb = "МедияУики:Common.js/Edit tools data/";
var atpl1 = {
	// "SHOWN TEXT" : "PAGE NAME",
	"Тематични шаблони…" : "-",
	"Биография инфо" : atplb + "Биография инфо",
	"Книга инфо" : atplb + "Книга инфо",
	"Писател" : atplb + "Писател",
	"Музикален албум" : atplb + "Музикален албум",
        "Музикален изпълнител" : atplb + "Музикален изпълнител",
	"Филм" : atplb + "Филм",
	"Актьор" : atplb + "Актьор",
	"Футболен отбор" : atplb + "Футболен отбор",
	"Футболист" : atplb + "Футболист",
	"Тенисист" : atplb + "Тенисист",
	"Таксокутия" : atplb + "Таксокутия",
	"Самолет" : atplb + "Самолет"

};

var atpl2 = {
	"Работни шаблони…" : "-",
	"Шаблони за статии" : {
		"Авторски права" : atplb + "Авторски права",
		"Бързо изтриване" : atplb + "Бързо изтриване",
		"Друго значение" : atplb + "Друго значение",
		"Изтриване" : atplb + "Изтриване",
		"Източник?" : atplb + "Източник",
		"Микромъниче" : atplb + "Микромъниче",
		"Обработка" : atplb + "Обработка",
		"Пояснение" : atplb + "Пояснение",
		"Превод от" : atplb + "Превод от",
		"Редактирам" : atplb + "Редактирам",
		"Сливане" : atplb + "Сливане",
		"Сюжет" : atplb + "Сюжет",
		"Цитат" : atplb + "Цитат",
		"Цитат уеб" : atplb + "Цитат уеб",
		"Цитат книга" : atplb + "Цитат книга",
		"Уикицитат" : atplb + "Уикицитат",
		"Commons" : atplb + "Commons",
		"Commonscat" : atplb + "Commonscat",
		"IMDB Name" : atplb + "Imdb name",
		"IMDB Title" : atplb + "Imdb title"
	},
	"Шаблони за беседи" : {
		"Добре дошли" : atplb + "Добре дошли",
		"Добре дошли нерег" : atplb + "Добре дошли нерег",
		"Неподписано" : atplb + "Неподписано",
		"Предварителен преглед" : atplb + "П-преглед",
		"Забележка-вандал" : atplb + "П-вандал1",
		"Забележка-изтриване" : atplb + "П-изтриване1",
		"Забележка-копиране" : atplb + "П-копиране1",
		"Забележка-спам" : atplb + "П-спам1",
		"Забележка-тест" : atplb + "П-тест1",
		"Забележка-шега" : atplb + "П-шега1"
	},
	"Шаблони за картинки" : {
		"Без лиценз" : atplb + "Без лиценз"
	},
	"Шаблони за категории" : {
		"Категория" : atplb + "Категория",
		"Категория инфо" : atplb + "Категория инфо"
	},
	"Шаблони за шаблони" : {
		"Навигационен шаблон" : atplb + "Навигационен шаблон",
		"Шаблон на мъниче" : atplb + "Шаблон на мъниче",
		"Includeonly" : atplb + "Includeonly",
		"Noinclude" : atplb + "Noinclude"
	}
};

var tplVarBaseName = "tpl";
var atplVarBaseName = "atpl";

var chars = [
       ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С',
	'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ь', 'Ю', 'Я', 'Ы', 'Э', 'а', 'б', 'в', 'г',
	'д', 'е', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х',
	'ц', 'ч', 'ш', 'щ', 'ъ', 'ь', 'ю', 'я', 'ы', 'э'],
       ['ѣ', 'ѫ', 'ѭ', 'ѧ', 'ѩ', 'Ї', 'Ҁ', 'Ѹ', 'Ѡ', 'Ѻ', 'Ъ', 'І', 'Ҍ', 'Ѩ', 'Ѭ', 'Ѯ', 'Ѵ',
	'Ѥ', 'Ѿ'],
       ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ',
	'ς', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω'],
       ['½', '¼', '¾', '∫', '∑', '∏', '√', '−', '±', '∞', '≈', '~', '∝', '≡', '≠', '≤', '≥', '×',
	'·', '÷', '∂', '′', '″', '∇', '∮', '⊥', '‰', '∴', 'ℵ',	'ℋ', '℧', '^', '¹', '²', '³', '∈',
	'∉', '∩', '∪', '⊂', '⊃', '⊆', '⊇', '∧', '∨', 'ø', '¬',	'∃', '∀', '⇒', '⇐','⇓', '⇑',
	'⇔', '→', '←', '↓', '↑', '↔',  '⇄', '⇆', '⇋', '⇌', 'ℕ', 'ℤ', 'ℚ', 'ℝ', 'ℂ', '∅', '⋮',
	'⋯'],
       ['*', '~', '|', '[',  ']', '°', '№', '™', '©', '®', '¢', '€', '¥', '£', '¤', '¿', '¡',
	'«', '»', '§', '¶', '†', '‡', '•', '♀', '♂', '…', '¨'],
       ['Á', 'á', 'É', 'é', 'Í', 'í', 'Ó', 'ó', 'Ú', 'ú', 'À', 'à', 'È', 'è', 'Ì', 'ì', 'Ò', 'ò',
	'Ù', 'ù', 'Â', 'â', 'Ê', 'ê', 'Î', 'î',	'Ô', 'ô', 'Û', 'û', 'Ä', 'ä', 'Ë', 'ë', 'Ï', 'ï',
	'Ö', 'ö', 'Ü', 'ü', 'ß', 'Ã', 'ã', 'Ñ', 'ñ', 'Õ', 'õ', 'Ç', 'ç', 'Ģ', 'ģ', 'Ķ', 'ķ', 'Ļ',
	'ļ', 'Ņ', 'ņ', 'Ŗ', 'ŗ', 'Ş', 'ş', 'Ţ', 'ţ', 'Ć', 'ć', 'Ĺ', 'ĺ', 'Ń', 'ń', 'Ŕ', 'ŕ', 'Ś',
	'ś', 'Ý', 'ý', 'Ź', 'ź', 'Đ', 'đ', 'Ů', 'ů', 'Č', 'č', 'Ď', 'ď', 'Ľ', 'ľ', 'Ň', 'ň', 'Ř',
	'ř', 'Š', 'š', 'Ť', 'ť', 'Ž', 'ž', 'Ǎ', 'ǎ', 'Ě', 'ě', 'Ǐ', 'ǐ', 'Ǒ', 'ǒ', 'Ǔ', 'ǔ', 'Ā',
	'ā', 'Ē', 'ē', 'Ī', 'ī', 'Ō', 'ō', 'Ū', 'ū', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'Ĉ', 'ĉ', 'Ĝ', 'ĝ', 'Ĥ',
	'ĥ', 'Ĵ', 'ĵ', 'Ŝ', 'ŝ', 'Ŵ', 'ŵ', 'Ŷ', 'ŷ', 'Ă', 'ă', 'Ğ', 'ğ', 'Ŭ', 'ŭ', 'Ċ', 'ċ', 'Ė',
	'ė', 'Ġ', 'ġ', 'İ', 'ı', 'Ż', 'ż', 'Ą', 'ą', 'Ę', 'ę', 'Į', 'į', 'Ų', 'ų', 'Ł', 'ł', 'Ő',
	'ő', 'Ű', 'ű', 'Ŀ', 'ŀ', 'Ħ', 'ħ', 'Ð', 'ð', 'Þ', 'þ', 'Œ', 'œ', 'Æ', 'æ', 'Ø', 'ø', 'Å',
	'å']
];

var showMenus = true;
var showButtons = true;

function setCustomInsButton(code, left, middle, right, shownText, title) {
	customInsButtons[code] = [left, middle, right, shownText, title];
}

function setCustomMiscButton(code, codeToRun, shownText, title) {
	customMiscButtons[code] = [codeToRun, shownText, title];
}

function rmCustomInsButtons(rmButtons) {
	rmCustomButtons(customInsButtons, rmButtons);
}
function rmCustomMiscButtons(rmButtons) {
	rmCustomButtons(customMiscButtons, rmButtons);
}
function rmCustomButtons(allButtons, rmButtons) {
	for (var i = rmButtons.length - 1; i >= 0; i--) {
		delete( allButtons[ rmButtons[i] ] );
	}
}

/**
	insert an edit toolbar before the textarea.
	useful for testing user script pages while previewing
	use it with:
		putToolbar();
	put in your script page, e.g. User:Your_Name/monobook.js
*/
function putToolbar(rightNow) {
	var toolbar = $('<div>', {'class': 'custom-toolbar'});
	var putIt = function() {
		$("#editform").before(toolbar);
	};
	if ( window.rightNow ) {
		putIt();
	} else {
		$(putIt);
	}
	return toolbar;
}

if (mw.ext.isAction(['edit', 'submit'])) {
	importScript('МедияУики:Common.js/edit.js');
}


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
		var cssItemShown = { bottom: "1px", color: "black" };
		var cssItemHidden = { bottom: "0", color: "#444" };
		$container.find('.location-map').each(function(idx) {
			var ThisBox = this;
			var toggle = $('<a href="#">'+ThisBox.getElementsByTagName('img')[0].alt+'</a>').on('click', function() {
				$container.find('.location-map').hide();
				$(ThisBox).show();
				$ToggleLinksDiv.find('li').css(cssItemHidden);
				$(this).parent().css(cssItemShown);
				return false;
			});
			var $li = $('<li>').append(toggle).appendTo($ToggleLinksDiv);
			if (idx == 0) {
				$li.css(cssItemShown);
			} else {
				ThisBox.style.borderTop = '0';
				$(ThisBox).hide();
				$li.css(cssItemHidden);
			}
		});
		$container.append($ToggleLinksDiv);
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

 /** Междууики връзки към избрани статии ****************************************
 *
 * Описание: Указва междуезиковите препратки към избраните статии на други езици
 *              чрез звездичка вместо точка пред тях.
 * Поддържа се от: [[:en:User:R. Koot]]
 */
function LinkFA() {
    if ( document.getElementById( 'p-lang' ) ) {
        var InterwikiLinks = document.getElementById( 'p-lang' ).getElementsByTagName( 'li' );

        for ( var i = 0; i < InterwikiLinks.length; i++ ) {
            var className = InterwikiLinks[i].className.match(/interwiki-[-\w]+/);
            if ( document.getElementById( className + '-fa' ) && InterwikiLinks[i].className.indexOf( 'badge-featuredarticle' ) === -1 ) {
                InterwikiLinks[i].className += ' FA';
                InterwikiLinks[i].title = 'Тази статия на друг език е избрана';
            } else if ( document.getElementById( className + '-ga' ) && InterwikiLinks[i].className.indexOf( 'badge-goodarticle' ) === -1 ) {
                InterwikiLinks[i].className += ' GA';
                InterwikiLinks[i].title = 'Тази статия на друг език е определена за добра';
            }
        }
    }
}

mw.hook( 'wikipage.content' ).add( LinkFA );

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

/* Край на mw.loader.using callback */
} );
/* НЕ ДОБАВЯЙТЕ КОМАНДИ ПОД ТОЗИ РЕД */