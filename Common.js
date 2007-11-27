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

 /** "Technical restrictions" title fix *****************************************
  *
  *  Description:
  *  Maintainers: [[:en:User:Interiot]], [[:en:User:Mets501]]
  */

 // For pages that have something like Template:Lowercase, replace the title, but only if it is cut-and-pasteable as a valid wikilink.
 //	(for instance [[iPod]]'s title is updated.  <nowiki>But [[C#]] is not an equivalent wikilink, so [[C Sharp]] doesn't have its main title changed)</nowiki>
 //
 // The function looks for a banner like this: <nowiki>
 // <div id="RealTitleBanner">    <!-- div that gets hidden -->
 //   <span id="RealTitle">title</span>
 // </div>
 // </nowiki>An element with id=DisableRealTitle disables the function.
 var disableRealTitle = 0;		// users can disable this by making this true from their monobook.js
 if (wgIsArticle) {			// don't display the RealTitle when editing, since it is apparently inconsistent (doesn't show when editing sections, doesn't show when not previewing)
     addOnloadHook(function() {
 	try {
 		var realTitleBanner = document.getElementById("RealTitleBanner");
 		if (realTitleBanner && !document.getElementById("DisableRealTitle") && !disableRealTitle) {
 			var realTitle = document.getElementById("RealTitle");
 			if (realTitle) {
 				var realTitleHTML = realTitle.innerHTML;
 				realTitleText = pickUpText(realTitle);

 				var isPasteable = 0;
 				//var containsHTML = /</.test(realTitleHTML);	// contains ANY HTML
 				var containsTooMuchHTML = /</.test( realTitleHTML.replace(/<\/?(sub|sup|small|big)>/gi, "") ); // contains HTML that will be ignored when cut-n-pasted as a wikilink
 				// calculate whether the title is pasteable
 				var verifyTitle = realTitleText.replace(/^ +/, "");		// trim left spaces
 				verifyTitle = verifyTitle.charAt(0).toUpperCase() + verifyTitle.substring(1, verifyTitle.length);	// uppercase first character

 				// if the namespace prefix is there, remove it on our verification copy.  If it isn't there, add it to the original realValue copy.
 				if (wgNamespaceNumber != 0) {
 					if (wgCanonicalNamespace == verifyTitle.substr(0, wgCanonicalNamespace.length).replace(/ /g, "_") && verifyTitle.charAt(wgCanonicalNamespace.length) == ":") {
 						verifyTitle = verifyTitle.substr(wgCanonicalNamespace.length + 1);
 					} else {
 						realTitleText = wgCanonicalNamespace.replace(/_/g, " ") + ":" + realTitleText;
 						realTitleHTML = wgCanonicalNamespace.replace(/_/g, " ") + ":" + realTitleHTML;
 					}
 				}

 				// verify whether wgTitle matches
 				verifyTitle = verifyTitle.replace(/^ +/, "").replace(/ +$/, "");		// trim left and right spaces
 				verifyTitle = verifyTitle.replace(/_/g, " ");		// underscores to spaces
 				verifyTitle = verifyTitle.charAt(0).toUpperCase() + verifyTitle.substring(1, verifyTitle.length);	// uppercase first character
 				isPasteable = (verifyTitle == wgTitle);

 				var h1 = document.getElementsByTagName("h1")[0];
 				if (h1 && isPasteable) {
 					h1.innerHTML = containsTooMuchHTML ? realTitleText : realTitleHTML;
 					if (!containsTooMuchHTML)
 						realTitleBanner.style.display = "none";
 				}
 				document.title = realTitleText + " - Wikipedia, the free encyclopedia";
 			}
 		}
 	} catch (e) {
 		/* Something went wrong. */
 	}
     });
 }


 // similar to innerHTML, but only returns the text portions of the insides, excludes HTML
 function pickUpText(aParentElement) {
   var str = "";

   function pickUpTextInternal(aElement) {
     var child = aElement.firstChild;
     while (child) {
       if (child.nodeType == 1)		// ELEMENT_NODE
         pickUpTextInternal(child);
       else if (child.nodeType == 3)	// TEXT_NODE
         str += child.nodeValue;

       child = child.nextSibling;
     }
   }

   pickUpTextInternal(aParentElement);

   return str;
 }


