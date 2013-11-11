/** Namespace constants */
var
NS_MEDIA          = -2,
NS_SPECIAL        = -1,
NS_MAIN           = 0,
NS_TALK           = 1,
NS_USER           = 2,
NS_USER_TALK      = 3,
NS_PROJECT        = 4,
NS_PROJECT_TALK   = 5,
NS_IMAGE          = 6,
NS_IMAGE_TALK     = 7,
NS_MEDIAWIKI      = 8,
NS_MEDIAWIKI_TALK = 9,
NS_TEMPLATE       = 10,
NS_TEMPLATE_TALK  = 11,
NS_HELP           = 12,
NS_HELP_TALK      = 13,
NS_CATEGORY       = 14,
NS_CATEGORY_TALK  = 15;

var
DEFAULT_USER_LANGUAGE = "bg",
FALLBACK_USER_LANGUAGE = "en";

/**
	Replaces the scope in a function with the object’s one.
	Based on definition from the Prototype framework (http://prototype.conio.net/).
*/
Function.prototype.bind = function(object) {
	var __method = this;
	return function() {
		return __method.apply(object, arguments);
	}
}

/** Checks if a value exists in an array */
function inArray(val, arr) {
	if ( null == arr ) {
		return false;
	}
	for (var i = 0, len = arr.length; i < len ; i++) {
		if (arr[i] === val) {
			return true;
		}
	}
	return false;
}


// from http://www.quirksmode.org/js/cookies.html
// escape(), unescape() methods added
var Cookie = {
	create: function(name, value, days) {
		var expires;
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			expires = "; expires=" + date.toGMTString();
		} else {
			expires = "";
		}
		document.cookie = Cookie.escape(name) + "=" + Cookie.escape(value)
			+ expires + "; path=/";
	},

	read: function(name) {
		var nameEQ = Cookie.escape(name) + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') {
				c = c.substring(1, c.length);
			}
			if (c.indexOf(nameEQ) === 0) {
				return Cookie.unescape(c.substring(nameEQ.length, c.length));
			}
		}
		return null;
	},

	erase: function(name) {
		Cookie.create(name, "", -1);
	},

	escape: function(v) {
		return encodeURIComponent(v);
	},
	unescape: function(v) {
		return decodeURIComponent(v);
	}
};


var _lang_messages = {};
_lang_messages["bg"] = {
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
	"ta-summary" : "Вграждане на [[$1]]",
	"ta-bpsummary" : "Нова тема: [[$1]]",

	// Toolbox add-ons
	"tb-subpages": "Подстраници",
	"tb-subpages-settings": "Показване на препратка към подстраниците в кутията с инструменти:",
	"tb-inother": "В други проекти",

	"":""
};

var _debug_lang = false;

function MessageLanguage() {
	this.lang = DEFAULT_USER_LANGUAGE;
	this.messages = {};
	this.prefix = "";

	this.addMessages = function(messages, code, prefix) {
		if ( typeof this.messages[code] == "undefined" ) {
			this.messages[code] = {};
		}
		var p = typeof prefix == "string" ? prefix : "";
		for (var key in messages) {
			if ( typeof key == "string" ) {
				this.messages[code][p + key] = messages[key];
			}
		}
	};

	this.setLanguage = function(langCode) {
		this.lang = langCode;
		this.importMessages( this.lang );
	};

	this.setPrefix = function(prefix) {
		this.prefix = prefix;
	};

	this.msg = function(key) {
		key = this.prefix + key;
		var msg = this.messages[this.lang] && this.messages[this.lang][key];
		if ( typeof msg == "undefined" ) {
			if ( _debug_lang ) console.log(key + " го няма на "+this.lang);
			msg = this.messages[FALLBACK_USER_LANGUAGE]
				&& this.messages[FALLBACK_USER_LANGUAGE][key];
		}
		if ( typeof msg == "undefined" ) {
			return "{"+ key +"}";
		}
		for (var i = 1; i < arguments.length; i++) {
			msg = msg.replace( new RegExp("\\$"+i, "g"), arguments[i]);
		}
		return msg;
	};

	// FIXME this is currently broken
	this.importMessages = function(lang) {
		importScript("МедияУики:Messages/" + lang + ".js");
	};
}


var gLang = new MessageLanguage();

// import message files
if (wgUserLanguage !== "bg") {
	gLang.setLanguage( wgUserLanguage );
}

var mainLangs = [ DEFAULT_USER_LANGUAGE, FALLBACK_USER_LANGUAGE ];
if ( ! inArray( wgUserLanguage, mainLangs ) ) {
	gLang.importMessages( FALLBACK_USER_LANGUAGE );
}

// add messages on load
mw.hook('wikipage.content').add( function() {
	if ( typeof _lang_messages[ wgUserLanguage ] == "object" ) {
		gLang.addMessages( _lang_messages[ wgUserLanguage ], wgUserLanguage );
	}
	if ( typeof _lang_messages[ FALLBACK_USER_LANGUAGE ] == "object" ) {
		if ( ! inArray( wgUserLanguage, mainLangs ) ) {
			gLang.addMessages( _lang_messages[ FALLBACK_USER_LANGUAGE ],
				FALLBACK_USER_LANGUAGE );
		}
	}
});


 /** MediaWiki media player *******************************************************
   *
   *  Description: A Java player for in-browser playback of media files.
   *  Created by: [[:en:User:Gmaxwell]]
   */

