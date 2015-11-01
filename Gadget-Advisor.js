// Българска версия на скрипта Advisor.js,
// копирана тук от Потребител:Cameltrader/Advisor.js
// виж http://en.wikipedia.org/wiki/User:Cameltrader/Advisor.js/Description

var ct = ct || {};

ct.inBrackets = function (s, m, brackets) {
    var leftContext = s.substring(0, m.start);
    var rightContext = s.substring(m.end);

    var indexOfOpeningLeft = leftContext.lastIndexOf(brackets[0]);
    var indexOfClosingLeft = leftContext.lastIndexOf(brackets[1]);
    var indexOfOpeningRight = rightContext.indexOf(brackets[0]);
    var indexOfClosingRight = rightContext.indexOf(brackets[1]);

    return (indexOfOpeningLeft != -1 && (indexOfClosingLeft == -1 || indexOfOpeningLeft > indexOfClosingLeft)) ||
        (indexOfClosingRight != -1 && (indexOfOpeningRight == -1 || indexOfOpeningRight > indexOfClosingRight));
};

// originally from https://en.wikipedia.org/wiki/User:GregU/dashes.js
// checkPat1, checkPat2, checkTags, checkFileName default to true
ct.doNotFix = function (s, m, checkPat1, checkPat2, checkTags, checkFileName) {
	var pos = m.start;
    var pat = /\[\[[^|\]]*$|\{\{[^|}]*$|[:\/%][^\s|>]+$|<[^>]*$|#\w*expr:.*$/i;
    if (checkPat1 !== false && s.substring(pos - 260, pos + 1).search(pat) >= 0)
        return true;             // it's a link, so don't change it

    var pat2 = /\{\{(друг[ои] значени[ея]|основна|към|от пренасочване|категория|anchor)[^}]*$/i;
    if (checkPat2 !== false && s.substring(pos - 260, pos + 1).search(pat2) >= 0)
        return true;             // likely templates with page-name

    if (checkTags !== false) {
        var nextTagPos = s.slice(pos).search(/<\/?(math|pre|code|tt|source|syntaxhighlight)\b/i);
        if (nextTagPos >= 0 && s.charAt(pos + nextTagPos + 1) == '/')
            return true;         // don't break a <math> equation, or source code
    }

    if (checkFileName !== false && s.slice(pos).search(/^[^|{}[\]<>\n]*\.([a-z]{3,4}\s*[|}\n])/i) >= 0)
        return true;             // it's a file name parameter
};

if (mw.config.get('wgUserLanguage') === 'bg') {
	ct.translation = {
	
'Changing text in wikEd is not yet supported.':
	'Променянето на текст в wikEd още не се поддържа.',

'This article is rather long.  Advisor.js may consume a lot of RAM and CPU resources while trying to parse the text.  You could limit your edit to a single section, or ':
	'Тази статия е твърде дълга. Advisor.js може да консумира много RAM и процесорни ресурси, докато се опитва да анализира текста. Можеш да ограничиш редакцията на един раздел, или да ',

'Advisor.js is disabled on talk pages, because it might suggest changing other users\' comments.  That would be something against talk page conventions.  If you promise to be careful, you can ':
	'Advisor.js по подразбиране е спрян за беседите, защото има опасност да предложи промяна на чужди коментари. Това би било в противоречие с конвенциите за беседи. Ако обещаваш да си внимателен, можеш да ',

'scan the text anyway.':
	'провериш текста.',

'Ignore this warning.':
	'Игнорирай това предупреждение.',

'OK \u2014 Advisor.js found no issues with the text.':
	'ОК \u2014 Advisor.js не намира проблеми в текста.',

'1 suggestion: ':
	'1 предложение: ',

'$1 suggestions: ':
	'$1 предложения: ',

'fix':
	'поправи',

'Show All':
	'Покажи всички',

'formatting: $1 (using [[User:Cameltrader#Advisor.js|Advisor.js]])':
	'форматиране: $1 (ползвайки [[Уикипедия:Съветник|Advisor.js]])',

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

ct.rules.push(function (s) {
	var re = /\[\[([{letter} ,\(\)\-]+)\|\1\]\]/g;
	re = ct.fixRegExp(re);
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
			start: m.start,
			end: m.end,
			replacement: '[[' + m[1] + ']]',
			name: 'А|А',
			description: '„[[А|А]]“ може да се опрости до „[[А]]“.',
			help: 'Синтаксисът на МедияУики позволява препратки от вида „<tt>[[А|А]]</tt>“ да се пишат просто като „<tt>[[А]]</tt>“.'
		};
	}
	return a;
});

ct.rules.push(function (s) {
	var re = /\[\[([{letter} ,\(\)\-]+)\|\1([{letter}]+)\]\]/g;
	re = ct.fixRegExp(re);
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
			start: m.start,
			end: m.end,
			replacement: '[[' + m[1] + ']]' + m[2],
			name: 'А|АБ',
			description: '„[[А|АБ]]“ може да се опрости до „[[А]]Б“.',
			help: 'Синтаксисът на МедияУики позволява препратки от вида „<tt>[[А|АБ]]</tt>“ да се пишат като „<tt>[[А]]Б</tt>“.'
		};
	}
	return a;
});