/** Import module *************************************************************
 *
 *  Description: Includes a raw wiki page as javascript or CSS,
 *               used for including user made modules.
 *  Maintainers: [[:en:User:AzaToth]]
 */
var importedScripts = {}; // object keeping track of included scripts, so a script ain't included twice
function importScript( page ) {
	if( importedScripts[page] ) {
		return;
	}
	importedScripts[page] = true;
	var url = wgScriptPath
		+ '/index.php?title='
		+ encodeURIComponent( page.replace( / /g, '_' ) )
		+ '&action=raw&ctype=text/javascript';
	var scriptElem = document.createElement( 'script' );
	scriptElem.setAttribute( 'src' , url );
	scriptElem.setAttribute( 'type' , 'text/javascript' );
	document.getElementsByTagName( 'head' )[0].appendChild( scriptElem );
}

function importStylesheet( page ) {
	var sheet = '@import "'
		+ wgScriptPath
		+ '/index.php?title='
		+ encodeURIComponent( page.replace( / /g, '_' ) )
		+ '&action=raw&ctype=text/css";';
	var styleElem = document.createElement( 'style' );
	styleElem.setAttribute( 'type' , 'text/css' );
	styleElem.appendChild( document.createTextNode( sheet ) );
	document.getElementsByTagName( 'head' )[0].appendChild( styleElem );
}


 /** MediaWiki media player *******************************************************
   *
   *  Description: A Java player for in-browser playback of media files.
   *  Created by: [[:en:User:Gmaxwell]]
   */

 document.write('<script type="text/javascript" src="'
             + 'http://en.wikipedia.org/w/index.php?title=Mediawiki:Wikimediaplayer.js'
             + '&action=raw&ctype=text/javascript&dontcountme=s"></script>');

 /* Déplacement des [modifier]
  * Correction des titres qui s'affichent mal en raison de limitations dues à MediaWiki.
  * Copyright 2006, Marc Mongenet. Licence GPL et GFDL.
  * The function looks for <span class="editsection">, and move them
  * at the end of their parent and display them inline in small font.
  * var oldEditsectionLinks=true disables the function.
  */

 function setModifySectionStyle() {
   try {
     if (!(typeof oldEditsectionLinks == 'undefined' || oldEditsectionLinks == false)) return;
     var spans = document.getElementsByTagName("span");
     for (var s = 0; s < spans.length; ++s) {
       var span = spans[s];
       if (span.className == "editsection") {
         span.style.fontSize = "small";
         span.style.variant = "small-caps";
         span.style.fontStyle = "italic";
         span.style.fontFamily = "Serif";
         span.style.cssFloat = span.style.styleFloat = "none";
         span.parentNode.appendChild(document.createTextNode(" "));
         span.parentNode.appendChild(span);
       }
     }
   } catch (e) { /* something went wrong */ }
 }

 addOnloadHook(setModifySectionStyle);


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


/* * * * * * * * * *   Edit tools functions   * * * * * * * * * */

/* * *   Virtual keyboard characters   * * */

