// <nowiki>
// Българска версия на правилата за скрипта Advisor.js
// Виж МедияУики:Gadget-Advisor-core.js за основния скрипт
// виж http://en.wikipedia.org/wiki/User:Cameltrader/Advisor.js/Description

var ct = ct || {};

ct.inBrackets = function (s, m, brackets) {
	var leftContext = s.substring(0, m.start);
	var rightContext = s.substring(m.end);

	var indexOfOpeningLeft = leftContext.lastIndexOf(brackets[0]);
	var indexOfClosingLeft = leftContext.lastIndexOf(brackets[1]);
	var indexOfOpeningRight = rightContext.indexOf(brackets[0]);
	var indexOfClosingRight = rightContext.indexOf(brackets[1]);

	return (indexOfOpeningLeft !== -1 && (indexOfClosingLeft === -1 || indexOfOpeningLeft > indexOfClosingLeft)) ||
		(indexOfClosingRight !== -1 && (indexOfOpeningRight === -1 || indexOfOpeningRight > indexOfClosingRight));
};

// originally from https://en.wikipedia.org/wiki/User:GregU/dashes.js
// checkPat1, checkPat2, checkTags, checkFileName default to true
ct.doNotFix = function (s, m, checkPat1, checkPat2, checkTags, checkFileName, checkWikiPreCode, checkQuotes, checkPat3) {
	var pos = m.start;
	var pat = /\[\[[^|\]]*$|\{\{[^|}]*$/;
	if (checkPat1 !== false && s.substring(pos - 260, pos + 1).search(pat) > -1)
		return true; // it's a link or template name, so don't change it

	var pat2 = /\{\{\s*(?:#[a-z]+:|друг[ои]\s+значени[ея]|основна|вижте\s+също|main|към|от\s+пренасочване|категория|anchor|cite|citation|цитат2?|долап|c?quote|is[sb]n|lang[i2]?|[es]fn|hrf|harv|пост\s+списък)(?:(?=([^{}]+))\1|\{(?:(?=([^{}]+))\2|\{(?:(?=([^{}]+))\3|\{(?:(?=([^{}]+))\4|\{(?:(?=([^{}]+))\5|\{(?:(?=([^{}]+))\6|\{(?=([^{}]*))\7\})*\})*\})*\})*\})*\})*$/i; // long and ugly regex because of limited JS regex engine
	if (checkPat2 !== false && s.slice(0, pos + 1).search(pat2) > -1)
		return true; // specific template/parser function (with up to six balanced curly brackets -- 3 levels of template/parser function nesting or 2 levels of parameter placeholder nesting)

	if (checkTags !== false) {
		var nextTagPos = s.slice(pos).search(/<\/?(?:chem|math|pre|code|tt|source|syntaxhighlight|timeline|graph|mapframe|maplink|poem|blockquote|q|i|ref)\b/i);
		if (nextTagPos > -1 && s.charAt(pos + nextTagPos + 1) === '/')
			return true; // skip math/chem equations, source code, timelines, graphs, maps, ref content, content in citation tags
	}

	if (checkFileName !== false && s.slice(pos).search(/^[^|{}[\]<>\n]*\.[a-z]{3,4}\s*(?:[|}\n]|\{\{!\})/i) > -1)
		return true; // it's a file name parameter

	if (checkWikiPreCode !== false && s.slice(0, pos + 1).search(/(?:^|\n) +.*$/) > -1)
		return true; // it's a text in wiki pre code (a line starting with a normal space)

	if (checkQuotes !== false) {
		var leftSlice = s.slice(0, pos + 1).replace(/'''(.+?)'''/g, '$1');
		var rightSlice = s.slice(pos + 1).replace(/'''(.+?)'''/g, '$1');
		if (leftSlice.match(/„(?:(?=([^„“”]+))\1|„[^„“”]*[“”])*$/) &&
			rightSlice.match(/^(?:(?=([^„“”]+))\1|„[^„“”]*[“”])*[“”]/) ||
			leftSlice.match(/“(?:(?=([^“”]+))\1|“[^“”]*”)*$/) &&
			rightSlice.match(/^(?:(?=([^“”]+))\1|“[^“”]*”)*”/) ||
			leftSlice.match(/«(?:(?=([^«»]+))\1|«[^«»]*»)*$/) &&
			rightSlice.match(/^(?:(?=([^«»]+))\1|«[^«»]*»)*»/) ||
			leftSlice.match(/"[^"]*$/) &&
			rightSlice.match(/^[^"]*"/) &&
			leftSlice.match(/"/g).length % 2 === 1 &&
			rightSlice.match(/"/g).length % 2 === 1 ||
			leftSlice.match(/''(?:(?!'').)*$/) &&
			rightSlice.match(/^.*?''/) &&
			leftSlice.match(/''/g).length % 2 === 1 &&
			rightSlice.match(/''/g).length % 2 === 1
		) return true; // it's a text in quotes or italicized text
	}
	
	var pat3 = /(?:[\[\s](?:ht|f)tps?:\/\/|\[\/\/)[^\[\]\s<>]+$|<[a-z]+\b[^>]*$|\{\|[^\n]*$|\n\|-[^\n]*$|\|[^|=]+=$/i;
	if (checkPat3 !== false && (s.slice(0, m.end).search(pat3) > -1 || s.slice(0, m.end).search(/[\n!]![^\n|!]*$|[\n|]\|[^\n|]*$/) > -1 && s.slice(m.end).search(/^[^\n|!]*\|(?!\|)/) > -1))
		return true; // it's an external link, html tag, wikitable tag/row/cell with attributes or parameter name
};

if (mw.config.get('wgUserLanguage') === 'bg') {
	ct.translation = {

'The page is too long. Parsing of the text is disabled\u00a0\u2014\u00a0Advisor.js will consume a lot of RAM and CPU resources while trying to parse the text, which can cause freezing of the page, the browser or even the CPU.':
	'Тази страница е прекалено дълга. Oбработката на текста е спряна\u00a0\u2014\u00a0Advisor.js ще изисква много RAM и процесорни ресурси, докато се опитва да анализира текста, което може да доведе до спиране на страницата, браузъра или дори процесора.',

'This page is rather long. Advisor.js may consume a lot of RAM and CPU resources while trying to parse the text. You could limit your edit to a single section, or ':
	'Тази страница е сравнително дълга. Advisor.js може да консумира много RAM и процесорни ресурси, докато се опитва да анализира текста. Можеш да ограничиш редакцията на един раздел или да ',

'Advisor.js is disabled on talk pages and pages in the namespace "Wikipedia:", because it might suggest changing other users\' comments. That would be something against talk page conventions. If you promise to be careful, you can ':
	'Advisor.js по подразбиране е спрян за беседите и страниците от именно пространство „Уикипедия“, защото има опасност да предложи промяна на чужди коментари. Това би било в противоречие с конвенциите за беседи. Ако обещаваш да си внимателен, можеш да ',

'scan the text anyway.':
	'провериш текста.',

'Ignore this warning.':
	'Игнорирай това предупреждение.',

'OK\u00a0\u2014\u00a0Advisor.js found no issues with the text.':
	'ОК\u00a0\u2013\u00a0Advisor.js не намира проблеми в текста.',

'1 suggestion: ':
	'1 предложение: ',

'$1 suggestions: ':
	'$1 предложения: ',

'fix':
	'поправи',

'Show All':
	'Покажи всички',

'formatting: $1 (using [[User:Cameltrader#Advisor.js|Advisor.js]])':
	'форматиране: $1 (ползвайки [[У:Съв|Advisor]])',

'Add to summary':
	'Добави към резюмето',

'Append the proposed summary to the input field below':
	'Добави предложеното резюме към полето отдолу',

'Error: If the proposed text is added to the summary, its length will exceed the $1-character maximum by $2 characters.':
	'Ако предложеният текст бъде добавен към резюмето, дължината му ще прехвърли ограничението от $1 символа с $2.',

'':''
	};
}

ct.rules = ct.rules || [];
// == Rules ==
// The "rules" that produce suggestions is where
// most of the load resides. Each rule is a javascript function that accepts a
// string as a parameter (the wikitext of the page being edited) and returns an
// array of "suggestion" objects. A suggestion object must have the following
// properties:
// * start -- the 0-based inclusive index of the first character to be replaced
// * end -- analogous to start, but exclusive
// * replacement -- the proposed wikitext
// * name -- this is what appears at the top of the page
// * description -- used as a tooltip for the name of the suggestion
// The set of rules to apply depends on the content language. Different
// languages have different formatting conventions, therefore this is not
// a matter of internationalisation like the UI core, but of unrelated
// implementations.

ct.rules.push(function (s) {
	var re = ct.fixRegExp(/\[\[([{letter}]?)([^\|\[\]]+)\|(['„\(]*)([{letter}]?)\2([{letter}]*)(['“\).:,;]*)\]\]/g);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (m[1].toLowerCase() !== m[4].toLowerCase()) continue;
		var ext1 = m[3] ? '..' : '';
		var	ext2 = m[5] ? 'Б' : '';
		var	ext3 = m[6] ? '..' : '';
		b.push({
			start: m.start,
			end: m.end,
			replacement: m[3] + '[[' + m[4] + m[2] + ']]' + m[5] + m[6],
			name: 'А|' + ext1 + 'А' + ext2 + ext3,
			description: m[0] + ' може да се опрости до ' + m[3] + '[[' + m[4] + m[2] + ']]' + m[5] + m[6],
			help: 'Синтаксисът на МедияУики позволява препратки от вида <kbd>'
				+ '[[А|' + ext1 + 'А' + ext2 + ext3 + ']]</kbd> да се пишат '
				+ 'като <kbd>' + ext1 + '[[А]]' + ext2 + ext3 + '</kbd>.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	function doNotFixSpaces(str, index) {
		var nextTagPos = str.slice(index).search(/<\/?(?:source|syntaxhighlight|pre)\b/i);
		var wikiPre = str.slice(0, index + 1).search(/(?:^|\n) +.*$/);
		return nextTagPos > -1 && str.charAt(index + nextTagPos + 1) === '/' || wikiPre > -1;
	}

	var start = -1;
	var end = 0;
	var spacesRemoved = [0, 0, 0];
	var replacement = s.replace(/[^\S\r\n]+$/gm, function (m, index, str) {
		// Премахване на интервали преди началото на нов ред
		var prev2chars = str.slice(index - 2, index);
		// не премахва последния интервал в празни таблични клетки или при празни параметри в шаблони
		// работи при интервали след заглавия
		if (prev2chars[1] === '=' && prev2chars !== '==' || prev2chars[1] === '|') return m;
		if (start === -1) start = index;
		end = index + m.length;
		spacesRemoved[0] += m.length;
		return '';
	});
	end -= spacesRemoved[0];

	replacement = replacement.replace(/[^\s][^\S\r\n]{2,}(?=[^\s=]|==)/g, function (m, index, str) {
		// Премахване на двойни интервали
		if (doNotFixSpaces(str, index)) return m;
		if (start === -1 || start > index + 1) start = index + 1;
		if (end < index + m.length) end = index + m.length;
		spacesRemoved[1] += m.length - 2;
		return m[0] + ' ';
	});
	end -= spacesRemoved[1];
	
	replacement = replacement.replace(/\[\[[^\S\r\n]*(?![Cc]ategory:|[Кк]атегория:)(?:[^\[\]]|\[(?:[^\[\]]|\[[^\[\]]+\])+\])+\]\]/g, function (m, index) {
		// Премахване на ненужни интервали в препратки (включително и за файлове; изключение за категории)
		return m.replace(/[^\S\r\n]+/g, function (m2, index2, str) {
			var prevChar = str[index2 - 1];
			var nextChar = str[index2 + m2.length];
			if (prevChar !== '[' && nextChar !== ']' &&
				prevChar !== '|' && nextChar !== '|' ||
				(prevChar === '|' || nextChar === '|') &&
				ct.inBrackets(str, { 'start': index2, 'end': index2 + m2.length }, ['{', '}'])
			) return m2;
			index2 += index;
			if (start === -1 || start > index2) start = index2;
			if (end < index2 + m2.length) end = index2 + m2.length;
			spacesRemoved[2] += m2.length;
			return '';
		});
	});
	end -= spacesRemoved[2];

	var totalRemoved = spacesRemoved[0] + spacesRemoved[1] + spacesRemoved[2];
	if (totalRemoved === 0) return [];
	
	return [{
		start: start,
		end: end + totalRemoved,
		replacement: replacement.slice(start, end),
		name: totalRemoved === 1 ? 'интервал' : totalRemoved + ' интервала',
		description: 'Изтрий двойните интервали, интервалите в края на '
			+ 'редовете и интервалите в началото/края вътре в препратките',
		help: 'Двойните интервали, интервалите в края на редовете, както и '
			+ 'интервалите в началото/края вътре в препратките са ненужни.'
	}];
});

ct.rules.push(function (s) {
	var re = ct.fixRegExp(/([{letter}\d]+[^{letter}\d\s]*)(?:[^\S\r\n]|&nbsp;)+[\u2014-][^\S\r\n]+(?=([^{letter}\d\s]*[{letter}\d]+|\n))/g);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (!m[1].match(/[а-ъьюяѝ\d]/i) && !m[2].match(/[а-ъьюяѝ\d]/i) || // думите и от двете страни не съдържат кирилка буква или цифра
			m[1].match(ct.fixRegExp(/^(?:[Пп]о|[Нн]ай)[^{letter}\d]*$/)) || // пропусни случаите с "по- и "най-"
			ct.doNotFix(s, m)
		) continue;
		b.push({
			start: m.start + m[1].length,
			end: m.end,
			replacement: '\u00a0\u2013 ', // U+2013 is an ndash
			name: 'тире',
			description: 'Смени със средно тире',
			help: 'В изречение, късо или дълго тире, оградено с интервали, '
				+ 'почти сигурно трябва да е средно тире.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	// не работи при липса на интервал преди цифра, защото може да е негативно число
	// също не работи преди " и" или " или"; за случаи като "антропо- и зооморфна пластика"
	var re = /((?:^|\s)(?:[Пп]о|[Нн]ай)|[А-ЪЮЯа-ъьюя]|\d(?![^\S\r\n]*-[^\S\r\n]*[\n\)]))(?:[^\S\r\n]+-(?!\d)|-(?:[^\S\r\n]+(?!и(?:ли)?[^\S\r\n])|\s*\n))(?=[А-ЪЮЯа-ъьюя\d\)])/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (m[1].length > 1 || ct.doNotFix(s, m)) continue; // пропусни случаите с "по- и "най-"
		b.push({
			start: m.start + 1,
			end: m.end,
			name: 'дефис',
			description: 'Късо тире (дефис) с интервал от едната страна',
			help: 'Късо тире (дефис) с интервал от едната страна вероятно '
				+ 'трябва да стане средно тире с интервали и от двете '
				+ 'страни или дефис без интервал (полуслято изписване).'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	// сравнителни частици, изписани с интервали между дефиса или с тирета, различни от дефис
	var re = /((?:^|\s)(?:[Пп]о|[Нн]ай))(?:-[^\S\r\n]+|[^\S\r\n]+-[^\S\r\n]*|[^\S\r\n]*[\u2014\u2013][^\S\r\n]*)([а-я]+)/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m)) continue;
		if (m[2] === 'и' || m[2] === 'или') {
			if (s[m.start + m[1].length + 1] === '-') continue;
			m[2] = ' ' + m[2];
		}
		b.push({
			start: m.start + m[1].length - m[1].trim().length,
			end: m.end,
			name: m[1].trim().toLowerCase() + '-',
			replacement: m[1].trim() + '-' + m[2],
			description: 'Поправи сравнителната частица, така че да е '
				+ 'изписана с дефис и без интервал преди дефиса',
			help: 'Сравнителната частица се изписва с дефис, без интервали '
				+ 'преди и/или след дефиса.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	// U+2014 е дълго тире (em dash), U+2013 е средно тире (en dash)
	var re = ct.fixRegExp(/([^{letter}\d](?:IS[SB]N|код)(?:[^{letter}\d]*[\dx])+)|[^{letter}\d\u2014\u2013-](\d+(?:\]\])?|\?|\.{3}|…)(?:[\u2014\u2013-]|--|[^\S\r\n]+(?:[\u2014-](?=[\r\n\)])|--(?=[^\S\r\n]*[\r\n\)])))((?:(?:\[\[)?\d+|\?|\.{3}|…)(?![{letter}\d\u2014\u2013-])|(?=[^\S\r\n]*[\r\n\)]))/gi);
	var a = ct.getAllMatches(re, s);
	var i, m, b = [];
	for (i = 0; i < a.length; i++) {
		m = a[i];
		if (m[1] || ct.doNotFix(s, m)) continue; // m[1]: ISBN, ISSN, телефонен, пощенски код -- мачва го и го пропуска
		b.push({
			start: m.start + 1,
			end: m.end,
			replacement: m[2] + ('\u00a0\u2013 ' + m[3]).trimEnd(),
			name: 'тире-числа',
			description: 'Смени късото или дългото тире със средно тире '
				+ 'и добави интервали от двете му страни',
			help: 'За числовите интервали се използва средно тире, '
				+ 'оградено с интервали.'
		});
	}

	// Също и за римски числа с тире помежду
	re = ct.fixRegExp(/[^{letter}\d\u2014\u2013-]([IVXLCD]+(?:\]\])?)(?:[\u2014\u2013-]|--|[^\S\r\n]+(?:[\u2014-](?=[\r\n\)])|--(?=[^\S\r\n]*[\r\n\)])))((?:\[\[)?[IVXLCD]+(?![{letter}\d\u2014\u2013-])|(?=[^\S\r\n]*[\r\n\)]))/g);
	a = ct.getAllMatches(re, s);
	for (i = 0; i < a.length; i++) {
		m = a[i];
		if (ct.doNotFix(s, m)) continue;
		b.push({
			start: m.start + 1,
			end: m.end,
			replacement: m[1] + ('\u00a0\u2013 ' + m[2]).trimEnd(),
			name: 'тире-числа',
			description: 'Смени късото или дългото тире със средно тире '
				+ 'и добави интервали от двете му страни',
			help: 'За числовите интервали се използва средно тире, '
				+ 'оградено с интервали.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /^(={2,})([^=\n]*(?:=[^=\n]+)*)(={2,})$/gm;
	var a = ct.getAllMatches(re, s);
	var b = [];
	var level = 0; // == Level 1 ==, === Level 2 ===, ==== Level 3 ====, etc.
	var editform = document.getElementById('editform');
	// If we are editing a section, we have to be tolerant to the first heading's level
	var isSection = editform && editform.wpSection !== null && editform.wpSection.value !== '';
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (!m[2] || m[2].trim() === '') {
			b.push({
				start: m.start,
				end: m.end,
				replacement: '',
				name: 'заглавие-празно',
				description: 'Премахни празно заглавие',
				help: 'Празните заглавия са ненужни.'
			});
		} else {
			if (!m[2].startsWith(' ') || !m[2].endsWith(' ')) {
				b.push({
					start: m.start,
					end: m.end,
					replacement: m[1] + ' ' + m[2].trim() + ' ' + m[3],
					name: 'заглавие-стил',
					description: 'Поправи интервалите',
					help: 'Стилът на заглавието трябва да е <kbd>==&nbsp;С интервали&nbsp;==</kbd>.'
				});
			}
			var oldLevel = level;
			level = m[1].length - 1;
			if (level - oldLevel > 1 && (!isSection || oldLevel > 0) ||
				m[1].length > 6 ||
				m[3].length > 6 ||
				m[1].length !== m[3].length
			) {
				b.push({
					start: m.start,
					end: m.end,
					name: 'заглавие-вложеност',
					description: 'Поправи ръчно неправилната вложеност, провери ръчно и следващите подзаглавия',
					help: 'Всяко заглавие трябва да е вложено точно едно ниво под по-общото заглавие.'
				});
			}
			/*
			var frequentMistakes = [
				{ code: 'външни вр.', wrong: /^[Вв]ъншни *[Вв]ръзки$/i, correct: 'Външни препратки' },
				{ code: 'see-also', wrong: /^see *al+so$/i, correct: 'See also' },
				{ code: 'ext-links', wrong: /^external links?$/i, correct: 'External links' },
				{ code: 'refs', wrong: /^ref+e?r+en(c|s)es?$/i, correct: 'References' }
			];
			for (var j = 0; j < frequentMistakes.length; j++) {
				var fm = frequentMistakes[j];
				if (fm.wrong.test(m[3]) && m[3] != fm.correct) {
					var r = m[1] + m[2] + fm.correct + m[2] + m[1];
					if (r != m[0]) {
						b.push({
							start: m.start,
							end: m.end,
							replacement: r,
							name: fm.code,
							description: 'Поправи на „' + fm.correct + "“.",
							help: 'Правилното изписване е „<kbd>' + fm.correct + "</kbd>“."
						});
					}
				}
			}
			*/
		}
	}
	return b;
});

ct.rules.push(function (s) {
	// ISBN: ten or thirteen digits, each digit optionally followed by a hyphen, the last digit can be 'X' or 'x'
	var a = ct.getAllMatches(/ISBN(?:\s*=?|(?:\]\])?:?)?\s*(\d[\d-]+[\dX])/gi, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var str = m[1].replace(/[^\dX]+/gi, '').toUpperCase(); // remove all non-digits
		if (str.length !== 10 && str.length !== 13) {
			b.push({
				start: m.start,
				end: m.end,
				name: 'ISBN',
				description: 'Трябва да е дълъг 10 или 13 цифри',
				help: 'ISBN номерата трябва да са дълги 10 или 13 цифри. '
					+ 'Този се състои от ' + str.length + ' цифри:<br><kbd>' + m[1] + '</kbd>'
			});
			continue;
		}
		var isNew = str.length === 13; // old (10 digits) or new (13 digits)
		var xIndex = str.indexOf('X');
		if (xIndex !== -1 && (xIndex !== 9 || isNew)) {
			b.push({
				start: m.start,
				end: m.end,
				name: 'ISBN',
				description: 'Неправилна употреба на X като цифра',
				help: '<kbd>X</kbd> може да се ползва само като последна цифра в в 10-цифрен ISBN номер '
					+ '<br><kbd>' + m[1] + '</kbd>'
			});
			continue;
		}
		var computedChecksum = 0;
		var modulus = isNew ? 10 : 11;
		for (var j = str.length - 2; j >= 0; j--) {
			var digit = str.charCodeAt(j) - 48; // 48 is the ASCII code of '0'
			var quotient = isNew
				? ((j & 1) ? 3 : 1) // the new way: 1 for even, 3 for odd
				: 10 - j; // the old way: 10, 9, 8, etc
			computedChecksum = (computedChecksum + (quotient * digit)) % modulus;
		}
		computedChecksum = (modulus - computedChecksum) % modulus;
		var c = str.charCodeAt(str.length - 1) - 48;
		var actualChecksum = (c < 0 || 9 < c) ? 10 : c;
		if (computedChecksum === actualChecksum) continue;
		b.push({
			start: m.start,
			end: m.end,
			name: 'ISBN',
			description: 'Неправилна контролна сума',
			help: 'Неправилна контролна сума на ISBN номер:<br/><kbd>' + m[1] + '</kbd>'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = ct.fixRegExp(/((?!Й)[{letter}\d][^{letter}\d\s]*[^\S\r\n]+)й(?![{letter}\d])/g);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m)) continue;
		b.push({
			start: m.start + m[1].length,
			end: m.end,
			replacement: 'ѝ',
			name: 'й→ѝ',
			description: 'Промени „й“ на „ѝ“',
			help: 'Когато се ползва като местоимение, „й“ трябва да се изписва '
				+ 'като „ѝ“ с ударение.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	// год., предшествано от цифри, евентуално в препратка
	var re = /(\d+(?:\]\])?)(?:[^\S\r\n]|&nbsp;)*год\./g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m)) continue;
		b.push({
			start: m.start,
			end: m.end,
			replacement: m[1] + '\u00a0г.',
			name: 'год.→г.',
			description: 'Поправи съкращението „год.“ на „г.“',
			help: 'Приетото съкращение за година е „г.“, а не „год.“'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	// единица, предшествана от цифри, евентуално в препратка
	var re = ct.fixRegExp(/[^{letter}\d](\d+(?:\]\])?)(г\.|лв\.|щ\.д\.|°[CF]|(?:[мк]?г|[мск]?м|[mk]?g|[mck]?m)(?![{letter}\d]))/g);
	var a = ct.getAllMatches(re, s);
	var autofix = ['г.', 'лв.', 'щ.д.', '°C', '°F'];
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m)) continue;
		b.push({
			start: m.start + 1,
			end: m.end,
			replacement: autofix.indexOf(m[2]) > -1 ? m[1] + '\u00a0' + m[2] : null,
			name: 'число+' + m[2],
			description: 'Добави интервал между числото и единицата ' + m[2],
			help: 'Между числото и единицата <i>' + m[2] + '</i> трябва да се оставя един интервал, '
				+ 'за предпочитане непренасящият се <kbd>&amp;nbsp;</kbd> '
				+ '(non-breaking space, <kbd>U+00A0</kbd>).'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = ct.fixRegExp(/(([{letter}\d])[\]\)“']*)([^\S\r\n]+[,;][^\S\r\n]*|[,;])(?=[\[\(„']*([{letter}\d]))/g);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		m.start += m[1].length;
		if (ct.doNotFix(s, m) || m[3] === ',' && !isNaN(m[2]) && !isNaN(m[4])) continue; // m[2] и m[4] са цифри; вероятност за десетично число
		b.push({
			start: m.start,
			end: m.end,
			replacement: m[3].trim() + ' ',
			name: m[3].trim() === ',' ? 'запетая' : 'точка+запетая',
			description: 'Премахни интервала преди пунктуационния знак и/или добави такъв след него',
			help: 'Интервал се поставя след пунктуационния знак и не преди него.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = ct.fixRegExp(/(([{letter}\d]+)[\]\)“']*)(?:[^\S\r\n]+\.[^\S\r\n]*|\.)(?=[\[\(„']*([{letter}\d]+))/g);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		m.start += m[1].length;
		var skip = m[3][0] !== m[3][0].toUpperCase();
		for (var j = 1; !skip && j < m[3].length; j++) { skip = m[3][j] !== m[3][j].toLowerCase(); }
		if (ct.doNotFix(s, m)
			|| skip // следващата дума не започва с главна буква или съдържа повече от една главна буква
			|| !isNaN(m[2].replace(/[IVXLCD]/g, '')) && !isNaN(m[3].replace(/[IVXLCD]/g, '')) // m[2] и m[3] са цифри (също римски); вероятност за десетично число след копиране или формат дата (римски числа)
		) continue;
		b.push({
			start: m.start,
			end: m.end,
			replacement: '. ',
			name: 'точка',
			description: 'Премахни интервала преди пунктуационния знак и/или добави такъв след него',
			help: 'Интервал се поставя след пунктуационния знак и не преди него.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = ct.fixRegExp(/[^\S\r\n]+[.,:;](?=[^\S\r\n]*$)/gm);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m)) continue;
		m[0] = m[0].trim();
		b.push({
			start: m.start,
			end: m.end,
			replacement: m[0],
			name: m[0] === '.' ? 'точка' :
				m[0] === ',' ? 'запетая' :
				m[0] === ':' ? 'двоеточие' : 'точка+запетая',
			description: 'Премахни интервала преди пунктуационния знак',
			help: 'Преди пунктуационния знак не се оставя интервал.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /((=\n{2,}.)|[^=\n]\n=|.\n{3,}.|\.\n[А-ЪЮЯ])|^\n+/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var nextTagPos = s.slice(m.start).search(/<\/?(?:gallery|poem)\b/i);
		if (nextTagPos > -1 && s.charAt(m.start + nextTagPos + 1) === '/') continue; // пропусни галериите и поетичните текстове
		var lines = m[2] ? '\n' : '\n\n';
		b.push({
			start: m.start,
			end: m.end,
			replacement: m[1] ? m[1][0] + lines + m[1][m.end - m.start - 1] : '',
			name: 'нов ред',
			description: 'Премахни излишните празни редове или добави нов ред между отделните абзаци',
			help: 'Между отделните абзаци трябва да има един празен ред. Повече от един празен ред е излишен.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var replacement = {
		'A': 'А', 'a': 'а',
		'B': 'В',
		'E': 'Е', 'e': 'е',
		'H': 'Н',
		'i': 'і',
		'J': 'Ј', 'j': 'ј',
		'K': 'К',
		'M': 'М',
		'O': 'О', 'o': 'о',
		'P': 'Р', 'p': 'р',
		'C': 'С', 'c': 'с',
		'T': 'Т',
		'X': 'Х', 'x': 'х',
		'y': 'у'
	}; // key: value => latin: cyrillic
	
	var re = /(?:[А-ЪЮЯа-ъьюяѝ]['"“\]]*[^\S\r\n]+[ec]|[А-ЪЮЯа-ъьюяѝ]['"“\]]*\.\s+[ABCE])[^\S\r\n]+['"„\[]*[А-ЪЮЯа-ъьюяѝ]|[a-zA-Z][\u0400-\u04ff]|[\u0400-\u04ff][a-zA-Z]/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m, false, false, false, true, true, true, true)) continue; // Изкл.: checkPat1, checkPat2, checkTagName; Вкл.: checkFileName, checkWikiPre, checkQuotes, checkPat3
		b.push({
			start: m.start,
			end: m.end,
			name: 'шльокавица',
			description: 'Неизвестна замяна. ' + (m[0].length !== 2
				? 'Проверете текста'
				: m[0][0].match(/[\u0400-\u04ff]/)
				? "Кирилско '" + m[0][0] + "', следвано от латинско '" + m[0][1] + "'"
				: "Латинско '" + m[0][0] + "', следвано от кирилско '" + m[0][1] + "'"),
			help: 'Една дума трябва да бъде написана или само на кирилица, или само на латиница.'
		});
		var word = s.substring(m.start - 49, m.start).match(/[\u0400-\u04ffa-zA-Z]*$/)[0] + m[0] + s.substring(m.end, m.end + 49).match(/^[\u0400-\u04ffa-zA-Z]*/)[0];
		var subtract = word.match(/[\u0400-\u04ff]/g).length - word.match(/[a-zA-Z]/g).length;
		for (var key in replacement) {
			if (subtract >= 0 && m[0].indexOf(key) > -1) {
				// по-голям брой кирилски букви или броят на кирилските и латинските букви е равен;
				// замени с кирилски еквивалент
				b[b.length - 1].replacement = m[0].replace(key, replacement[key]);
				b[b.length - 1].description = "Замени латинско '" + key + "' с кирилско.";
				break;
			} else if (subtract < 0 && m[0].indexOf(replacement[key]) > -1) {
				// по-голям брой латински букви; замени с латински еквивалент
				b[b.length - 1].replacement = m[0].replace(replacement[key], key);
				b[b.length - 1].description = "Замени кирилско '" + replacement[key] + "' с латинско.";
				break;
			}
		}
	}
	return b;
});

ct.rules.push(function (s) {
	// отварящи кавички ако са в нач. на реда или след списъчен елемент, интервал, '', >, }, |, = или (
	var re = /((?:^|\n)[*#:;]*|[^\S\r\n]|''|[>}|=\(])(?:"(?![\s,;:]|\.(?!\.))((?:[^"\[\]\s]|\s(?!")|\[\[[^\[\]]+\]\]|\[[^\[\]]+\])+)"|[„“](?![\s,;:]|\.(?!\.))((?:[^„“”\[\]\s]|\s(?![“”])|\[\[[^\[\]]+\]\]|\[[^\[\]]+\])+)”|«(?![\s,;:]|\.(?!\.))((?:[^«»\[\]\s]|\s(?!»)|\[\[[^\[\]]+\]\]|\[[^\[\]]+\])+)»)/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var str = m[2] || m[3] || m[4];
		if (ct.doNotFix(s, m, true, true, true, true, true, false, true) || // Изкл.: checkQuotes
			str.match(/ь(?!о)/) || !str.match(/[А-ЪЮЯа-ъьюяѝ]/) // не съдържа нито една кирилска буква, ползвана в българския
		) continue;
		b.push({
			start: m.start + m[1].length,
			end: m.end,
			replacement: '„' + str + '“',
			name: 'кавички',
			description: 'Заместване на "прави", “други горни”, „смесени” или «френски» с „български“ кавички.',
			help: 'В българския език и в Уикипедия на български се използват тези кавички: „ и “.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /[^\S\r\n](?:'{2,})?["„“”«»][.,;:]?(?:'{2,})?[.,;:]?[^\S\r\n]/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m, true, true, true, true, true, false, true)) continue; // Изкл.: checkQuotes
		b.push({
			start: m.start,
			end: m.end,
			name: 'кавичка-интервали',
			description: 'Кавичка, оградена с интервали от двете страни',
			help: 'След отварящата кавичка не трябва да има интрвал, '
				+ 'преди затварящата също.'
		});
	}
	return b;
});

/*
Премахването на празни параметри от шаблоните като практика не се ползва с
консенсусна подкрепа сред редакторите, затова на този етап е изключено.
ct.rules.push(function (s) {
	var re = /(^|[^\n ] *)(\| *[\wА-я-]+ *= *(?=[\|\}]))+/g;
	var a = ct.getAllMatches(re, s);
	if (a.length === 0) return [];
	var n = a.length;
	var start = a[0].start + a[0][1].length;
	var end = a[n - 1].end + 1;
	var replacement = s.slice(start, end).replace(re, '$1');
	var b = [{
		start: start,
		end: end - 1,
		replacement: replacement.slice(0, -1),
		name: (n == 1 ? 'параметър' : n + '+ параметъра'),
		description: 'Премахва неизползваните параметри от шаблоните',
		help: 'Неизползваните параметри са излишни.'
	}];
	return b;
});
*/

ct.rules.push(function (s) {
	var skipNext;

	function decoder (match, charCode, index, s) {
		if (skipNext > 0) {
			skipNext--;
			return '';
		}
		var decimal = parseInt(charCode, 16);
		if (decimal < 128) return match; // ASCII, не декодирай
		var bin = Number(decimal).toString(2);
		var nOfBytes = bin.match(/^1+/)[0].length;
		skipNext = nOfBytes - 1;
		var urlEncoded = match + s.slice(index + 3, index + 3 * nOfBytes);
		var str = decodeURI(urlEncoded);
		return (str.length === 1 ? str : urlEncoded);
	}

	var re = /((?:https?:|ftps?:|\[)\/\/[^\/\s]+\/)([^\s|}<>\]%]*%[^\s|}<>\]]*)|(\[\[)([^\[\]|%]*%[^\[\]|]*)/gi;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		try {
			skipNext = 0; // зануляване за всяко следващо съвпадение (m = a[i])
			var decoded = m[1] ? m[2].replace(/%([a-f\d]{2})/gi, decoder).replace(/\s/g, function (match) {
				return encodeURI(match); // рекодиране на интервали, които не попадат в ASCII
			}) : decodeURIComponent(m[4]);
			if (m[2] === decoded || m[4] === decoded) continue;
			b.push({
				start: m.start,
				end: m.end,
				replacement: (m[1] || m[3]) + decoded,
				name: m[1] ? 'URL' : 'линк-адрес',
				description: 'Декодира кодирани ' + (m[1] ? 'URL' : 'линкови') + ' адреси',
				help: (m[1] ? 'URL адресите' : 'Линковите адреси') + ' се четат по-лесно, когато са декодирани.'
			});
		} catch (e) {
			// не е кодиран Unicode текст
		}
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /\([^\S\r\n]+|[^\S\r\n]+\)/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		m[0] = m[0].trim();
		if (ct.doNotFix(s, m) || m[0] === ')' && s[m.start - 1].match(/[\u2013\u2014-]/)) continue;
		b.push({
			start: m.start,
			end: m.end,
			replacement: m[0],
			name: 'скоба',
			description: 'Премахни интервала след отварящата и/или преди затварящата скоба',
			help: 'Интервалите са ненужни след отваряща и преди затваряща скоба.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /((?:(?:^|\s)(?:[Оо]т|[Дд]о|[Пп]ре(?:з|ди)|[Сс]лед|[Мм]е(?:жду|сец)|[Ии](?:ли)?|[Вв])|[\d,])[^\S\r\n]+)(Януари|Февруари|Март|Април|Май|Юни|Юли|Август|Септември|Октомври|Ноември|Декември)(?![А-яA-z\d])/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m)) continue;
		b.push({
			start: m.start + m[1].length,
			end: m.end,
			replacement: m[2].toLowerCase(),
			name: 'месец',
			description: m[2] + '→' + m[2].toLowerCase(),
			help: 'В българския език имената на месеците се пишат с малка буква.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /№(\d+)/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m)) continue;
		b.push({
			start: m.start,
			end: m.end,
			replacement: '№\u00a0' + m[1],
			name: '№+число',
			description: 'Добави несекаем интервал между № и последващите числа',
			help: 'Между символа за номер и последващите числа трябва да има несекаем интервал.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	function skipReferenceTags(str, index) {
		var nextTagPos = str.slice(index).search(/<\/?references\b/i);
		var tempPos = str.slice(0, index).search(/\{\{\s*[Rr]eflist\b(?:(?=([^{}]+))\1|\{(?:(?=([^{}]+))\2|\{(?:(?=([^{}]+))\3|\{(?:(?=([^{}]+))\4|\{(?:(?=([^{}]+))\5|\{(?:(?=([^{}]+))\6|\{(?=([^{}]*))\7\})*\})*\})*\})*\})*\})*$/);
		return nextTagPos > -1 && str.charAt(index + nextTagPos + 1) === '/' || tempPos > -1;
	}

	var start = -1;
	var end = 0;
	var charsRemoved = [0, 0, 0];
	var charsAdded = 0;
	var replacement = s.replace(/(<\/[Rr][Ee][Ff]\s*>|<[Rr][Ee][Ff]\b[^>]*\/>|\{\{\s*(?:[SsEe]fn|[Hh]rf|[Rr]p)\b[^{}]*\}\})[\s.:,;]+(?=<[Rr][Ee][Ff]\b|\{\{\s*(?:[SsEe]fn|[Hh]rf|[Rr]p)\b)/g, function (m, g1, index, str) {
		// Премахване на интервали и пунтуационни знаци между ref-овете
		if (skipReferenceTags(str, index)) return m;
		if (start === -1) start = index;
		end = index + m.length;
		charsRemoved[0] += m.length - g1.length;
		return g1;
	});
	end -= charsRemoved[0];

	replacement = replacement.replace(/([^\s.:,;=|]\s+|\s*[.,]\s+|[^\S\r\n]*[:;][^\S\r\n]+)(?:<[Rr][Ee][Ff]\b|\{\{\s*(?:[SsEe]fn|[Hh]rf|[Rr]p)\b)|(?:<\/[Rr][Ee][Ff]\s*>|<[Rr][Ee][Ff]\b[^>]*\/>|\{\{\s*(?:[SsEe]fn|[Hh]rf|[Rr]p)\b[^{}]*\}\})(?:\s+(?=[.,])|[^\S\r\n]+(?=[:;]))/g, function (m, g1, index, str) {
		// Премахване на интервали след пунтуационен знак и преди отварящ ref или след затварящ ref и преди пунктуационен знак
		if (skipReferenceTags(str, index)) return m;
		var r = (g1 ? g1.trim() + m.slice(g1.length) : m).trim();
		if (start === -1 || start > index) start = index;
		if (end < index + m.length) end = index + m.length;
		charsRemoved[1] += m.length - r.length;
		return r;
	});
	end -= charsRemoved[1];

	replacement = replacement.replace(/([.:,;])((?:<[Rr][Ee][Ff]\b(?:(?=([^>/]+))\3|\/(?!>))*(?:\/|>(?:(?=([^<]+))\4|<(?!\/?[Rr][Ee][Ff]\b))*<\/[Rr][Ee][Ff]\s*)>|\{\{(?:[SsEe]fn|[Hh]rf|[Rr]p)\b[^{}]*\}\})+)\1/g, function (m, g1, g2, g3, g4, index, str) {
		// Премахване на пунктуационен знак след ref-а, ако преди ref-a е същия знак
		if (skipReferenceTags(str, index)) return m;
		if (start === -1 || start > index) start = index;
		if (end < index + m.length) end = index + m.length;
		charsRemoved[2]++;
		return g1 + g2;
	});
	end -= charsRemoved[2];

	replacement = replacement.replace(ct.fixRegExp(/(?:<\/[Rr][Ee][Ff]\s*>|<[Rr][Ee][Ff]\b[^>]*\/>|\{\{(?:[SsEe]fn|[Hh]rf|[Rr]p)\b[^{}]*\}\})[.:,;]?(?=[^{letter}\d\s<>{}|.:,;]*[{letter}\d])/g), function (m, index, str) {
		// Добавяне на интервал, ако затварящият ref е следван от дума; ако има отварящи/затварящи фигурни/ъглови скоби или вертикална черта, пропуска
		if (skipReferenceTags(str, index)) return m;
		if (start === -1 || start > index) start = index;
		if (end < index + m.length) end = index + m.length;
		charsAdded++;
		return m + ' ';
	});
	end += charsAdded;

	if (charsRemoved[0] + charsRemoved[1] + charsRemoved[2] + charsAdded === 0) return [];

	return [{
		start: start,
		end: end + charsRemoved[0] + charsRemoved[1] + charsRemoved[2] - charsAdded,
		replacement: replacement.slice(start, end),
		name: 'пункт-ref',
		description: 'Интервалите и/или част от пунктуационните знаци преди, между и след ref-овете са ненужни',
		help: 'Изтрий ненужните пунктуационни знаци и интервали преди, между и след ref-овете.'
	}];
});

ct.rules.push(function (s) {
	var re = ct.fixRegExp(/(^|\s+)([Вв](?:ъв)?|[Сс](?:ъс)?)(\s+(?:(?:[^{letter}\d\s\[\]{}<>-]|<[^>]*>)*\[\[?[^\[\]]+|(?:(?:[^\s\[\]{}<>]|<[^>]*>)+\s+){1,3}))/g);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (ct.doNotFix(s, m)) continue;
		var tooltip = null;
		var preposition = m[2];
		var text = m[3].replace(/\[(?:(?:https?:|ftps?:)?\/\/\S+|\[[^|\[\]]+\|)|<[^>]*>/gi, '');
		text = text.replace(ct.fixRegExp(/^[^{letter}\d]+/g), '');
		if (preposition.toLowerCase() === 'в' && text.match(/^(?:[ВвФф][А-Яа-я]|2-(?:рa|р?[ио])|II(?![А-яA-z\d])|и(?:ли)?\s+)/)) {
			preposition += 'ъв';
			tooltip = '„в“ трябва да стане „във“, тъй като следващата дума започва с „в“ или „ф“, или попада под логическо ударение.';
		}
		if (preposition.toLowerCase() === 'във' && !text.match(/^(?:[ВвФфVvFfWw]|2|II(?![А-яA-z\d])|и(?:ли)?\s+)/)) {
			preposition = preposition[0];
			tooltip = '„във“ трябва да стане „в“, тъй като следващата дума не започва с „в“ или „ф“, или не попада под логическо ударение.';
		}
		if (preposition.toLowerCase() === 'с' && text.match(/^(?:[СсЗз][А-Яа-я]|(?:7|17|7\d|[17]\d\d)(?:\s*\d{3})*(?!\d)|(?:X?VII|LXX[IVX]*|(?:DC)?C[IVXL]*)(?![А-яA-z\d])|и(?:ли)?\s+без\s+)/)) {
			preposition += 'ъс';
			tooltip = '„с“ трябва да стане „със“, тъй като следващата дума започва със „з“ или „с“, или попада под логическо ударение.';
		}
		if (preposition.toLowerCase() === 'със' && !text.match(/^(?:[СсЗзSsZzCc]|(?:7|17|7\d|[17]\d\d)(?:\s*\d{3})*(?!\d)|(?:X?VII|LXX[IVX]*|DCC[IVXL]*)(?![А-яA-z\d])|и(?:ли)?\s+без\s+)/)) {
			preposition = preposition[0];
			tooltip = '„със“ трябва да стане „с“, тъй като следващата дума не започва със „з“ или „с“, или не попада под логическо ударение.';
		}
		if (tooltip) {
			b.push({
				start: m.start + m[1].length,
				end: m.end - m[3].length,
				replacement: preposition,
				name: m[2].toLowerCase() + '→' + preposition.toLowerCase(),
				description: 'Поправи „' + m[2] + '“ на „' + preposition + '“',
				help: tooltip
			});
		}
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /(?:(?:^|[\[\s=|*#;:<])(?:http|ftp)s?:|\[)\/\/[^\s\[\]<>"|\/]+\/(?:[^\s\[\]<>"|]*\[[^\s\[\]<>"|]*\])+[^\s\[\]<>"|]*/gi;
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var str = m[0];
		if (str.match(/^[\[\s=|*#;:<]/)) {
			m.start++;
			str = str.slice(1);
		}
		a[i] = {
			start: m.start,
			end: m.end,
			replacement: str.replace(/\[/g, '%5B').replace(/\]/g, '%5D'),
			name: 'кв.скоби-URL',
			description: 'Процентно кодиране на отварящи/затварящи квадратни скоби в URL адрес',
			help: 'Замества <kbd>[</kbd> с <kbd>%5B</kbd> и/или <kbd>]</kbd> с <kbd>%5D</kbd> в URL адреса'

		};
	}
	return a;
});

window.ct = ct;

if (mw.config.get('wgPageContentModel') === 'wikitext' && ['MediaWiki', 'Template'].indexOf(mw.config.get('wgCanonicalNamespace')) === -1) {
	mw.loader.using('ext.gadget.Advisor', function () {
		mw.loader.load('//bg.wikipedia.org/w/index.php?title=МедияУики:Gadget-Advisor-core.js&action=raw&ctype=text/javascript');
	});
}

// </nowiki>