ct.rules.push(function (s) {
    var preTagRE = /<\/?pre\b/i;
    var sourceTagRE = /<\/?(source|syntaxhighlight)\b/i;
    function doNotFixSpaces(s, index, re) {
        var nextTagPos = s.slice(index).search(re);
        if (nextTagPos >= 0 && s.charAt(index + nextTagPos + 1) == '/') return true;
        return false;
    }

    var start = -1, end = 0;
    var replacement;
    var spacesRemoved1 = 0;
    var spacesRemoved2 = 0;

    // Remove end-of-line spaces
    replacement = s.replace(/ +$/gm, function (m, index, s) {
        var prev2chars = s.slice(index - 2, index);
        // don't rm EOL-space in empty table cells (after |) and in empty template param vals (after =)
        // but after headings, yes (after ==)
        if (prev2chars[1] == '|' || ( prev2chars[1] == '=' && prev2chars != '==' )) return m;
        if ( doNotFixSpaces(s, index, preTagRE) ) return m;
        if (start == -1) start = index;
        end = index + m.length;
        spacesRemoved1 += m.length;
        return '';
    });

    end = end - spacesRemoved1;

    // Remove double spaces
    replacement = replacement.replace(/([^\s])( {2,})/g, function (m, $1, $2, index, s) {
        var repl;
        var fromStartOfLine = s.slice([s.lastIndexOf('\n', index) + 1], index);
        if (    doNotFixSpaces(s, index, sourceTagRE) || doNotFixSpaces(s, index, preTagRE)
             || ( s[index + m.length] == '=' && s[index + m.length + 1] != '=' ) ) {
            repl = m;
        }
        else {
            repl = $1 + ' ';
            if (start == -1 || start > index + 1) start = index + 1;
            if (index + m.length > end) end = index + m.length;
            spacesRemoved2 += $2.length - 1;
        }
        return repl;
    });

    end = end - spacesRemoved2;

    var spacesRemoved = spacesRemoved1 + spacesRemoved2;  // == s.length - replacement.length;

    if (spacesRemoved === 0) return [];

    replacement = replacement.slice(start, end);

    var a = [{
        start: start,
        end: end + spacesRemoved,
        replacement: replacement,
        name: (spacesRemoved == 1 ? 'интервал' : spacesRemoved + ' интервала'),
        description: 'Изтрий двойните интервали и интервалите в края на редовете',
        help: 'Двойните интервали и интервалите в края на редовете са ненужни.'
    }];

    return a;
});