// името на елемента за допълнителните знаци
var charsElemId = "extraChars";
var existChars = false; // дали знаците са добавени вече
// генерира и добавя допълнителните знаци в елемента $charsElemId  */
function addChars() {
	// ако знаците вече са добавени, се връщаме
	if ( existChars ) { return; }
	var chars = [
	['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О',
	'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ь', 'Ю', 'Я'],
	['а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о',
	'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ь', 'ю', 'я'],
	['Ы', 'ы', 'Э', 'э'],
	['°', '№', '½', '¼', '¾', 'ѣ', 'ѫ', 'ѭ', 'ѧ', 'ѩ',
	'Ї', 'Ҁ', 'Ѹ', 'Ѡ', 'Ѻ', 'Ъ', 'І', 'Ҍ', 'Ѩ', 'Ѭ', 'Ѯ', 'Ѵ', 'Ѥ', 'Ѿ'],
	['*', '~', '|', '[',  ']'],
	['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ',
	'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'ς', 'τ',
	'υ', 'φ', 'χ', 'ψ', 'ω', 'Γ', 'Δ', 'Θ', 'Λ', 'Ξ',
	'Π', 'Σ', 'Φ', 'Ψ', 'Ω'],
	['∫', '∑', '∏', '√', '−', '±', '∞', '≈', '~', '∝', '≡',
	'≠', '≤', '≥', '×', '·', '÷', '∂', '′', '″', '∇', '∮', '⊥',
	'‰', '∴', 'ℵ', 'ℋ', '℧', '^', '¹', '²', '³',
	'∈', '∉', '∩', '∪', '⊂', '⊃', '⊆', '⊇',
	'∧', '∨', 'ø', '¬', '∃', '∀', '⇒', '⇐',
	'⇓', '⇑', '⇔', '→', '←', '↓', '↑', '↔',  '⇄', '⇆', '⇋', '⇌',
	'ℕ', 'ℤ', 'ℚ', 'ℝ', 'ℂ', '∅', '⋮', '⋯'],
	['™', '©', '®', '¢', '€', '¥', '£', '¤', '¿', '¡',
	'«', '»', '§', '¶', '†', '‡', '•', '♀', '♂', '…', '¨'],
	['Á', 'á', 'É', 'é', 'Í', 'í',
	'Ó', 'ó', 'Ú', 'ú', 'À', 'à', 'È', 'è', 'Ì', 'ì',
	'Ò', 'ò', 'Ù', 'ù', 'Â', 'â', 'Ê', 'ê', 'Î', 'î',
	'Ô', 'ô', 'Û', 'û', 'Ä', 'ä', 'Ë', 'ë', 'Ï', 'ï'],
	['Ö', 'ö', 'Ü', 'ü', 'ß', 'Ã', 'ã', 'Ñ', 'ñ', 'Õ',
	'õ', 'Ç', 'ç', 'Ģ', 'ģ', 'Ķ', 'ķ', 'Ļ', 'ļ', 'Ņ',
	'ņ', 'Ŗ', 'ŗ', 'Ş', 'ş', 'Ţ', 'ţ', 'Ć', 'ć', 'Ĺ',
	'ĺ', 'Ń', 'ń', 'Ŕ', 'ŕ', 'Ś', 'ś', 'Ý', 'ý', 'Ź'],
	['ź', 'Đ', 'đ', 'Ů', 'ů', 'Č', 'č', 'Ď', 'ď', 'Ľ',
	'ľ', 'Ň', 'ň', 'Ř', 'ř', 'Š', 'š', 'Ť', 'ť', 'Ž',
	'ž', 'Ǎ', 'ǎ', 'Ě', 'ě', 'Ǐ', 'ǐ', 'Ǒ', 'ǒ', 'Ǔ',
	'ǔ', 'Ā', 'ā', 'Ē', 'ē', 'Ī', 'ī', 'Ō', 'ō', 'Ū'],
	['ū', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'Ĉ', 'ĉ', 'Ĝ', 'ĝ', 'Ĥ',
	'ĥ', 'Ĵ', 'ĵ', 'Ŝ', 'ŝ', 'Ŵ', 'ŵ', 'Ŷ', 'ŷ', 'Ă',
	'ă', 'Ğ', 'ğ', 'Ŭ', 'ŭ', 'Ċ', 'ċ', 'Ė', 'ė', 'Ġ',
	'ġ', 'İ', 'ı', 'Ż', 'ż', 'Ą', 'ą', 'Ę', 'ę', 'Į'],
	['į', 'Ų', 'ų', 'Ł', 'ł', 'Ő', 'ő', 'Ű', 'ű', 'Ŀ',
	'ŀ', 'Ħ', 'ħ', 'Ð', 'ð', 'Þ', 'þ', 'Œ', 'œ', 'Æ',
	'æ', 'Ø', 'ø', 'Å', 'å']
	];
	var cont = '';
	var len = chars.length;
	for (var i in chars) {
		for (var j in chars[i]) {
			cont += "<a href=\"javascript:insertTags('"+chars[i][j]+"', '', '')\" "+
			'title="Вмъкване на знака „'+chars[i][j]+'“">'+chars[i][j]+'</a> ';
		}
		if (i != len-1) { cont += '· '; }
	}
	document.getElementById(charsElemId).innerHTML = cont;
	existChars = true;
}