mw.loader.load('//en.wikipedia.org/w/index.php?title=Mediawiki:Wikimediaplayer.js&action=raw&ctype=text/javascript');


/* * * * * * * * * *   Toolbox add-ons   * * * * * * * * * */

/***** subPagesLink ********
 * Adds a link to subpages of current page
 * (copied from [[commons:MediaWiki:Common.js]] and slightly modified)
 */
var subPagesLink = {
	wo_ns : [NS_MEDIA, NS_SPECIAL, NS_IMAGE, NS_CATEGORY],

	install: function() {
		if ( document.getElementById("p-tb")
				&& ! inArray( wgNamespaceNumber, subPagesLink.wo_ns) )
		{
			mw.util.addPortletLink( 'p-tb',
				mw.util.wikiGetlink('Special:Prefixindex/' + wgPageName +'/'),
				gLang.msg("tb-subpages"), 't-subpages' );
		}
	}
}
mw.hook('wikipage.content').add( function() {
	subPagesLink.install();

	if ( inArray("sysop", wgUserGroups) && wgCanonicalNamespace.indexOf("User") === 0 ) {
		mw.util.addPortletLink( 'p-tb',
			mw.util.wikiGetlink('Специални:Потребителски права/' + wgTitle),
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
		"wiktionary" : gLang.msg("wiktionary"),
		"wikiquote" : gLang.msg("wikiquote"),
		"wikibooks" : gLang.msg("wikibooks"),
		"wikisource" : gLang.msg("wikisource"),
		"wikinews" : gLang.msg("wikinews"),
		"wikispecies" : gLang.msg("wikispecies"),
		"wikiversity" : gLang.msg("wikiversity"),
		"commons.wiki" : gLang.msg("commons")
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
	var plheader = $('<h3>', {text: gLang.msg("tb-inother")});
	var plbox = $('<div>', {'class': 'body', html: pllist}).show();
	var portlet = $('<div>', {'class': 'portal', id: 'p-sl'}).append(plheader, plbox);
	ptb.after(portlet);
}

mw.hook('wikipage.content').add(Projectlinks);


/**
	чрез тази функция се показва поздравително съобщение на всеки НЕвлязъл потребител, ако:
		— страницата НЕ е защитена
		— страницата Е от основното именно пространство, т.е. Е статия
		— има препращач
		— препращачът НЕ съдържа wikipedia.org (например идва от Гугъл)
	взета е от [[:de:MediaWiki:Monobook.js]], с малки промени
*/
function externMessage() {
	if (
		((self.location.href + "").indexOf("/wiki/") != -1) &&  // дали потребителят вече не редактира
		(document.getElementById("pt-login")) &&  // дали потребителят НЕ е влязъл
		(document.getElementById("ca-edit")) &&   // дали страницата НЕ е защитена
		(document.getElementsByTagName("body")[0].className == "ns-0") &&   // дали страницата Е статия
		(document.referrer != "") &&             // дали ИМА препращач
		(document.referrer.search(/wikipedia\.org/) == -1) // дали препращачът НЕ съдържа wikipedia.org
		)
	{
		var externMessage = document.createElement("div");
		externMessage.setAttribute('id','externMessage');
		// Съобщението, показвано на потребителите
		externMessage.innerHTML = '<b>Добре дошли</b> в Уикипедия! Можете не само да четете тази статия, но също така и да я <b><a href="/wiki/%D0%A3%D0%B8%D0%BA%D0%B8%D0%BF%D0%B5%D0%B4%D0%B8%D1%8F:%D0%92%D1%8A%D0%B2%D0%B5%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5" title="Повече информация за редактирането на статии в Уикипедия">редактирате и подобрите</a></b>.';
		document.getElementById("bodyContent").insertBefore(
		externMessage, document.getElementById("contentSub")
		);
	}
}

mw.hook('wikipage.content').add(externMessage);


/* * * * * * * * * *   Edit tools functions   * * * * * * * * * */

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
	"b22" : ["["+"[", "", "]]", "[[...]]", "+препратка без разделител"],
	"b23" : ["["+"[|", "", "]]", "[[...|...]]", "+препратка с разделител (курсорът е отдясно)"],
	"b24" : ["["+"[:", "", "]]", "[[:...]]", "+текстова препратка"],
	"b25" : ["#", "", "", "...#...", "+диез"]
};

// cleanup by articles
if (mw.config.get('wgCanonicalNamespace') === '' && mw.config.get('wgAction') === "edit") {
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
	"Към пояснение" : "{"+"{към пояснение|"+ wgTitle +"|>>|<<"+ wgTitle +" (пояснение)}}"
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

/* * *   Virtual keyboard characters   * * */

var existChars = false; // are the extra chars already added

/** generate and add extra chars in the element $charsElemId  */
function addChars() {
	// if there are extra chars already, do nothing
	if ( existChars ) { return; }
	var cont = '';
	var len = chars.length;
	for (var i in chars) {
		for (var j in chars[i]) {
			cont += "<a href=\"javascript:insertTags('"+chars[i][j]+"', '', '')\" "+
			'title="' + gLang.msg("et-addchar", chars[i][j]) +'">'+chars[i][j]+'</a> ';
		}
		if (i != len-1) { cont += '<br/>'; }
	}
	$('#'+charsElemId).html(cont);
	existChars = true;
}

function toggleChars() {
	addChars();
	$('#'+charsElemId).toggle();
}

/* * *   Extra buttons for text insertion   * * */

/** add some buttons and drop-down menus */
function setupCustomEditTools() {
	if ( !$("#editform").length ) {
		return;
	}
	var toolbar = putToolbar(true);
	toolbar.addClass("buttonlinks");
	if ( showMenus ) {
		// drop-down menus inserting text put direct in the javascript
		appendDropDownMenus(toolbar, tplVarBaseName, insertIntoWikiText);
		// drop-down menus inserting content from wiki pages
		appendDropDownMenus(toolbar, atplVarBaseName, loadPage);
	}
	if ( showButtons ) {
		appendCustomButtons(toolbar);
		appendExtraChars(toolbar);
	}
}

mw.hook( 'wikipage.content' ).add( function() {
	var runSetupOnUserReady = function() {
		if ( mw.loader.getState('user') === 'ready' ) {
			setupCustomEditTools();
		} else {
			setTimeout(runSetupOnUserReady, 200);
		}
	};
	runSetupOnUserReady();
} );


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

function appendCustomButtons(parent) {
	var buts = $('<div>', { id: "custombuttons" });
	for (var i in customInsButtons) {
		var el = customInsButtons[i];
		var title = el[4];
		if ( title.charAt(0) == "+" ) {
			title = gLang.msg("et-addpref") + title.substr(1);
		}
		appendCustomButton(buts, {
			href: "javascript:insertTags('"+el[0] +"','"+el[2]+"','"+ el[1]+"')",
			title: title,
			html: el[3]
		});
	}
	for (var i in customMiscButtons) {
		var el = customMiscButtons[i];
		appendCustomButton(buts, {
			href: "javascript:"+el[0],
			title: el[2],
			html: el[1]
		});
	}
	parent.append(buts);
}

function appendCustomButton(box, item) {
	box.append($('<a>', item), ' ');
}

function appendExtraChars(parent) {
	if (window.charsElemId) {
		$('<div>', { id: charsElemId, style: 'display: none' }).appendTo(parent);
	}
}

function appendDropDownMenus(parent, tplVarBaseName, callback) {
	var tplVar = null;
	for ( var i = 1; tplVar = tplVarBaseName + i,
			eval("var tpl = typeof("+ tplVar +") == 'object' ? "+ tplVar +" : null"),
			tpl != null; i++ ) {
		appendDropDownMenu(parent, tpl, callback, "ddmenu_" + tplVar);
	}
}

/** generates a drop-down menu */
function appendDropDownMenu(parent, content, callback, id) {
	var box = $('<select>', {
		id: id,
		title: gLang.msg("et-ddmenutitle")
	}).on('change', function() {
		if (this.value != "-") {
			callback(this.value);
			this.selectedIndex = 0;
		}
		return;
	});
	if ( appendOptions(box, content) > 1 ) {
		parent.append(box);
	}
}

function appendOptions(box, opts) {
	var count = 0;
	for (var i in opts) {
		if (opts[i] == "") {
			continue; // skip emtpy entries
		}
		if (typeof opts[i] == "object") {
			var g = $('<optgroup>', {label: i});
			for (var k in opts[i]) {
				$('<option>', { value: opts[i][k], text: k }).appendTo(g);
			}
			box.append(g);
		} else {
			$('<option>', { value: opts[i], text: i }).appendTo(box);
		}
		count++;
	}
	return count;
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
		mw.hook('wikipage.content').add(putIt);
	}
	return toolbar;
}


/* * * * * * * * * *   Ajax functions   * * * * * * * * * */

var prevReq;
var pageUrlTpl = wgScript + "?title=$1&action=raw&templates=expand";
var pageUrl = "";
var pageToFetch = "";

function loadPage(page) {
	prevReq = sajax_init_object();
	if ( !prevReq ) return false;
	pageToFetch = page;
	pageUrl = pageUrlTpl.replace(/\$1/, encodeURI(page));
	showLoadIndicator();
	prevReq.onreadystatechange = insertIntoWikiTextFromRequest;
	prevReq.open("GET", pageUrl, true);
	prevReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	prevReq.send(null);
	return true;
}

function insertIntoWikiTextFromRequest() {
	if ( prevReq.readyState != 4 ) {
		return;
	}
	hideLoadIndicator();
	if ( prevReq.status != 200 ) {
		window.alert(gLang.msg("et-ajaxerror", prevReq.status, prevReq.statusText,
			pageToFetch, pageUrl));
		return;
	}
	insertIntoWikiText(prevReq.responseText);
}

function insertIntoWikiText(content) {
	// delete text marked for no inclusion + <pre> and <nowiki>
	var re = /<!--noinclude-->.*<!--\/noinclude-->|<\/?pre>|<\/?nowiki>/g;
	content = content.replace(re, "");
	// replace escaped tags
	var specials = ["pre", "nowiki"];
	for (var i in specials) {
		re = new RegExp("\\[(\/?)"+ specials[i] +"\\]", "g");
		content = content.replace(re, "<$1"+ specials[i] +">");
	}

	// we can have >>|sample text|<< or >>|<< or just simple text
	var parts = null;
	var left, right, def = "";
	content = escapeNl(content);
	if ( ( parts = content.match(/(.*)>>\|(.*)\|<<(.*)/) ) ) {
		left = parts[1];
		def = parts[2];
		right = parts[3];
	} else { // no sample text: split at caret’s position
		parts = content.split(">>|<<");
		left = parts[0];
		delete(parts[0]);
		right = parts.join("");
	}
	insertTags(unescapeNl(left), unescapeNl(right), unescapeNl(def));
}

function escapeNl(s) { return s.replace(/\n/g, "\x01"); }
function unescapeNl(s) { return s.replace(/\x01/g, "\n"); }

var loadIndicator;
function showLoadIndicator() {
	if ( loadIndicator ) {
		loadIndicator.style.display = "block";
		return;
	}
	loadIndicator = document.createElement("div");
	loadIndicator.id = "loadIndicator";
	loadIndicator.appendChild( document.createTextNode(gLang.msg("et-tplloading")) );
	document.getElementsByTagName("body")[0].appendChild(loadIndicator);
}

function hideLoadIndicator() {
	if (loadIndicator) loadIndicator.style.display = "none";
}


/* * * * * * * * * *   Wikificator functions   * * * * * * * * * */

var txt; // текста, който ще се обработва от Уикификатора

// BEGIN код от [[:ru:MediaWiki:Summary]], вижте [[:ru:Википедия:Викификатор]]
function obrabotka(bds) {
	check_regexp();//Проверяем поддерживаются ли рег. выражения
	document.editform.wpTextbox1.focus();
	var txtarea = document.editform.wpTextbox1;
	if(document.selection  && !is_gecko)/* IE*/ {
		txt = " "+document.selection.createRange().text;
		if (txt == " ")  {all_text(bds);} //Если ничего не выделено
		else{
			zamena(bds);
			txt = txt.substr (1, txt.length-1);
			document.selection.createRange().text = txt;
		}
	} else if((txtarea.selectionStart || txtarea.selectionStart == '0')&&(navigator.productSub>20031000)) /*Gecko-браузеры старше 10.2003*/ {
		var startPos = txtarea.selectionStart;
		var endPos = txtarea.selectionEnd;
		var scrollTop=txtarea.scrollTop;
		txt = " "+(txtarea.value).substring(startPos, endPos);
		if (txt == " ")  {all_text(bds);} //Если ничего не выделено
		else{
			zamena(bds);
			txt = txt.substr (1, txt.length-1);
			txtarea.value = txtarea.value.substring(0, startPos) + txt + txtarea.value.substring(endPos, txtarea.value.length);
			txtarea.focus();
		}
	} else if (confirm("Уикификатор ще обработи ЦЕЛИЯ текст в статията. Да продължи ли?")) {
		all_text(bds); // Прочие браузеры
	}
}


function all_text(bds) { //Обрабатываем текст целиком
	txt = " "+document.editform.wpTextbox1.value;
	zamena(bds);
	txt = txt.substr (1, txt.length-1);
	document.editform.wpTextbox1.value=txt;
}


function check_regexp() { //Проверяем поддерживаются ли рег. выражения
	if ("код".replace(/д/g, "т") != "кот"){
		alert("Уикификатор не може да работи с вашия браузър");exit;
	}
	var b_ver=navigator.appVersion.substr(0, 1);
	if (navigator.appName=="Netscape"&&b_ver<5){
		alert("Уикификатор не може да работи с браузър Netscape 4.x или по-стари версии");exit;
	}
}

function zamena(bds) {
	if (bds) { zamena_5ko(); return; }

	// Заменяем теги <b>, <strong> и <i>, <em> на ''' и ''
	txt = txt.replace(/\<\/?(b|strong)\>/g, "\'\'\'");
	txt = txt.replace(/\<\/?(i|em)\>/g, "\'\'");

	// Замяна на всяко "ù" с "и&#768;"
	txt = txt.replace(/ù/g, "и&#768;");

	//Исключаем из обработки всё, что находится между тегами <nowiki> и </nowiki>
	i_nowiki=0;
	a_nowiki=txt.match(/\<nowiki\>(.+)\<\/nowiki\>/g)
	r_nowiki=/\<nowiki\>(.+)\<\/nowiki\>/;
	while (r_nowiki.test(txt))
	{
	i_nowiki++;
	txt = txt.replace(r_nowiki, "\x03"+i_nowiki+"\x04");
	}

	//Исключаем из обработки всё, что находится между тегами <math> и </math>
	i_math=0;
	a_math=txt.match(/\<math\>(.+)\<\/math\>/g)
	r_math=/\<math\>(.+)\<\/math\>/;
	while (r_math.test(txt))
	{
	i_math++;
	txt = txt.replace(r_math, "\x05"+i_math+"\x06");
	}

	//Исключаем из обработки строки, начинающиеся с пробела
	f_space=txt.substr (0, 1);
	txt = txt.substr (1, txt.length-1);
	i_space=0;
	a_space=txt.match(/^( )(.+)$/mg)
	r_space=/^( )(.+)$/m;
	while (r_space.test(txt))
		{
		i_space++;
		txt = txt.replace(r_space, "\x07"+i_space+"\x08");
		}
	txt=f_space+txt;

	//Исключаем всё между [[ и ]]
	i_links=0;
	a_links=txt.match(/(\[\[)(.*?)(\]\])/g)
	r_links=/(\[\[)(.*?)(\]\])/;
	while (r_links.test(txt))
	{
	i_links++;
	txt = txt.replace(r_links, "\x15"+i_links+"\x16");
	}

	//Исключаем из обработки весь текст в кавычках после знака "="
	i_equal=0;
	a_equal=txt.match(/(=)(\s?)(\")(.*?)(\")/g)
	r_equal=/(=)(\s?)(\")(.*?)(\")/;
	while (r_equal.test(txt))
	{
	i_equal++;
	txt = txt.replace(r_equal, "\x11"+i_equal+"\x14");
	}

	//Заменяем обычными кавычками сочетания << и >>.
	txt = txt.replace(/(\<|\>|\&[lg]t;)\1/g, "\"");

	//Исключаем из обработки прочие HTML-теги ("<" и ">")
	i=0;
	a=txt.match(/<([^>]*)>/g)
	r=/<([^>]*)>/;
	while (r.test(txt))
	{
	i++;
	txt = txt.replace(r, "\x01"+i+"\x02");
	}

	//Заменяем правильные символы на неверные, чтобы ничего не пропустить
	txt = txt.replace(/–/g, "-");
	txt = txt.replace(/(«|»|“|”|„|\&((la|ra|bd|ld)quo|#132|#147|#148|quot);)/g, "\"");

	// Заменяем "...", &hellip; и &#133; на многоточие
	txt = txt.replace(/(\.{3}|\&(hellip|#133);)/g, '…');

	// Обработчик знака градуса и "+-"
	txt = txt.replace(/(\+[--])/g, "±");
	txt=txt.replace(/([\s\>\(\*\"]|^)\-([0-9\.\,]+)\s?\^?\s?([FC])(?=[\s\"\.\,;\<]|$)/g, "$1-$2\u00A0\u00B0$3");
	txt=txt.replace(/([\s\>\(\*\"]|^)\+([0-9\.\,]+)\s?\^?\s?([FC])(?=[\s\.\,;\<\"]|$)/g, "$1+$2\u00A0\u00B0$3");
	txt=txt.replace(/([\s\>\(\*\"]|^)\±([0-9\.\,]+)\s?\^?\s?([FC])(?=[\s\.\,;\<\"]|$)/g, "$1±$2\u00A0\u00B0$3");
	txt=txt.replace(/\&deg;/g, "\u00B0");

	// Обработчик минуса
	txt=txt.replace(/([sup\>|sub\>|\s])(-)(\d)/g, "$1-$3");
	txt = txt.replace(/(\d )(-)( \d)/g, "$1-$3");

	// Заменяем кавычки
	//(") с „“
	txt = txt.replace(/([\x01-(\s\|\"])(\")([^\"]{0,})([^\s\"(])(\")/g, "$1„\$3\$4“");
	// Кавычки внутри кавычек
	if (/"/.test(txt))
		{
	txt = txt.replace(/([\x01(\s\"])(\")([^\"]{0,})([^\s\"(])(\")/g, "\$1„\$3\$4“");
	while (/(„)([^“]*)(„)/.test(txt))
	txt = txt.replace(/(„)([^“]*)(„)([^“]*)(“)/g, "\$1\$2«\$4»");
		}

	// Заменяем " - " на тире
	txt = txt.replace(/(&nbsp;|\s)-{1,2} /g,'$1\u2014 ');
	txt = txt.replace (/^- /g,"\u2014 ");
	txt = txt.replace(/(\d)--(\d)/g, "$1–$2");
	txt = txt.replace(/(^|\s)(\d{4})-(\d{4})($|\s|\.|,)/mg, "$1$2–$3$4");
	txt = txt.replace(/(^|\s)([IVXLCDM]+)-([IVXLCDM]+)($|\s|\.|,)/img, "$1$2–$3$4");
	txt = txt.replace(/-- /g, "— ");

	// Спец-значки ©, ®, ™, § и €.
	txt = txt.replace(/(\((c|с)\)|\&copy;)/gi, "©");
	txt = txt.replace(/(\(r\)|\&reg;)/gi, "®");
	txt = txt.replace(/(\((tm|тм)\)|\&trade;)/gi, "™");
	txt = txt.replace(/(\(p\)|\&sect;)/gi, "\u00A7");
	txt = txt.replace (/\&euro;/gi, "€");

	// Вставляем пропущенные и убираем лишние пробелы
	txt=txt.replace(/([А-Я]\.)([А-Я]\.)([А-Я][а-я])/g, "$1 $2 $3");
	txt=txt.replace(/([А-Я]\.)([А-Я]\.)/g, "$1 $2");
	txt=txt.replace(/^([#\*])([\*#]*)([\[\"\(\„\w\dа-яё])/mg, "$1$2 $3");
	txt=txt.replace(/^(=+)([^\s^=])([^=]+)([^\s^=])(=+)/mg, "$1 $2$3$4 $5");
	txt=txt.replace(/([а-я])(\.)([А-Я])/g, "$1$2 $3");
	txt = txt.replace(/([а-яa-z\)\»\“\"\]])(\s*)(\,)([а-яa-z\(\«\„\"\[])/g, "$1$3 $4");
	txt = txt.replace(/([а-яa-z\)\»\“\"\]])(\s)([\,\;])(\s)([а-яa-z\(\«\„\"\[])/g, "$1$3 $5");
	txt = txt.replace(/(\d)(\s)([%‰])/g, "$1$3");

	//Возвращаем обратно строки, начинающиеся с пробела.
	i_space=0;
	r_space=/\x07([0-9]*)\x08/;
	while (r_space.test(txt))
	{
	i_space++;
	txt = txt.replace(r_space, a_space[i_space-1]);
	}

	//Возвращаем обратно всё, что было между тегами "math".
	i_math=0;
	r_math=/\x05([0-9]*)\x06/;
	while (r_math.test(txt))
	{
	i_math++;
	txt = txt.replace(r_math, a_math[i_math-1]);
	}

	//Возвращаем обратно всё, что было между тегами "nowiki".
	i_nowiki=0;
	r_nowiki=/\x03([0-9]*)\x04/;
	while (r_nowiki.test(txt))
	{
	i_nowiki++;
	txt = txt.replace(r_nowiki, a_nowiki[i_nowiki-1]);
	}

	//Возвращаем обратно HTML-теги ("<" и ">")
	i=0;
	r=/\x01([0-9]*)\x02/;
	while (r.test(txt))
	{
	i++;
	txt = txt.replace(r, a[i-1]);
	}

	//Возвращаем обратно текст между [[ и ]]
	i_links=0;
	r_links=/\x15([0-9]*)\x16/;
	while (r_links.test(txt))
	{
	i_links++;
	txt = txt.replace(r_links, a_links[i_links-1]);
	}

	//Возвращаем обратно текст в кавычках после знака "="
	i_equal=0;
	r_equal=/\x11([0-9]*)\x14/;
	while (r_equal.test(txt))
	{
	i_equal++;
	txt = txt.replace(r_equal, a_equal[i_equal-1]);
	}
}

// END код от [[:ru:MediaWiki:Summary]]


function zamena_5ko() {
	//Исключаем из обработки всё ("<" и ">") &#x463;&#1586; bgmaps и др.
	var r=/(?:(\b([0-1]?[0-9]|2[0-4])\.(?:00|30)\b)|(?:\<nowiki\>.+?\<\/nowiki\>)|(\<math\>.+?\<\/math\>)|(&#x?[0-9a-f]+;)|(<([^>]*)>)|(=\s?'.*?')|(=\s?".*?")|(\[\[[^\[\]]+\]\])|((bgmaps|sat)=.*$)|(\[[a-z]+:\/\/[^\]]+\])|\b[a-z0-9\._-]+@[a-z0-9\.-]+)/gmi;
	// Руснаците са хитри, ама ние сме по-хитри:
	var a_petko=txt.match(r);
	txt = txt.replace(r, "\x03\x04\x05");

	r=/\d+,\d+,\d[\d,]*/g;
	var a_zlatko = txt.match(r); var i=0;
	while (r.test(txt)) { txt = txt.replace(r, a_zlatko[i++].replace(/,/g, '')); }

	// Разделяне:
	r=/([=-]?[^,\.\w][1-9]\d*)(\d{3}\b)/gm;
	while(1)
	{
		var old = txt;
		txt=txt.replace(r, "$1 $2");
		if(old == txt) break;
	}

	// Разделител на хилядите:
	r=/(\d) (\d\d\d(?:\D|$))/gm;
	while(1)
	{
		var old = txt;
		txt=txt.replace(r, "$1&nbsp;$2");
		if(old == txt) break;
	}

	// Десетична точка:
	r=/(\d)\.(\d+(?:[-\D\n\r]|$))/gm;
	txt=txt.replace(r, "$1,$2");

	// Край.
	// Ако е четирицифрено, се пише слято:
	r=/(\b\d)&nbsp;(\d\d\d(?:[^\d&]|$))/gm;
	txt=txt.replace(r, "$1$2");

	// Всичко обратно:
	i=0;
	r=/\x03\x04\x05/;
	while (r.test(txt))
	{
		txt = txt.replace(r, a_petko[i++]);
	}
}


/* * * * * * * * * *   Mwbot stuff   * * * * * * * * * */

/**
 * Extends the functionality of an inputbox in a div.mwbot element.
 * Appends { { MAINPAGE/SUBPAGE } } to MAINPAGE upon creation of MAINPAGE/SUBPAGE
 *
 * Uses the class Mwbot ([[Потребител:Borislav/mwbot.js]]).
 *
 * License: GNU GPL 2 or later / GNU FDL
 * Author: [[:bg:User:Borislav|Borislav Manolov]]
 */
importScript('Потребител:Borislav/mwbot.js');

var Memory = {
	memoryTtl: 1,
	allowedActions: ["transcludeSubpage"],
	delim1: "::",
	delim2: ";;",

	memorize: function(jsAction, jsArgs, mwPage, mwAction) {
		Cookie.create(
			Memory.getCookieName(mwPage, mwAction),
			jsAction + Memory.delim1 + jsArgs.join(Memory.delim2),
			Memory.memoryTtl);
	},

	executeCurrentAction: function() {
		var cookieName = Memory.getCookieName(wgPageName, wgAction);
		var rawData = Cookie.read(cookieName);
		if (rawData) {
			Cookie.erase(cookieName);
			var p = rawData.split(Memory.delim1);
			if ( inArray(p[0], Memory.allowedActions) ) {
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
		mainpage = wgPageName;
	}
	form.title.value = "";
	jQuery(form).submit(function() {
		if ( $.trim(this.title.value) == "" ) {
			alert( gLang.msg("ta-emptyfield") );
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
	var bot = new Mwbot();
	bot.edit(mainpage, function(bot) {
		var fullpage = mainpage + "/" + subpage;
		bot.append_page_content("\n{"+"{" + fullpage + "}}");
		bot.set_edit_summary( gLang.msg("ta-summary", fullpage) );

		// put a summary notice on a possible base page
		var slashPos = mainpage.indexOf("/");
		if ( false && slashPos != -1 /*&& document.getElementById("bot-editbase")*/ ) {
			var basepage = mainpage.substr(0, slashPos);
			var bot2 = new Mwbot();
			bot2.edit(basepage, function(bot) {
				var s = "<!"+"-- dummy edit (\\d+) -->";
				var m = new RegExp(s).exec(bot.page_content);
				if ( m ) {
					bot.replace_page_content(m[0],
						s.replace("(\\d+)", parseInt(m[1]) + 1) );
				} else {
					bot.append_page_content("\n" + s.replace("(\\d+)", 1));
				}
				bot.set_edit_summary( gLang.msg("ta-bpsummary", fullpage) );
			});
		}
	});
}

mw.hook('wikipage.content').add(function() {
	attachMemorizers();
	$(".done-by-script").hide();
	$(".showme").show();
	Memory.executeCurrentAction();
});

/* * * * * * * * * *   Title fix  * * * * * * * * */
/*
  Taken from [[en:MediaWiki:Common.js]]
*/

/** "Technical restrictions" title fix *****************************************
 *
 *  Description: For pages that have something like Template:Wrongtitle, replace
 *               the title, but only if it is cut-and-pasteable as a valid
 *               wikilink. For instance, "NZR WB class" can be changed to
 *               "NZR W<sup>B</sup> class", but [[C#]] is not an equivalent wikilink,
 *               so [[C Sharp]] doesn't have its main title changed.
 *
 *               The function looks for a banner like this:
 *               <div id="RealTitleBanner"> ... <span id="RealTitle">title</span> ... </div>
 *               An element with id=DisableRealTitle disables the function.
 *  Maintainers: Remember_the_dot
 */

if (wgIsArticle) //prevents the "Editing " prefix from disappearing during preview
{
    mw.hook('wikipage.content').add(function()
    {
        var realTitle = document.getElementById("RealTitle")

        if (realTitle)
        {
            //normalizes a title or a namespace name (but not both)
            //trims leading and trailing underscores and converts (possibly multiple) spaces and underscores to single underscores
            function normalizeTitle(title)
            {
                return title.replace(/^_+/, "").replace(/_+$/, "").replace(/[\s_]+/g, "_")
            }

            if (realTitle.textContent) //everyone but IE
            {
                var realTitleText = realTitle.textContent
            }
            else //IE
            {
                var realTitleText = realTitle.innerText
            }

            var normalizedRealTitle
            var normalizedPageTitle
            var indexOfColon = realTitleText.indexOf(":")
            var normalizedNamespaceName = normalizeTitle(realTitleText.substring(0, indexOfColon)).toLowerCase()

            //make namespace prefix lowercase and uppercase the first letter of the title
            if (indexOfColon == -1 || wgCanonicalNamespace.toLowerCase() != normalizedNamespaceName) //no namespace prefix - either no colon or a nonsensical namespace prefix (for example, "Foo" in "Foo: The Story of My Life")
            {
                normalizedRealTitle = normalizeTitle(realTitleText)
                normalizedRealTitle = normalizedRealTitle.charAt(0).toUpperCase() + normalizedRealTitle.substring(1)
                normalizedPageTitle = wgPageName.charAt(0).toUpperCase() + wgPageName.substring(1)
            }
            else //using a namespace prefix
            {
                var normalizedRealPageTitle = normalizeTitle(realTitleText.substring(indexOfColon + 1))

                normalizedRealTitle = normalizedNamespaceName
                if (normalizedNamespaceName != "") //namespace 0 is a special case where the leading colon should never be shown
                {
                    normalizedRealTitle += ":"
                }
                normalizedRealTitle += normalizedRealPageTitle.charAt(0).toUpperCase() + normalizedRealPageTitle.substring(1)
                normalizedPageTitle = wgPageName.substring(0, wgPageName.indexOf(":") + 1).toLowerCase() + wgPageName.substring(wgPageName.indexOf(":") + 1)
            }

            if (normalizedRealTitle == normalizedPageTitle) //normalized titles match, so we can do full replacement
            {
                var h1 = document.getElementsByTagName("h1")[0]

                //remove all child nodes, including text
                while (h1.firstChild)
                {
                    h1.removeChild(h1.firstChild)
                }

                //populate with nodes of real title
                while (realTitle.firstChild) //the children are moved to a new parent element
                {
                    h1.appendChild(realTitle.firstChild)
                }

                //delete the real title banner since the problem is solved
                var realTitleBanner = document.getElementById("RealTitleBanner")
                realTitleBanner.parentNode.removeChild(realTitleBanner)
            }

            //no matter what, correct the page title
            document.title = realTitleText + " - Wikipedia, the free encyclopedia"
        }
    })
}

// Verwendung von OpenStreetMap in Wikipedia.
// (c) 2008 by Magnus Manske
// Released under GPL
//mediawiki.util is used by openStreetMapToggle
mw.loader.using( [ 'mediawiki.util' ], function() { $( function() {
  var c = $( '#coordinates' );
  if ( !c.length ) {
   return;
  }

  var a = c.find( 'a' );
  var geohack = false;
  for (var i = 0; i < a.length; i++) {
    var h = a[i].href;
    if (!h.match(/geohack/)) continue;
    if (h.match(/skyhack/)) continue;
    if (h.match(/_globe:/)) continue; // no OSM for moon, mars, etc
    geohack = true;
    break;
  }
  if ( !geohack ) {
   return;
  }

  var separator = $( document.createElement( 'span' ) );
  separator.text( ' | ' );
  separator.attr( 'class', 'noprint coordinates-separator' );
  c.append( separator );
  var img = $( document.createElement( 'img' ) );
  img.attr( {
   'src': '//upload.wikimedia.org/wikipedia/commons/thumb/c/c9/OpenStreetMapLogo.png/17px-OpenStreetMapLogo.png',
   'width': '17px',
   'height': '17px'
  } );
  var a = $( document.createElement( 'a' ) );
  a.attr( {
   'href': '#',
   'title': 'Показване на координатите на карта от OpenStreetMap',
   'class': 'noprint osm-icon-coordinates'
  } );
  a.click( openStreetMapToggle );
  a.append( img );
  c.append( a );
})});
// The function to toggle
function openStreetMapToggle() {
  var c = $( '#coordinates' );
  if ( !c.length) {
   return;
  }
  var cs = $( '#contentSub' );
  var osm = $( '#openstreetmap' );

  if ( cs.length && osm.length ) {
   if ( osm.css( 'display' ) === 'none' ) {
    osm.css( 'display', 'block' );
   } else {
    osm.css( 'display', 'none' );
   }
   return false;
  }

  var found_link = false;
  var a = c.find( 'a' );
  var h;
  for (var i = 0; i < a.length; i++) {
   h = a[i].href;
   if (!h.match(/geohack/)) continue;
   found_link = true;
   break;
  }
  if ( !found_link ) {
   return; // No geohack link found
  }

  h = h.split('params=')[1];

  var url = '//toolserver.org/~kolossos/openlayers/kml-on-ol.php?lang=bg&uselang='
          + mw.util.rawurlencode( mw.config.get( 'wgUserLanguage' ) )
          + '&params=' + h
          + '&title=' + mw.util.wikiUrlencode( mw.config.get( 'wgTitle' ) );

  var iframe = $( document.createElement( 'iframe' ) );
  iframe.attr( 'id', 'openstreetmap' );
  iframe.css({
   'width': '100%',
   'height': '350px',
   'clear': 'both'
  });
  iframe.attr( 'src', url );
  cs.append( iframe );
  return false;
}

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
if (wgPageName == 'Начална_страница' || wgPageName == 'Беседа:Начална_страница') {
    $(function () {
        var nstab = document.getElementById('ca-nstab-main');
        if (nstab && wgUserLanguage=='bg') {
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

if ($.inArray(mw.config.get('wgAction'), ["view", "purge", "submit"]) !== -1) {
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
 * Проверка дали даден елемент има даден клас
 *
 * @deprecated:  Използвайте $(element).hasClass() вместо това.
 */
mw.log.deprecate( window, 'hasClass', function ( element, className ) {
    return $( element ).hasClass( className );
}, 'Използвайте jQuery.hasClass() вместо това' );

/**
 * Междууики връзки към избрани статии ****************************************
 *
 * Описание: Указва междуезиковите препратки към избраните статии на други езици
 *              чрез звездичка вместо точка пред тях.
 * Поддържа се от: [[:en:User:R. Koot]]
 */
function LinkFA() {
    if ( document.getElementById( 'p-lang' ) ) {
        var InterwikiLinks = document.getElementById( 'p-lang' ).getElementsByTagName( 'li' );

        for ( var i = 0; i < InterwikiLinks.length; i++ ) {
            if ( document.getElementById( InterwikiLinks[i].className + '-fa' ) ) {
                InterwikiLinks[i].className += ' FA';
                InterwikiLinks[i].title = 'Тази статия на друг език е избрана';
            } else if ( document.getElementById( InterwikiLinks[i].className + '-ga' ) ) {
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