ct.rules.push(function (s) {
	// [^|] - пропусни ако вероятно е за означаване на празна клетка в таблица
	var re = /[^|]([ \u00a0]+|&nbsp;)[-\u2014] +/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0, l = a.length; i < l; i++) {
		var m = a[i];
		if ( ct.doNotFix(s, m) ) {
			continue;
		}
		b.push({
			start: m.start + 1,
			end: m.end,
			replacement: '\u00a0\u2013 ', // U+2013 is an ndash
			name: 'тире',
			description: 'Смени със средно тире (en dash)',
			help: 'В изречение, късо тире оградено с интервали, почти сигурно трябва да е средно тире (en dash).'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /[^0-9]({year}|\[\[{year}\]\])(?:-|\u2014|--)({year}|\[\[{year}\]\])[^0-9]/g;
    // U+2014 is mdash, U+2013 is ndash
	re = ct.fixRegExp(re);
	var a = ct.getAllMatches(re, s);
    var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];

        if ( ct.doNotFix(s, m) ) continue;

		b.push({
			start: m.start + 1,
			end: m.end - 1,
			replacement: m[1] + '\u2013' + m[2],
			name: 'тире-години',
			description: 'За периодите от години се използва средно тире (en dash).'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /^(?: *)(==+)( *)([^=]*[^= ])( *)\1/gm;
	var a = ct.getAllMatches(re, s);
	var b = [];
	var level = 0; // == Level 1 ==, === Level 2 ===, ==== Level 3 ====, etc.
	var editform = document.getElementById('editform');
	// If we are editing a section, we have to be tolerant to the first heading's level
	var isSection = editform &&
		editform['wpSection'] != null &&
		editform['wpSection'].value != '';
	// Count spaced and non-spaced headings to find out the majority
	var counters = {spaced: 0, nonSpaced: 0, unclear: 0};
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		counters[(!m[2] && !m[4]) ? 'nonSpaced' : (m[2] && m[4]) ? 'spaced' : 'unclear']++;
	}
	var predominantSpacingStyle = 'unclear';
	var total = counters.spaced + counters.nonSpaced;
	var threshold = 0.7;
	if (total >= 3) { // minimum number of headings required for us to judge
		if (counters.spaced >= threshold * total) {
			predominantSpacingStyle = 'spaced';
		} else if (counters.nonSpaced >= threshold * total) {
			predominantSpacingStyle = 'nonSpaced';
		}
	}
	var titleSet = {}; // a set of title names, will be used to detect duplicates
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (m[2] != m[4]) {
			var spacer = (predominantSpacingStyle == 'spaced') ? ' ' : (predominantSpacingStyle == 'nonSpaced') ? '' : m[2];
			b.push({
				start: m.start,
				end: m.end,
				replacement: m[1] + spacer + m[3] + spacer + m[1],
				name: 'заглавие',
				description: 'Поправи интервалите',
				help: 'Стилът на заглавието трябва да е или '
					+ "<tt>==&nbsp;С интервали&nbsp;==</tt>, или <tt>==Без интервали==</tt>."
			});
		} else if ((m[2] && predominantSpacingStyle == 'nonSpaced') || (!m[2] && predominantSpacingStyle == 'spaced')) {
			var spacer = m[2] ? '' : ' ';
			b.push({
				start: m.start,
				end: m.end,
				replacement: m[1] + spacer + m[3] + spacer + m[1],
				name: 'заглавие-стил',
				description: 'Съобрази се с това, че повечето заглавия в тази статия са ' + (m[2] ? 'без' : 'с') + ' интервали',
				help: 'Има два стила на писане на заглавия в уики-текста: <tt><ul><li>== С интервали ==</li><li>==Без интервали==</li></ul>'
					+ 'Повечето заглавия в тази статия са '	+ (m[2] ? 'без' : 'със')
					+ ' (' + counters.spaced + ' срещу ' + counters.nonSpaced + '). '
					+ 'Препоръчва се да се съобразиш с мнозинството.'
			});
		}
		var oldLevel = level;
		level = m[1].length - 1;
		if (level - oldLevel > 1 && (!isSection || oldLevel > 0) ) {
			var h = '======='.substring(0, oldLevel + 2);
			b.push({
				start: m.start,
				end: m.end,
				//replacement: h + m[2] + m[3] + m[2] + h,
				name: 'заглавие-вложеност',
				description: 'Поправи ръчно неправилната вложеност, провери и следващите подзаглавия',
				help: 'Всяко заглавие трябва да е вложено точно едно ниво под по-общото заглавие.'
			});
		}
		var frequentMistakes = [
//			{ code: 'see-also',  wrong: /^see *al+so$/i,          correct: 'See also' },
//			{ code: 'ext-links', wrong: /^external links?$/i,     correct: 'External links' },
//			{ code: 'refs',      wrong: /^ref+e?r+en(c|s)es?$/i,  correct: 'References' }
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
						help: 'Правилното изписване е „<tt>' + fm.correct + "</tt>“."
					});
				}
			}
		}
		if (titleSet[m[3]] != null) {
			b.push({
				start: m.start + (m[1] || '').length + (m[2] || '').length,
				end: m.start + (m[1] || '').length + (m[2] || '').length + m[3].length,
				replacement: null, // we cannot propose anything, it's the editor who has to choose a different title
				name: 'повторено заглавие',
				description: 'Повтарящите се заглавия трябва да се избягват',
				help: 'Имената на секциите трябва да са уникални в рамките на статията.'
			});
		}
		titleSet[m[3]] = true;
	}
	return b;
});