/* * *   Extra buttons for text insertion   * * */

// от тези данни ще се генерират допълнителни бутони с insertTags()
var customInsButtons = [
	// ТЕКСТ_ОТЛЯВО  ТЕКСТ_ОТДЯСНО  ТЕКСТ_ПО_СРЕДАТА  ЗАГЛАВИЕ  ПОКАЗАН_ТЕКСТ
	["#виж ["+"[", "]]", "Страница", "+команда за пренасочване", "вж"],
	["<code>", "</code>", "моля, въведете програмен код", "Текст с фиксирана ширина на буквите — обикновено код", "<tt>код</tt>"],
	["<sub>", "</sub>", "моля, въведете индекс", "+долен индекс", "a<sub>x</sub>"],
	["<sup>", "</sup>", "моля, въведете степен", "+горен индекс", "a<sup>x</sup>"],
	["&nbsp;", "", "", "+несекаем интервал", "nbsp"],
	["„", "“", "текст в кавички", "+български кавички", "„“"],
	["<del>", "</del>", "зачертан текст", "Отбелязване на текст като изтрит", "<del>del</del>"],
	["{"+"{", "}}", "", "+скоби за шаблон", "{{}}"],
	["|", "", "", "+отвесна черта — |", "&nbsp;|&nbsp;"],
	["—", "", "", "+дълга чертица — mdash", "—"],
	["–", "", "", "+средна чертица — ndash", "&nbsp;–&nbsp;"],
	["", "&#768;", "", "+ударение за гласна буква (маркирайте една буква)", "удар."],
	["<"+"!-- ", " -->", "моля, въведете коментар", "+коментар", "&lt;!--"],
	["{"+"{ЗАМЕСТ:-)}}", "", "", "+шаблон „Усмивка“", ":-)"],
	["{"+"{ЗАМЕСТ:D}}", "", "", "+шаблон „Ухилено човече“", ":-D"],
	["[[en:", "]]", "en", "+английско междуики", "en:"],
	["dot.png", "", "", "+dot.png — прозрачен пиксел", "dot"],
	["{"+"{Уики ен|", "}}", "", "Добавяне на източник", "Изт."],
	["<ref>", "</ref>", "", "Бележка под линия", "ref"]
];

/* * *   Extra buttons for miscelaneous functions   * * */

// данни за още бутони с код по желание
var customMiscButtons = [
	// КОД_ЗА_ИЗПЪЛНЕНИЕ	ЗАГЛАВИЕ	ПОКАЗАН_ТЕКСТ
	// уикификатора
	["obrabotka(false)", "Преобразуване на някои знаци", "#"],
	["obrabotka(true)", "Преобразуване на числа към БДС", "$"],
	// допълнителните знаци
	["addChars(); toggleElemDisplay('"+charsElemId+"');",
		"Възможност за вмъкване на още знаци", "Още..."]
];

/* * *   Drop down menus for template insertion   * * */

