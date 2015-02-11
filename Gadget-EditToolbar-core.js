/**
 * Core of the EditToolbar
 *
 * Some functions and arrays are still bound to window for backwards compatibility
 */

window.setCustomInsButton = function(code, left, middle, right, shownText, title) {
	customInsButtons[code] = [left, middle, right, shownText, title];
};

window.setCustomMiscButton = function(code, codeToRun, shownText, title) {
	customMiscButtons[code] = [codeToRun, shownText, title];
};

window.rmCustomInsButtons = function(rmButtons) {
	rmCustomButtons(customInsButtons, rmButtons);
};
window.rmCustomMiscButtons = function(rmButtons) {
	rmCustomButtons(customMiscButtons, rmButtons);
};
window.rmCustomButtons = function(allButtons, rmButtons) {
	for (var i = rmButtons.length - 1; i >= 0; i--) {
		delete( allButtons[ rmButtons[i] ] );
	}
};

/**
	insert an edit toolbar before the textarea.
	useful for testing user script pages while previewing
	use it with:
		putToolbar();
	put in your script page, e.g. User:Your_Name/monobook.js
*/
window.putToolbar = function(rightNow) {
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
};

mw.libs.EditToolbar = {};

/* * *   Extra buttons for text insertion   * * */

// от тези данни ще се генерират допълнителни бутони с insertTags()
window.customInsButtons = {
	// "CODE" : ["LEFT", "MIDDLE", "RIGHT", "SHOWN TEXT", "TITLE"],
	"b1" : ["#виж [[", "Страница", "]]", "вж", "+команда за пренасочване"],
	"b2" : ["<code>", "моля, въведете програмен код", "</code>", "<tt>код</tt>", "Текст в равноширок шрифт — обикновено код"],
	"b3" : ["<sub>", "моля, въведете индекс", "</sub>", "a<sub>x</sub>", "+долен индекс"],
	"b4" : ["<sup>", "моля, въведете степен", "</sup>", "a<sup>x</sup>", "+горен индекс"],
	"b5" : ["\u00a0", "", "", "nbsp", "+несекаем интервал"],
	"b6" : ["„", "текст в кавички", "“", "„“", "+български кавички"],
	"b7" : ["<del>", "зачертан текст", "</del>", "<del>del</del>", "Отбелязване на текст като изтрит"],
	"b8" : ["{{", "", "}}", "{{}}", "+скоби за шаблон"],
	"b9" : ["|", "", "", "&nbsp;|&nbsp;", "+отвесна черта — |"],
	"b10" : ["—", "", "", "—", "+дълга чертица — mdash"],
	"b11" : ["–", "", "", "&nbsp;–&nbsp;", "+средна чертица — ndash"],
	"b12" : ["", "", "&#768;", "удар.", "+ударение за гласна буква (маркирайте една буква)"],
	"b13" : ["<!-- ", "моля, въведете коментар", " -->", "&lt;!--", "+коментар"],
	"b14" : ["{"+"{ЗАМЕСТ:-)}}", "", "", ":-)", "+шаблон „Усмивка“"],
	"b19" : ["{{Br}}\n", "", "", "br", "+шаблон Br"],
	"b21" : ["<ref>", "", "</ref>", "&lt;ref&gt;", "+източник / бележка под линия"],
	"b21n" : ['<ref name="">', "", "</ref>", "&lt;ref name&gt;", "+многократна употреба на източник / бележка под линия"],
	"b22" : ["["+"[", "", "]]", "[[...]]", "+препратка без разделител"],
	"b23l" : ["["+"[", "", "|]]", "[[...&#124;]]", "+препратка с разделител (курсорът е отляво на разделителя)"],
	"b23r" : ["["+"[|", "", "]]", "[[&#124;...]]", "+препратка с разделител (курсорът е отдясно на разделителя)"],
	"b24" : ["["+"[:", "", "]]", "[[:...]]", "+текстова препратка"],
	"b25" : ["#", "", "", "...#...", "+диез"]
};

// cleanup by articles
if (mw.config.get('wgCanonicalNamespace') === '') {
	mw.loader.using("mediawiki.toolbar", function() {
		delete customInsButtons['b14'];
		delete customInsButtons['b15'];
		$('#mw-editbutton-signature').hide();
	});
}


mw.messages.set({
	"et-addchar": "Вмъкване на знака „$1“",
	"et-addpref": "Вмъкване на $1",
	"et-ddmenutitle": "Оттук можете да вмъкнете празен шаблон",
	"et-ajaxerror": "Шаблонът [[$1]] не можа да бъде зареден."
});


/* * *   Extra buttons for miscelaneous functions   * * */

// името на елемента за допълнителните знаци
var charsElemId = "extraChars";

// данни за още бутони с код по желание
window.customMiscButtons = {
	// "CODE" : ["CODE TO RUN", "SHOWN TEXT", "TITLE"],
	// уикификатора
	"#" : ["mw.libs.EditToolbar.obrabotka(false)", "#", "Преобразуване на някои знаци"],
	"$" : ["mw.libs.EditToolbar.obrabotka(true)", "$", "Преобразуване на числа към БДС"],
	// допълнителните знаци
	"ch" : ["mw.libs.EditToolbar.toggleChars()", "Още…", "Виртуална клавиатура"]
};

/* * *   Drop down menus for template insertion   * * */