ct.rules.push(function (s) {
	// ISBN: ten or thirteen digits, each digit optionally followed by a hyphen, the last digit can be 'X' or 'x'
	var a = ct.getAllMatches(/ISBN *=? *(([0-9Xx]-?)+)/gi, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var s = m[1].replace(/[^0-9Xx]+/g, '').toUpperCase(); // remove all non-digits
		if (s.length !== 10 && s.length !== 13) {
			b.push({
				start: m.start,
				end: m.end,
				name: 'ISBN',
				description: 'Трябва да е дълъг 10 или 13 цифри',
				help: 'ISBN номерата трябва да са дълги 10 или 13 цифри. '
					+ 'Този се състои от ' + s.length + ' цифри:<br><tt>' + m[1] + '</tt>'
			});
			continue;
		}
		var isNew = (s.length === 13); // old (10 digits) or new (13 digits)
		var xIndex = s.indexOf('X');
		if (xIndex !== -1 && (xIndex !== 9 || isNew)) {
			b.push({
				start: m.start,
				end: m.end,
				name: 'ISBN',
				description: 'Неправилна употреба на X като цифра',
				help: "``<tt>X</tt>'' може да се ползва само като последна цифра в в 10-цифрен ISBN номер "
					+ '<br><tt>' + m[1] + '</tt>'
			});
			continue;
		}
		var computedChecksum = 0;
		var modulus = isNew ? 10 : 11;
		for (var j = s.length - 2; j >= 0; j--) {
			var digit = s.charCodeAt(j) - 48; // 48 is the ASCII code of '0'
			var quotient = isNew
				? ((j & 1) ? 3 : 1) // the new way: 1 for even, 3 for odd
				: 10 - j;           // the old way: 10, 9, 8, etc
			computedChecksum = (computedChecksum + (quotient * digit)) % modulus;
		}
		computedChecksum = (modulus - computedChecksum) % modulus;
		var c = s.charCodeAt(s.length - 1) - 48;
		var actualChecksum = (c < 0 || 9 < c) ? 10 : c;
		if (computedChecksum === actualChecksum) {
			continue;
		}
		b.push({
			start: m.start,
			end: m.end,
			name: 'ISBN',
			description: 'Неправилна контролна сума',
			help: 'Неправилна контролна сума на ISBN номер:<br/><tt>' + m[1] + '</tt><br/>'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /([{letter}]|&#768;|&#x0?300;|\u0300)+/g;
	re = ct.fixRegExp(re);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var w = m[0]; // the word
		if (w === 'й') {
			b.push({
				start: m.start,
				end: m.end,
				replacement: 'ѝ',
				name: 'й→ѝ',
				description: 'Промени „й“ на „ѝ“',
				help: 'Когато се ползва като местоимение, „й“ трябва да се изписва '
					+ 'като „ѝ“ с ударение.'
			});
		} else {
			// todo: check spelling
		}
	}
	return b;
});

ct.rules.push(function (s) {
	// год. предшествано от цифри, евентуално оградени с [[ и ]]
	var re = /(\[\[[0-9]+\]\]|[0-9]+)([ \u00a0]+|&nbsp;)?\u0433\u043e\u0434\./g;
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
			start: m.start,
			end: m.end,
			replacement: m[1] + '\u00a0г.',
			name: 'год.→г.',
			description: 'год.→г.',
			help: 'Приетото съкращение за година е „г.“, а не „год.“'
		};
	}
	return a;
});

ct.rules.push(function (s) {
	// год., лв. или щ.д.
	var re = /(\[\[[0-9]+\]\]|[0-9]+)( +|&nbsp;)?(\u0433\.|\u043b\u0432\.|\u0449\.\u0434\.)/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var number = m[1]; // може да е оградено с [[ и ]]
		var spacing = m[2] || '';
		var unit = m[3];
		if (spacing !== ' ') {
			b.push({
				start: m.start,
				end: m.end,
				replacement: number + '\u00a0' + unit,
				name: 'число+' + unit,
				description: 'Добави интервал между числото и ' + unit,
				help: 'Между число и „' + unit + '“ трябва да се оставя един интервал, '
					+ 'за предпочитане непренасящият се <tt>&amp;nbsp;</tt> '
					+ '(non-breaking space, <tt>U+00A0</tt>).'
			});
		}
	}
	return b;
});