/* по идея на [[:he:MediaWiki:Summary|еврейската Уикипедия]] */
var tpl = {
// "<TEMPLATE-ID>" : ["<LEFT>", "<CONTENT>", "<RIGHT>", "<SHOWN TEXT>"],
"title2" : ["\n== ", "", " ==\n", "==  =="],
"title3" : ["\n=== ", "", " ===\n", "===  ==="],
"bio-info" : ["{"+"{Биография инфо\n| име = ", "", "\n| портрет = dot.png \n| описание = \n| наставка = \n| роден-дата = [[]] [[]] \n| роден-място = [[]], [[]] \n| починал-дата = [[]] [[]] \n| починал-място = [[]], [[]]\n}}\n", "Биография инфо"],
"table" : ["\n{|\n|\n|-\n|\n|}", "", "", "Таблица"],
"gallery" : ["<center><gallery caption=\"", "", "\">\n Image: | \n Image: | \n Image: | \n Image: | \n</gallery></center>", "Галерия"],
"references" : ["\n== Източници ==\n<references />\n", "", "", "Източници"],
"see-also" : ["\n== Вижте също ==\n* ["+"[", "", "]]\n", "Вижте също"],
"ext-links" : ["\n== Външни препратки ==\n* [", "", "]\n", "Външни препратки"],
"sortcat": ["{"+"{сорткат|", "", "}}", "Сортиране по ключ"], 
"cat" : ["["+"[Категория:", "", "]]", "Категория"],
"stub" : ["{"+"{мъниче", "", "}}", "Мъниче"]
};

var tpl1 = {
	// "SHOWN TEXT" : "PAGE NAME",
	"Тематичен шаблон..." : "-",
	"Книга инфо" : "Шаблон:Меню1/Книга инфо",
	"Писател" : "Шаблон:Меню1/Писател",
	"Музикален албум" : "Шаблон:Меню1/Музикален албум",
	"Музикална група" : "Шаблон:Меню1/Музикална група",
	"Филм" : "Шаблон:Меню1/Филм",
	"Актьор" : "Шаблон:Меню1/Актьор",
	"Футболен отбор" : "Шаблон:Меню1/Футболен отбор",
	"Футболист" : "Шаблон:Меню1/Футболист",
	"Селище в България" : "Шаблон:Меню1/Селище в България",
	"Таксокутия" : "Шаблон:Меню1/Таксокутия",
};

var tpl2 = {
	"Работен шаблон..." : "-",
	"Шаблони за статии" : {
		"Авторски права" : "Шаблон:Меню2/Авторски права",
		"Бързо изтриване" : "Шаблон:Меню2/Бързо изтриване",
		"Изтриване" : "Шаблон:Меню2/Изтриване",
		"Източник?" : "Шаблон:Меню2/Източник",
		"Обработка" : "Шаблон:Меню2/Обработка",
		"Пояснение" : "Шаблон:Меню2/Пояснение",
		"Към пояснение" : "Шаблон:Меню2/Към пояснение",
		"Редактирам" : "Шаблон:Меню2/",
		"Сливане" : "Шаблон:Меню2/Сливане",
		"Сюжет" : "Шаблон:Меню2/Сюжет",
		"Цитат" : "Шаблон:Меню2/Цитат",
		"Commons" : "Шаблон:Меню2/Commons",
		"Commonscat" : "Шаблон:Меню2/Commonscat",
		"IMDB Name" : "Шаблон:Меню2/IMDB Name",
		"IMDB Title" : "Шаблон:Меню2/IMDB Title",
	},
	"Потребителски шаблони" : {
		"Вавилон" : "Шаблон:Меню2/Вавилон",
        },
	"Шаблони за беседи" : {
		"Добре дошли" : "Шаблон:Меню2/Добре дошли",
		"Неподписано" : "Шаблон:Меню2/Неподписано",
        },
	"Шаблони за картинки" : {
		"Без лиценз" : "Шаблон:Меню2/Без лиценз",
        },
	"Шаблони за категории" : {
		"Категория" : "Шаблон:Меню2/Категория",
		"Категория инфо" : "Шаблон:Меню2/Категория инфо",
        },
};

var baseTplVarName = "tpl";