/* по идея на [[:he:MediaWiki:Summary|еврейската Уикипедия]] */
window.tpl1 = {
	// "SHOWN TEXT" : "TEMPLATE CONTENT",
	"Елементи от статията…" : "-",
	"==  ==" : "\n== >>|<< ==\n",
	"===  ===" : "\n=== >>|<< ===\n",
	"Таблица" : "\n{| class=\"wikitable\"\n|+ >>|Заглавие на таблицата|<<\n! колона 1\n! колона 2\n! колона 3\n|-\n| ред 1, клетка 1\n| ред 1, клетка 2\n| ред 1, клетка 3\n|-\n| ред 2, клетка 1\n| ред 2, клетка 2\n| ред 2, клетка 3\n|}",
	"Галерия" : "<center><gallery caption=\">>|<<\">\n Image: | \n Image: | \n Image: | \n Image: | \n</gallery></center>",
	"Източници" : "\n== Източници ==\n<references />\n>>|<<",
	"Вижте също" : "\n== Вижте също ==\n* [[>>|<<]]\n",
	"Външни препратки" : "\n== Външни препратки ==\n* [>>|<<]\n",
	"Сортиране по ключ" : "{{СОРТКАТ:>>|<<}}",
	"Категория" : "[[Категория:>>|<<]]",
	"Мъниче" : "{{мъниче>>|<<}}",
	"Към пояснение" : "{{към пояснение|"+ mw.config.get('wgTitle') +"|>>|<<"+ mw.config.get('wgTitle') +" (пояснение)}}"
};

var atplb = "МедияУики:Common.js/Edit tools data/";
window.atpl1 = {
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

window.atpl2 = {
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

window.showMenus = true;
window.showButtons = true;

/** generate and add extra chars in the element $charsElemId  */
function addChars() {
	$chars = $('#'+charsElemId);
	if (!$chars.is(':empty')) {
		// if there are extra chars already, do nothing
		return $chars;
	}
	var cont = '';
	var len = chars.length;
	for (var i in chars) {
		for (var j in chars[i]) {
			cont += "<a href=\"javascript:mw.toolbar.insertTags('"+chars[i][j]+"', '', '')\" "+
			'title="' + mw.msg("et-addchar", chars[i][j]) +'">'+chars[i][j]+'</a> ';
		}
		if (i != len-1) {
			cont += '<br/>';
		}
	}
	return $chars.html(cont);
}

mw.libs.EditToolbar.toggleChars = function() {
	addChars().toggle();
};

/* * *   Extra buttons for text insertion   * * */

/** add some buttons and drop-down menus */
function setupCustomEditTools() {
	if ( !$("#editform").length ) {
		return;
	}

	mw.loader.load("mediawiki.toolbar");
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

$(function() {
	mw.loader.using("user", function(){
		setupCustomEditTools();
	});
});

function appendCustomButtons(parent) {
	var buts = $('<div>', { id: "custombuttons" });
	for (var i in customInsButtons) {
		var el = customInsButtons[i];
		var title = el[4];
		if ( title.charAt(0) == "+" ) {
			title = mw.msg("et-addpref", [title.substr(1)]);
		}
		appendCustomButton(buts, {
			href: "javascript:mw.toolbar.insertTags('"+el[0] +"','"+el[2]+"','"+ el[1]+"')",
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
	$('<div>', { id: charsElemId, style: 'display: none' }).appendTo(parent);
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
		title: mw.msg("et-ddmenutitle")
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

/* * * * * * * * * *   Ajax functions   * * * * * * * * * */

function loadPage(page) {
	showLoadIndicator();
	var pageUrl = mw.util.getUrl(page, { action: 'raw', templates: 'expand' });
	$.get(pageUrl)
	.done(insertIntoWikiText)
	.fail(function() {
		alert(mw.msg('et-ajaxerror', [page]));
	}).always(function() {
		hideLoadIndicator();
	});
}

function insertIntoWikiText(content) {
	// delete text marked for no inclusion + <pre> and <nowiki>
	var re = /<!--noinclude-->.*<!--\/noinclude-->|<\/?pre>|<\/?nowiki>/g;
	content = content.replace(re, "");
	// replace escaped tags
	var specials = ['pre', 'nowiki'];
	for (var i in specials) {
		re = new RegExp("\\[(\/?)"+ specials[i] +"\\]", "g");
		content = content.replace(re, "<$1"+ specials[i] +">");
	}

	// we can have >>|sample text|<< or >>|<< or just simple text
	var parts = null;
	var left, right, def = '';
	content = escapeNl(content);
	if ( ( parts = content.match(/(.*)>>\|(.*)\|<<(.*)/) ) ) {
		left = parts[1];
		def = parts[2];
		right = parts[3];
	} else { // no sample text: split at caret’s position
		parts = content.split('>>|<<');
		left = parts[0];
		delete(parts[0]);
		right = parts.join('');
	}
	mw.toolbar.insertTags(unescapeNl(left), unescapeNl(right), unescapeNl(def));
}

function escapeNl(s) {
	return s.replace(/\n/g, "\x01");
}
function unescapeNl(s) {
	return s.replace(/\x01/g, "\n");
}

var $loadIndicator;
function showLoadIndicator() {
	if (!$loadIndicator) {
		$loadIndicator = $('<div class="mw-ajax-loader"/>')
			.css({
				position: 'absolute',
				top: $('#wpTextbox1').offset().top + 10,
				left: '50%'
			})
			.hide()
			.appendTo('body');
	}
	$loadIndicator.fadeIn();
}
function hideLoadIndicator() {
	if ($loadIndicator) {
		$loadIndicator.hide();
	}
}


/* * * * * * * * * *   Wikificator functions   * * * * * * * * * */

var txt; // текста, който ще се обработва от Уикификатора

// BEGIN код от [[:ru:MediaWiki:Summary]], вижте [[:ru:Википедия:Викификатор]]
mw.libs.EditToolbar.obrabotka = function(bds) {
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