ct.rules.push(function (s) {
    var re = /([А-я\]\)“]+)( , ?|,)(?=[А-я\[\(„])/g;
    re = ct.fixRegExp(re);
    var a = ct.getAllMatches(re, s);
    var b = [];
    for (var i = 0; i < a.length; i++) {
        var m = a[i];
        if (ct.inBrackets(s, m, ['[', ']']) || ct.inBrackets(s, m, ['{', '}'])) {
        	continue;
        }
        b.push({
            start: m.start + m[1].length,
            end: m.end,
            replacement: m[2].trim() + ' ',
            name: 'запетая',
            description: 'Премахни интервала преди запетаята и/или добави такъв след нея',
            help: 'Интервалът трябва да е след запетаята и не преди нея.'
        });
    }
    return b;
});

ct.rules.push(function (s) {
    var re = /( [а-я]{2,})( \. ?|\.)(?=[А-Я][а-я]+)/g;
    re = ct.fixRegExp(re);
    var a = ct.getAllMatches(re, s);
    var b = [];
    for (var i = 0; i < a.length; i++) {
        var m = a[i];
        if (ct.inBrackets(s, m, ['[', ']']) || ct.inBrackets(s, m, ['{', '}'])) {
        	continue;
        }
        b.push({
            start: m.start + m[1].length,
            end: m.end,
            replacement: m[2].trim() + ' ',
            name: 'точка',
            description: 'Премахни интервала преди точката в края на изречението и/или добави такъв след нея',
            help: 'Интервалът трябва да е след точката и не преди нея.'
        });
    }
    return b;
});

ct.rules.push(function (s) {
    var re = /((=\n{2,}.)|[^=\n]\n=|.\n{3,}.|\.\n[А-я])/g;
    re = ct.fixRegExp(re);
    var a = ct.getAllMatches(re, s);
    for (var i = 0; i < a.length; i++) {
        var m = a[i];
        var lines = (m[2] === undefined) ? '\n\n' : '\n';
        a[i] = {
            start: m.start,
            end: m.end,
            replacement: m[1][0] + lines + m[1][m.end - m.start - 1],
            name: 'нов ред',
            description: 'Премахни излишните празни редове или добави нов ред между отделните абзаци',
            help: 'Между отделните абзаци трябва да има един празен ред. Повече от един празен ред е излишен.'
        };
    }
    return a;
});

ct.rules.push(function (s) {
    var re = /(([А-я] e [А-я])|[a-z][А-я]|[А-я][a-z])/g;
    re = ct.fixRegExp(re);
    var a = ct.getAllMatches(re, s);
    for (var i = 0; i < a.length; i++) {
        var m = a[i];
        a[i] = {
            start: m.start,
            end: m.end,
            replacement: null,
            name: '6lokavica',
            description: 'Неизвестна замяна. Проверете текста.',
            help: 'Една дума трябва да бъде написана или само на кирилица или само на латиница.'
        };
        
        function replace(latin, cyrillic) {
        	a[i].replacement = m[1].replace(latin, cyrillic);
        	a[i].description = 'Замени латинско "' + latin + '" с кирилско.';
        }
        
        if (m[2] !== undefined) replace('e', 'е');
        else {
        	if (m[1].indexOf('a') > -1) replace('a', 'а');
        	else if (m[1].indexOf('e') > -1) replace('e', 'е');
        	else if (m[1].indexOf('o') > -1) replace('o', 'о');
        	else if (m[1].indexOf('x') > -1) replace('x', 'х');
        	else if (m[1].indexOf('p') > -1) replace('p', 'р');
        	else if (m[1].indexOf('c') > -1) replace('c', 'с');
        }
    }
    return a;
});