// добавя нови бутони и други играчки
function setupCustomEditTools() {
	var toolbar = document.getElementById("toolbar");
	// ако няма съществуващи бутони, няма да добавяме и тези
	if ( !toolbar ) { return; }
	toolbar.className += " buttonlinks";
	var tools = document.createElement("div");
	tools.id = "custombuttons";
	for (var i in customInsButtons) {
		var el = customInsButtons[i];
		var title = el[3];
		if ( title.charAt(0) == "+" ) {
			title = "Вмъкване на " + title.substr(1);
		}
		addCustomButton(tools,
			{"href": "javascript:insertTags('"+el[0] +"','"+el[1]+"','"+ el[2]+"')",
			"title": title, "innerHTML": el[4]});
	}
	for (var i in customMiscButtons) {
		var el = customMiscButtons[i];
		addCustomButton(tools, {"href":"javascript:"+el[0], "title":el[1], "innerHTML":el[2]});
	}
	// падащите менюта
	toolbar.appendChild( makeTemplateSelectBox() );
	addDropDownMenus(toolbar);
	toolbar.appendChild(tools);
	// елемент за допълнителните знаци
	var chbox = document.createElement("div");
	chbox.id = charsElemId;
	chbox.style.display = "none";
	toolbar.appendChild(chbox);
}

// генерира падащото меню с шаблоните
function makeTemplateSelectBox() {
	var box = document.createElement("select");
	box.onchange = function() {
		if (this.value != "") {
			var el = tpl[this.value];
			insertTags(el[0], el[2], el[1]);
			this.selectedIndex=0;
		}
		return false;
	};
	box.appendChild( newOption("", "Елемент от статията...") );
	for (var i in tpl) { box.appendChild( newOption(i, tpl[i][3]) ); }
	return box;
}

function addCustomButton(box, item) {
	var b = document.createElement("a");
	for (var attr in item) { b[attr] = item[attr]; }
	box.appendChild(b);
	box.appendChild( document.createTextNode(" ") );
}

function addDropDownMenus(parent) {
	var tplVar = null;
	for ( var i = 1; tplVar = baseTplVarName + i,
			eval("var tpl = typeof("+ tplVar +") == 'object' ? "+ tplVar +" : null"),
			tpl != null; i++ ) {
		addDropDownMenu(parent, tpl);
	}
}

/** генерира падащо меню */
function addDropDownMenu(parent, content) {
	var box = document.createElement("select");
	box.title = "Оттук можете да вмъкнете празен шаблон";
	box.onchange = function() {
		if (this.value != "-") {
			loadPage(this.value);
			this.selectedIndex = 0;
		}
		return;
	};
	appendOptions(box, content);
	parent.appendChild(box);
}

function appendOptions(box, opts) {
	for (var i in opts) {
		if (opts[i] == "") {
			continue; // skip emtpy entries
		}
		var child = typeof(opts[i]) == "object"
			? newOptgroup(i, opts[i])
			: newOption(opts[i], i);
		box.appendChild(child);
	}
}

function newOptgroup(label, data) {
	var g = document.createElement("optgroup");
	g.label = label;
	for (var i in data) {
		g.appendChild( newOption(data[i], i) );
	}
	return g;
}

function newOption(val, text) {
	var o = document.createElement("option");
	o.value = val;
	o.appendChild( document.createTextNode(text) );
	return o;
}

/** скрива/показва елемент */
function toggleElemDisplay(elemId) {
	var elem = document.getElementById(elemId);
	elem.style.display = elem.style.display == 'none' ? '' : 'none';
}


/* * * * * * * * * *   Ajax functions   * * * * * * * * * */

var prevReq;
var pageUrl = wgScript + "?title=$1&action=raw&templates=expand";
var pageToFetch = "";

function loadPage(page) {
	prevReq = sajax_init_object();
	if( !prevReq ) return false;
	pageToFetch = page;
	var getUrl = pageUrl.replace(/\$1/, encodeURI(page));
	//alert("Страница: "+page+"\nАдрес: "+getUrl);
	showLoadIndicator();
	prevReq.onreadystatechange = insertIntoWikiText;
	prevReq.open("GET", getUrl, true);
	prevReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	prevReq.send(null);
	return true;
}

function insertIntoWikiText() {
	if( prevReq.readyState != 4 ) {
		return;
	}
	hideLoadIndicator();
	if ( prevReq.status != 200 ) {
		window.alert("Неуспешна връзка: " + prevReq.status +
			" “" + prevReq.statusText + "”\nСтраница: "+ pageToFetch);
		return;
	}
	// изтриване на текст, отбелязан за невмъкване + <pre> и <nowiki>
	var re = /<!--noinclude-->.*<!--\/noinclude-->|<\/?pre>|<\/?nowiki>/g;
	var content = prevReq.responseText.replace(re, "");
	insertTags(content, "", "");
}

var loadIndicator;
function showLoadIndicator() {
	if ( typeof(loadIndicator) != "undefined" ) {
		loadIndicator.style.display = "block";
		return;
	}
	var content = document.getElementById("content");
	if ( !content ) { // no "content" element
		return;
	}
	loadIndicator = document.createElement("div");
	loadIndicator.id = "loadIndicatorWrapper";
	var txt = document.createElement("div");
	txt.id = "loadIndicator";
	txt.appendChild( document.createTextNode("Шаблонът се зарежда…") );
	loadIndicator.appendChild(txt);
	content.appendChild(loadIndicator);
}