ct.rules.push(function (s) {
	// отварящи кавички ако са в нач. на реда или след '', интервал, *, #, >, }, (, [, «
	// за "" (но не и за “”) също работи когато има "„“ кавички в адреса на връзка вътре в кавички
	var re = /(\n|''|[ *#>}|(\[«])(?:"(?![ .,;])((?:[^"„“\[]|\[\[[^|\]"„“]+\]|\[\[[^\]|]+\|)*[^"„“ (\[«])"|“(?![ .,;])([^"„“]*[^"„“ (\[«])”)/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0, l = a.length; i < l; i++) {
		var m = a[i];
		if ( ct.doNotFix(s, m) ) {
			continue;
		}
		b.push({
			start: m.start + m[1].length,
			end: m.end,
			replacement: '„' + (m[2] || m[3]) + '“',
			name: 'кавички',
			description: 'Заместване на "прави" или “други горни” с „български“ кавички.',
			help: 'В българския език и в Уикипедия на български се използват тези кавички: „ и “.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
    var re = /[^\n](\| *[\wА-я-]+ *= *(?=[\|\}]))+/g;
    re = ct.fixRegExp(re);
    var a = ct.getAllMatches(re, s);
    for (var i = 0; i < a.length; i++) {
        var m = a[i];
        a[i] = {
            start: m.start + 1,
            end: m.end,
            replacement: '',
            name: 'параметър',
            description: 'Премахва неизползваните параметри от шаблоните',
            help: 'Неизползваните параметри са излишни.'
        };
    }
    return a;
});


ct.rules.push(function (s) {
    var skipNext = 0;
    var decoder = function (match, charCode, index, s) {
        if (skipNext > 0) {
            skipNext--;
            return '';
        }

        var decimal = parseInt(charCode, 16);
        var bin = Number(decimal).toString(2);
        if ( decimal < 128 ) return match; // ASCII, don't decode

        var nOfBytes = bin.match(/^1+/)[0].length;
        skipNext = nOfBytes - 1;

        var urlEncoded = match + s.slice(index + 3, index + 3 * nOfBytes);

        var char = decodeURI(urlEncoded);
        return (char.length == 1 ? char : urlEncoded);
    }

    var re = /(https?:\/\/[^\/ ]+\/)(((?![ \n\|\]\}><]).)*)/g;
    var a = ct.getAllMatches(re, s);
    var b = [];
    var decoded;
    for (var i = 0; i < a.length; i++) {
        var m = a[i];
        try {
            decoded = m[2].replace(/%([0-9A-Fa-f]{2})/g, decoder);
            if (m[2] === decoded) continue;
            b.push({
                start: m.start,
                end: m.end,
                replacement: m[1] + decoded,
                name: 'URL',
                description: 'Декодира кодирани URL адреси',
                help: 'URL адресите се четат по-лесно когато са декодирани.'
            });
        }
        catch (e) {
            b.push({
                start: m.start,
                end: m.end,
                name: 'невалиден URL',
                description: 'Адресът изглежда е невалиден',
                help: 'Проверете и опитайте да поправите адреса'
            });
        }
    }
    return b;
});

//ct.rules.push(function (s) {
//    var re = /([А-я]+)(\(|\)| ?\( | \) ?)(?=[А-я]+)/g;
//    re = ct.fixRegExp(re);
//    var a = ct.getAllMatches(re, s);
//    for (var i = 0; i < a.length; i++) {
//        var m = a[i];
//        a[i] = {
//            start: m.start + m[1].length,
//            end: m.end,
//            replacement: m[2].indexOf('(') != -1 ? ' (' : ') ',
//            name: 'скоба',
//            description: 'Добави/премахни интервала преди/след отварящата/затварящата скоба',
//            help: 'Преди отваряща и след затваряща скоба трябва да има интервал. Интервалите са ненужни след отваряща и преди затваряща скоба.'
//        };
//    }
//    return a;
//});

ct.rules.push(function (s) {
    var re = /[0-9] (Януари|Февруари|Март|Април|Май|Юни|Юли|Август|Септември|Октомври|Ноември|Декември)[^А-я]/g;
    var a = ct.getAllMatches(re, s);
    var m, replacement, b = [];
    for (var i = 0; i < a.length; i++) {
        m = a[i];
        if ( ct.doNotFix(s, m) ) continue;
        replacement = m[1][0].toLowerCase() + m[1].slice(1);
        b.push({
            start: m.start + 2,
            end: m.end - 1,
            replacement: replacement,
            name: 'месец',
            description: m[1] + ' -> ' + replacement,
            help: 'В българския език имената на месеците се пишат с малка буква.'
        });
    }
    return b;
});

window.ct = ct;

if ($.inArray(mw.config.get('wgCanonicalNamespace'), ['MediaWiki', 'Template', 'Module']) === -1) {
	mw.loader.using( 'ext.gadget.Advisor', function () {
		mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Cameltrader/Advisor.js&action=raw&ctype=text/javascript');
	});
}