function hideLoadIndicator() {
	loadIndicator.style.display = "none";
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
	txt = txt.replace(/--/g, "—");

	// Спец-значки ©, ®, ™, § и €.
	txt = txt.replace(/(\((c|с)\)|\&copy;)/gi, "©");
	txt = txt.replace(/(\(r\)|\&reg;)/gi, "®");
	txt = txt.replace(/(\((tm|тм)\)|\&trade;)/gi, "™");
	txt = txt.replace(/(\(p\)|\&sect;)/gi, "\u00A7");
	txt = txt.replace (/\&euro;/gi, "€");

	// Вставляем пропущенные и убираем лишние пробелы
	txt=txt.replace(/и т\.д\./g, "и\u00A0т\.\u00A0д\.");
	txt=txt.replace(/и т\.п\./g, "и\u00A0т\.\u00A0п\.");
	txt=txt.replace(/н\.э\./g, "н\. э\.");
	txt=txt.replace(/т\.е\./g, "т\.\u00A0е\.");
	txt=txt.replace(/т\.к\./g, "т\.\u00A0к\.");
	txt=txt.replace(/([А-Я]\.)([А-Я]\.)([А-Я][а-я])/g, "$1 $2 $3");
	txt=txt.replace(/([А-Я]\.)([А-Я]\.)/g, "$1 $2");
	txt=txt.replace(/^([#\*])([\*#]*)([\[\"\(\„\w\dа-яё])/mg, "$1$2 $3");
	txt=txt.replace(/^(=+)([^\s^=])([^=]+)([^\s^=])(=+)/mg, "$1 $2$3$4 $5");
	txt=txt.replace(/([а-я])(\.)([А-ЯA-Z])/g, "$1$2 $3");
	txt = txt.replace(/([а-яa-z\)\»\“\"\]])(\s*)(\,)([а-яa-z\(\«\„\"\[])/g, "$1$3 $4");
	txt = txt.replace(/([а-яa-z\)\»\“\"\]])(\s)([\,\;])(\s)([а-яa-z\(\«\„\"\[])/g, "$1$3 $5");
	txt = txt.replace(/(\d)(\s)([%‰])/g, "$1$3");

	//Убираем двойные пробелы.
	txt = txt.substr (1, txt.length-1);
	txt=txt.replace(/^(?! )(.*?)( {2,})(\S)/mg, "$1 $3");
	txt=" "+txt;

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


/* * * * * * * * * *   Featured article marker   * * * * * * * * * */

// взета от [[:en:MediaWiki:Monobook.js]] и основно пренаписана
function LinkFA() {
	var langBody = document.getElementById("p-lang");
	if ( !langBody ) { return; }
	var langs = langBody.getElementsByTagName("li");
	for (var i=0; i < langs.length; i++) {
		var lang = langs[i];
		var code = lang.className.substr(10);
		if ( !document.getElementById(code) ) { continue; }
		lang.style.padding = "0 0 0 16px";
		lang.style.backgroundImage = "url('http://upload.wikimedia.org/wikipedia/en/6/60/LinkFA-star.png')";
		lang.style.backgroundRepeat = "no-repeat";
		lang.title = "Тази статия е избрана";
	}
}


// BEGIN Dynamic Navigation Bars (experimental)

var NavBarHide = "{{MediaWiki:hide}}";
var NavBarShow = "{{MediaWiki:show}}";
var displayStyles = new Object();
displayStyles[NavBarHide] = "block";
displayStyles[NavBarShow] = "none";

// set up max count of Navigation Bars on page,
// if there are more, all will be hidden
// 0 — all bars will be hidden
// 1 — on pages with more than 1 bar all bars will be hidden
var NavBarShowDefault = 1;


// shows and hides content and picture (if available) of navigation bars
// @param	indexNavBar	the index of navigation bar to be toggled
function toggleNavBar(indexNavBar)
{
	var NavToggle = document.getElementById("NavToggle" + indexNavBar);
	var NavFrame = document.getElementById("NavFrame" + indexNavBar);

	if (!NavFrame || !NavToggle) { return; }

	NavToggle.firstChild.data = NavToggle.firstChild.data == NavBarHide
		? NavBarShow : NavBarHide;
	var display = displayStyles[ NavToggle.firstChild.data ];
	for (var NavChild = NavFrame.firstChild;
			NavChild != null;
			NavChild = NavChild.nextSibling) {
		if (NavChild.nodeName == "#text") { continue; }
		if (NavChild.className == 'NavPic' || NavChild.className == 'NavContent') {
			NavChild.style.display = display;
		}
	}
}

// adds show/hide-button to navigation bars
function createNavBarToggleButton()
{
	var indexNavBar = 0;
	// iterate over all < div >-elements
	var divs = document.getElementsByTagName("div");
	for (var i=0; i < divs.length; i++) {
		var NavFrame = divs[i];
		if (NavFrame.className != "NavFrame") { continue; }
		// if found a navigation bar
		indexNavBar++;
		var NavToggle = document.createElement("a");
		NavToggle.className = 'NavToggle';
		NavToggle.setAttribute('id', 'NavToggle' + indexNavBar);
		NavToggle.setAttribute('href', 'javascript:toggleNavBar(' + indexNavBar + ');');

		var NavToggleText = document.createTextNode(NavBarHide);
		NavToggle.appendChild(NavToggleText);
		// Find the NavHead and attach the toggle link
		// (Must be this complicated because Moz's firstChild handling is borked)
		for (var j=0; j < NavFrame.childNodes.length; j++) {
			// text nodes (#text) don't have a className
			if (NavFrame.childNodes[j].nodeName == "#text" ||
					NavFrame.childNodes[j].className != "NavHead") {
				continue;
			}
			NavFrame.childNodes[j].appendChild(NavToggle);
		}
		NavFrame.setAttribute('id', 'NavFrame' + indexNavBar);
	}
	// if more Navigation Bars found than Default: hide all
	if (NavBarShowDefault < indexNavBar) {
		for (var i=1; i <= indexNavBar; i++) {
			toggleNavBar(i);
		}
	}

}

// END Dynamic Navigation Bars

hookEvent("load", setupCustomEditTools);
addOnloadHook(externMessage);
addOnloadHook(LinkFA);
addOnloadHook(createNavBarToggleButton);