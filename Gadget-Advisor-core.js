// <nowiki>
// From http://en.wikipedia.org/wiki/User:Cameltrader/Advisor.js (version from 19 November 2012)
// See http://en.wikipedia.org/wiki/User:Cameltrader/Advisor.js/Description
// for details and installation instructions.
// The script consists of three major parts:
// * some helper functions
// * the core of the user interface, including code that collects suggestions from a set of rules
// * the rule implementations
// All functions, variables, and constants belonging to the script are
// encapsulated in a private namespace object -- "ct" for "Cameltrader":

var ct = ct || {};
ct.rules = ct.rules || [];

// == Helpers ==
// === DOM manipulation ===
// Browsers offer means to highlight text between two given offsets ("start"
// and "end") in a textarea, but some of them do not automatically scroll to it.
// This function is an attempt to simulate cross-browser selection and scrolling.
ct.setSelectionRange = function (ta, start, end) {
	if (ta.setSelectionRange) {
		// First scroll selection region to view
		var fullText = ta.value;
		ta.value = fullText.substring(0, end);
		// For some unknown reason, you must store the scollHeight to a variable
		// before setting the textarea value. Otherwise it won't work for long strings
		var scrollTop = ta.scrollHeight;
		ta.value = fullText;
		var textareaHeight = ta.clientHeight;
		ta.focus();
		ta.setSelectionRange(start, end);
		if (scrollTop > textareaHeight){
			// scroll selection to center of textarea
			scrollTop -= textareaHeight / 2;
		} else {
			scrollTop = 0;
		}
		ta.scrollTop = scrollTop;
		// Continue to set selection range
	} else {
		// IE incorrectly counts '\r\n' as a signle character
		start -= ta.value.substring(0, start).split('\r').length - 1;
		end -= ta.value.substring(0, end).split('\r').length - 1;
		var range = ta.createTextRange();
		range.collapse(true);
		range.moveStart('character', start);
		range.moveEnd('character', end - start);
		range.select();
	}
};

// getPosition(e), observe(e, x, f), stopObserving(e, x, f),
// and stopEvent(event) are inspired by the prototype.js framework
// http://prototypejs.org/
ct.getPosition = function (e) {
	var x = 0;
	var y = 0;
	do {
		x += e.offsetLeft || 0;
		y += e.offsetTop || 0;
		e = e.offsetParent;
	} while (e);
	return {x: x, y: y};
};

ct.observe = function (e, eventName, f) {
	if (e.addEventListener) {
		e.addEventListener(eventName, f, false);
	} else {
		e.attachEvent('on' + eventName, f);
	}
};

ct.stopObserving = function (e, eventName, f) {
	if (e.removeEventListener) {
		e.removeEventListener(eventName, f, false);
	} else {
		e.detachEvent('on' + eventName, f);
	}
};

ct.stopEvent = function (event) {
	if (event.preventDefault) {
		event.preventDefault();
		event.stopPropagation();
	} else {
		event.returnValue = false;
		event.cancelBubble = true;
	}
};

// ct.anchor() is a shortcut to creating a link as a DOM node:
ct.anchor = function (text, href, title) {
	var e = document.createElement('a');
	e.href = href;
	e.appendChild(document.createTextNode(text));
	e.title = title || '';
	return e;
};

// ct.link() produces the HTML for a link to a Wikipedia article as a string.
// It is convenient to embed in a help popup.
ct.hlink = function (toWhat, text) {
	var wgServer = mw.config.get('wgServer') || 'http://en.wikipedia.org';
	var wgArticlePath = mw.config.get('wgArticlePath') || '/wiki/$1';
	var url = (wgServer + wgArticlePath).replace('$1', toWhat);
	return '<a href="' + url + '" target="_blank">' + (text || toWhat) + '</a>';
};

// === Helpers a la functional programming ===
// A higher-order function -- produces a cached version of a one-arg function.
ct.makeCached = function (f) {
	var cache = {}; // a closure; the cache is private for f
	return function (x) {
		return (cache[x] != null) ? cache[x] : (cache[x] = f(x));
	};
};

// === Regular expressions ===
// Regular expressions can sometimes become inconveniently large.
// In order to make complex ones easier to read, we introduce
// a set of macros. Tokens enclosed with "{" and "}" will be
// replaced according to the hashtable below.
// To do the replacements, one must pass the RegExp object
// through fixRegExp() and use the result instead, like this:
// var re = ct.fixRegExp(/It happened in {month}/);
// Also, for the sake of convenience, we add the "getAllMatches(re, s)"
// method, which is a quick means to find all occurrences of a
// regex in some text. It returns an array containing the results
// of applying RegExp.exec(..).

ct.REG_EXP_REPLACEMENTS = {
	'{letter}': // all Unicode letters (Lu, Ll, Lt, Lm and Lo categories)
		// https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt
		'\\u0041-\\u005a\\u0061-\\u007a\\u00aa\\u00b5\\u00ba\\u00c0-'
		+ '\\u00d6\\u00d8-\\u00f6\\u00f8-\\u02c1\\u02c6-\\u02d1\\u02e0-'
		+ '\\u02e4\\u02ec\\u02ee\\u0370-\\u0374\\u0376-\\u037d\\u037f'
		+ '\\u0386\\u0388-\\u03f5\\u03f7-\\u0481\\u048a-\\u0559\\u0560-'
		+ '\\u0588\\u05d0-\\u05f2\\u0620-\\u064a\\u066e\\u066f\\u0671-'
		+ '\\u06d3\\u06d5\\u06e5\\u06e6\\u06ee\\u06ef\\u06fa-\\u06fc'
		+ '\\u06ff\\u0710\\u0712-\\u072f\\u074d-\\u07a5\\u07b1\\u07ca-'
		+ '\\u07ea\\u07f4\\u07f5\\u07fa\\u0800-\\u0815\\u081a\\u0824'
		+ '\\u0828\\u0840-\\u0858\\u0860-\\u0887\\u0889-\\u088e\\u08a0-'
		+ '\\u08c9\\u0904-\\u0939\\u093d\\u0950\\u0958-\\u0961\\u0971-'
		+ '\\u0980\\u0985-\\u09b9\\u09bd\\u09ce\\u09dc-\\u09e1\\u09f0'
		+ '\\u09f1\\u09fc\\u0a05-\\u0a39\\u0a59-\\u0a5e\\u0a72-\\u0a74'
		+ '\\u0a85-\\u0ab9\\u0abd\\u0ad0-\\u0ae1\\u0af9\\u0b05-\\u0b39'
		+ '\\u0b3d\\u0b5c-\\u0b61\\u0b71\\u0b83-\\u0bb9\\u0bd0\\u0c05-'
		+ '\\u0c39\\u0c3d\\u0c58-\\u0c61\\u0c80\\u0c85-\\u0cb9\\u0cbd'
		+ '\\u0cdd-\\u0ce1\\u0cf1\\u0cf2\\u0d04-\\u0d3a\\u0d3d\\u0d4e'
		+ '\\u0d54-\\u0d56\\u0d5f-\\u0d61\\u0d7a-\\u0d7f\\u0d85-\\u0dc6'
		+ '\\u0e01-\\u0e30\\u0e32\\u0e33\\u0e40-\\u0e46\\u0e81-\\u0eb0'
		+ '\\u0eb2\\u0eb3\\u0ebd-\\u0ec6\\u0edc-\\u0f00\\u0f40-\\u0f6c'
		+ '\\u0f88-\\u0f8c\\u1000-\\u102a\\u103f\\u1050-\\u1055\\u105a-'
		+ '\\u105d\\u1061\\u1065\\u1066\\u106e-\\u1070\\u1075-\\u1081'
		+ '\\u108e\\u10a0-\\u10fa\\u10fc-\\u135a\\u1380-\\u138f\\u13a0-'
		+ '\\u13fd\\u1401-\\u166c\\u166f-\\u167f\\u1681-\\u169a\\u16a0-'
		+ '\\u16ea\\u16f1-\\u1711\\u171f-\\u1731\\u1740-\\u1751\\u1760-'
		+ '\\u1770\\u1780-\\u17b3\\u17d7\\u17dc\\u1820-\\u1884\\u1887-'
		+ '\\u18a8\\u18aa-\\u191e\\u1950-\\u19c9\\u1a00-\\u1a16\\u1a20-'
		+ '\\u1a54\\u1aa7\\u1b05-\\u1b33\\u1b45-\\u1b4c\\u1b83-\\u1ba0'
		+ '\\u1bae\\u1baf\\u1bba-\\u1be5\\u1c00-\\u1c23\\u1c4d-\\u1c4f'
		+ '\\u1c5a-\\u1c7d\\u1c80-\\u1cbf\\u1ce9-\\u1cec\\u1cee-\\u1cf3'
		+ '\\u1cf5\\u1cf6\\u1cfa-\\u1dbf\\u1e00-\\u1fbc\\u1fbe\\u1fc2-'
		+ '\\u1fcc\\u1fd0-\\u1fdb\\u1fe0-\\u1fec\\u1ff2-\\u1ffc\\u2071'
		+ '\\u207f\\u2090-\\u209c\\u2102\\u2107\\u210a-\\u2113\\u2115'
		+ '\\u2119-\\u211d\\u2124\\u2126\\u2128\\u212a-\\u212d\\u212f-'
		+ '\\u2139\\u213c-\\u213f\\u2145-\\u2149\\u214e\\u2183\\u2184'
		+ '\\u2c00-\\u2ce4\\u2ceb-\\u2cee\\u2cf2\\u2cf3\\u2d00-\\u2d6f'
		+ '\\u2d80-\\u2dde\\u2e2f\\u3005\\u3006\\u3031-\\u3035\\u303b'
		+ '\\u303c\\u3041-\\u3096\\u309d-\\u309f\\u30a1-\\u30fa\\u30fc-'
		+ '\\u318e\\u31a0-\\u31bf\\u31f0-\\u31ff\\u3400\\u4dbf\\u4e00-'
		+ '\\ua48c\\ua4d0-\\ua4fd\\ua500-\\ua60c\\ua610-\\ua61f\\ua62a-'
		+ '\\ua66e\\ua67f-\\ua69d\\ua6a0-\\ua6e5\\ua717-\\ua71f\\ua722-'
		+ '\\ua788\\ua78b-\\ua801\\ua803-\\ua805\\ua807-\\ua80a\\ua80c-'
		+ '\\ua822\\ua840-\\ua873\\ua882-\\ua8b3\\ua8f2-\\ua8f7\\ua8fb'
		+ '\\ua8fd\\ua8fe\\ua90a-\\ua925\\ua930-\\ua946\\ua960-\\ua97c'
		+ '\\ua984-\\ua9b2\\ua9cf\\ua9e0-\\ua9e4\\ua9e6-\\ua9ef\\ua9fa-'
		+ '\\uaa28\\uaa40-\\uaa42\\uaa44-\\uaa4b\\uaa60-\\uaa76\\uaa7a'
		+ '\\uaa7e-\\uaaaf\\uaab1\\uaab5\\uaab6\\uaab9-\\uaabd\\uaac0'
		+ '\\uaac2-\\uaadd\\uaae0-\\uaaea\\uaaf2-\\uaaf4\\uab01-\\uab5a'
		+ '\\uab5c-\\uab69\\uab70-\\uabe2\\uac00-\\ud7fb\\uf900-\\ufb1d'
		+ '\\ufb1f-\\ufb28\\ufb2a-\\ufbb1\\ufbd3-\\ufd3d\\ufd50-\\ufdc7'
		+ '\\ufdf0-\\ufdfb\\ufe70-\\ufefc\\uff21-\\uff3a\\uff41-\\uff5a'
		+ '\\uff66-\\uffdc',
	'{month}':
		'(?:Яну(?:ари)?|Фев(?:руари)?|Март?|Апр(?:ил)?|Май|Ю[нл]и|Авг(?:уст)?'
		+ '|Сеп(?:тември)?|Окт(?:омври)?|Ное(?:мври)?|Дек(?:ември)?)',
	'{year}':
		'[12][0-9]{3}'
};

ct.fixRegExp = function (re) { // : RegExp
	if (re.__fixedRE != null) {
		return re.__fixedRE;
	}
	var s = re.source;
	for (var alias in ct.REG_EXP_REPLACEMENTS) {
		s = s.replace(
			new RegExp(ct.escapeRegExp(alias), 'g'),
			ct.REG_EXP_REPLACEMENTS[alias]
		);
	}
	re.__fixedRE = new RegExp(s); // the fixed copy is cached
	re.__fixedRE.global = re.global;
	re.__fixedRE.ignoreCase = re.ignoreCase;
	re.__fixedRE.multiline = re.multiline;
	return re.__fixedRE;
};

ct.escapeRegExp = ct.makeCached(function (s) { // : RegExp
	var r = '';
	for (var i = 0; i < s.length; i++) {
		var code = s.charCodeAt(i).toString(16);
		r += '\\u' + '0000'.substring(code.length) + code;
	}
	return r;
});

ct.getAllMatches = function (re, s) { // : Match[]
	var p = 0;
	var a = [];
	while (true) {
		re.lastIndex = 0;
		var m = re.exec(s.substring(p));
		if (m == null) { return a; }
		m.start = p + m.index;
		m.end = p + m.index + m[0].length;
		a.push(m);
		p = m.end;
	}
};

// == Advisor core ==
// This is the basic functionality of showing and fixing suggestions.
// === Global constants and variables ===
ct.DEFAULT_MAX_SUGGESTIONS = 10;
ct.maxSuggestions = ct.DEFAULT_MAX_SUGGESTIONS;
ct.suggestions; // : Suggestion[]
ct.eSuggestions; // : Element; that's where suggestions are rendered
ct.eAddToSummary; // : Element; the proposed edit summary appears there
ct.eTextarea; // : Element; the one with id="wpTextbox1"
ct.appliedSuggestions = {}; // : Map<String, int>
ct.scannedText = null; // remember what we scan, to check if it is still the same when we try to fix it
ct.BIG_THRESHOLD = 100 * 1024;
ct.isBigScanConfirmed = false; // is the warning about a big page confirmed
ct.isTalkPageScanConfirmed = false;
ct.scanTimeoutId = null; // a timeout is set after a keystroke and before a scan, this variable tracks its id

// === int main() ===
ct.entryPoint = function () {
	ct.eTextarea = document.getElementById('wpTextbox1');
	if (ct.eTextarea == null) {
		// This is not an "?action=edit" page
		return;
	}
	ct.eSuggestions = document.createElement('div');
	ct.eSuggestions.id = 'advisorSuggestions';
	ct.eSuggestions.style.border = 'dashed #ccc 1px';
	ct.eSuggestions.style.color = '#888';
	var e = document.getElementById('editform');
	while (true) {
		var p = e.previousSibling;
		if (p == null || p.nodeType == 1 && p.id != 'toolbar') { break; }
		e = p;
	}
	e.parentNode.insertBefore(ct.eSuggestions, e);
	ct.eAddToSummary = document.createElement('div');
	ct.eAddToSummary.style.border = 'dashed #ccc 1px';
	ct.eAddToSummary.style.color = '#888';
	ct.eAddToSummary.style.display = 'none';
	var wpSummaryLabel = document.getElementById('wpSummaryLabel');
	wpSummaryLabel.parentNode.insertBefore(ct.eAddToSummary, wpSummaryLabel);
	ct.scan(); // do a scan now ...
	ct.observeWikiText(ct.delayScan); // ... and every time the user pauses typing
};

// === Internationalisation ===
// ct._() is a gettext-style internationalisation helper
// (http://en.wikipedia.org/wiki/gettext)
// If no translation is found for the parameter, it is returned as is.
// Additionally, subsequent parameters are substituted for $1, $2, and so on.
ct._ = function (s) {
	if (ct.translation && ct.translation[s]) {
		s = ct.translation[s];
	}
	var index = 1;
	while (arguments[index]) {
		s = s.replace('$' + index, arguments[index]); // todo: replace all?
		index++;
	}
	return s;
};

// === Editor compatibility layer ===
// Controlling access to wpTextbox1 helps abstract out compatibility
ct.getWikiText = function () {
	return ct.eTextarea.value;
};

ct.setWikiText = function (s) {
	ct.eTextarea.value = s;
};

ct.focusWikiText = function () {
	ct.eTextarea.focus();
};

ct.selectWikiText = function (start, end) {
	ct.setSelectionRange(ct.eTextarea, start, end);
};

ct.observeWikiText = function (callback) {
	ct.observe(ct.eTextarea, 'keyup', ct.delayScan);
};

// === Interaction with the user ===
// ct.scan() analyses the text and handles how the proposals are reflected in the UI.
ct.scan = function (force) {
	ct.scanTimeoutId = null;
	var s = ct.getWikiText();
	if (s === ct.scannedText && !force) {
		return; // Nothing to do, we've already scanned the very same text
	}
	ct.scannedText = s;
	while (ct.eSuggestions.firstChild != null) {
		ct.eSuggestions.removeChild(ct.eSuggestions.firstChild);
	}
	var len = s.length;
	try { len = new TextEncoder().encode(s.trimEnd()).length; }
	catch (e) {} // likely not possible on some older browsers
	// Page size is way too big; do not parse the text at all;
	// it can cause slowdown and ugly freezes
	if (len > ct.BIG_THRESHOLD * 2) {
		ct.eSuggestions.appendChild(document.createTextNode(
			ct._('The page is too long. Parsing of the text is '
			+ 'disabled\u00a0\u2014\u00a0Advisor.js will consume a lot '
			+ 'of RAM and CPU resources while trying to parse the text, which '
			+ 'can cause freezing of the page, the browser or even the CPU.') // U+00A0 is a non-breaking space; U+2014 is an mdash
		));
		return;
	}
	// Warn about scanning a big page
	if (len > ct.BIG_THRESHOLD && !ct.isBigScanConfirmed) {
		ct.eSuggestions.appendChild(document.createTextNode(
			ct._('This page is rather long. Advisor.js may consume a lot '
			+ 'of RAM and CPU resources while trying to parse the text. '
			+ 'You could limit your edit to a single section, or ')
		));
		ct.eSuggestions.appendChild(ct.anchor(
			ct._('scan the text anyway.'),
			'javascript: ct.isBigScanConfirmed = true; ct.scan(true); void(0);',
			ct._('Ignore this warning.')
		));
		return;
	}
	// Warn about scanning a talk page or page in "Wikipedia:" namespace
	var wgNamespaceNumber = mw.config.get('wgNamespaceNumber');
	if (!ct.isTalkPageScanConfirmed && (wgNamespaceNumber % 2 === 1 || wgNamespaceNumber === 4)) {
		ct.eSuggestions.appendChild(document.createTextNode(
			ct._('Advisor.js is disabled on talk pages and pages in '
			+ 'the namespace "Wikipedia:", because it might suggest '
			+ 'changing other users\' comments. That would be something '
			+ 'against talk page conventions. If you promise to be '
			+ 'careful, you can ')
		));
		ct.eSuggestions.appendChild(ct.anchor(
			ct._('scan the text anyway.'),
			'javascript: ct.isTalkPageScanConfirmed = true; ct.scan(true); void(0);',
			ct._('Ignore this warning.')
		));
		return;
	}
	ct.suggestions = ct.getSuggestions(s);
	if (ct.suggestions.length == 0) {
		ct.eSuggestions.appendChild(document.createTextNode(
			ct._('OK\u00a0\u2014\u00a0Advisor.js found no issues with the text.') // U+00A0 is a non-breaking space; U+2014 is an mdash
		));
		return;
	}
	var nSuggestions = Math.min(ct.maxSuggestions, ct.suggestions.length);
	ct.eSuggestions.appendChild(document.createTextNode(
		ct.suggestions.length == 1 ?
		ct._('1 suggestion: ') :
		ct._('$1 suggestions: ', ct.suggestions.length)
	));
	for (var i = 0; i < nSuggestions; i++) {
		var suggestion = ct.suggestions[i] || {};
		var eA = ct.anchor(
			suggestion.name,
			'javascript: ct.showSuggestion(' + i + '); void(0);',
			suggestion.description
		);
		suggestion.element = eA;
		ct.eSuggestions.appendChild(eA);
		if (suggestion.replacement != null) {
			var eSup = document.createElement('sup');
			ct.eSuggestions.appendChild(eSup);
			eSup.appendChild(ct.anchor(
				ct._('fix'),
				'javascript: ct.fixSuggestion(' + i + '); void(0);'
			));
		}
		ct.eSuggestions.appendChild(document.createTextNode(' '));
	}
	if (ct.suggestions.length > ct.maxSuggestions) {
		ct.eSuggestions.appendChild(ct.anchor(
			'...',
			'javascript: ct.maxSuggestions = 1000; ct.scan(true); void(0);',
			ct._('Show All')
		));
	}
};

// getSuggestions() returns the raw data used by scan().
// It is convenient for unit testing.
ct.getSuggestions = function (s) {
	var suggestions = [];
	for (var i = 0; i < ct.rules.length; i++) {
		var a = ct.rules[i](s);
		for (var j = 0; j < a.length; j++) {
			suggestions.push(a[j]);
		}
	}
	suggestions.sort(function (x, y) {
		return x.name < y.name ? -1 : x.name > y.name ? 1 : 0;
	});
	suggestions.sort(function (x, y) {
		return x.replacement != null && y.replacement == null ? -1 :
			   x.replacement == null && y.replacement != null ? 1 : 0;
	});
	return suggestions;
};

// delayScan() postpones the invocation of scan() with a certain timeout.
// If delayScan() is invoked once again during that time, the original
// timeout is cancelled, and another, clean timeout is started from zero.
// delayScan() will normally be invoked when a key is pressed -- this
// prevents frequent re-scans while the user is typing.
ct.delayScan = function () {
	if (ct.scanTimeoutId != null) {
		clearTimeout(ct.scanTimeoutId);
		ct.scanTimeoutId = null;
	}
	ct.scanTimeoutId = setTimeout(ct.scan, 1000);
};

// showSuggestion() handles clicks on the suggestions above the edit area
// This does one of two things:
// * on first click -- highlight the corresponding text in the textarea
// * on a second click, no later than a fixed number milliseconds after
// the first one -- show the help popup
ct.showSuggestion = function (k) {
	if (ct.getWikiText() != ct.scannedText) {
		// The text has changed -- just do another scan and don't change selection
		ct.scan();
		return;
	}
	var suggestion = ct.suggestions[k];
	if (!suggestion) { return; }
	var now = new Date().getTime();
	if (suggestion.help != null && ct.lastShownSuggestionIndex === k && now - ct.lastShownSuggestionTime < 1000) {
		// Show help
		var p = ct.getPosition(suggestion.element);
		var POPUP_WIDTH = 300;
		var eDiv = document.createElement('div');
		eDiv.innerHTML = suggestion.help;
		eDiv.style.position = 'absolute';
		eDiv.style.left = Math.max(0, Math.min(p.x, document.body.clientWidth - POPUP_WIDTH)) + 'px';
		eDiv.style.top = (p.y + suggestion.element.offsetHeight) + 'px';
		eDiv.style.border = 'solid ThreeDShadow 1px';
		eDiv.style.backgroundColor = 'InfoBackground';
		eDiv.style.fontSize = '12px';
		eDiv.style.color = 'InfoText';
		eDiv.style.width = POPUP_WIDTH + 'px';
		eDiv.style.padding = '0.3em';
		eDiv.style.zIndex = 10;
		document.body.appendChild(eDiv);
		ct.observe(document.body, 'click', function handler(event) {
			event = event || window.event;
			var target = event.target || event.srcElement;
			var e = target;
			while (e != null) {
				if (e == eDiv) { return; }
				e = e.parentNode;
			}
			document.body.removeChild(eDiv);
			ct.stopObserving(document.body, 'click', handler(event));
		});
		ct.focusWikiText();
		return;
	}
	ct.lastShownSuggestionIndex = k;
	ct.lastShownSuggestionTime = now;
	ct.selectWikiText(suggestion.start, suggestion.end);
};

// Usually, there is a "fix" link next to each suggestion. It is handled by:
ct.fixSuggestion = function (k) {
	var s = ct.getWikiText();
	if (s != ct.scannedText) {
		ct.scan();
		return;
	}
	var suggestion = ct.suggestions[k];
	if (!suggestion || suggestion.replacement == null) { // the issue is not automatically fixable
		return;
	}
	ct.setWikiText(
		s.substring(0, suggestion.start)
		+ suggestion.replacement
		+ s.substring(suggestion.end)
	);
	ct.selectWikiText(
		suggestion.start,
		suggestion.start + suggestion.replacement.length
	);
	// Propose an edit summary unless it's a new section
	var editform = document.getElementById('editform');
	if (!editform.wpSection || editform.wpSection.value != 'new') {
		if (ct.appliedSuggestions[suggestion.name] == null) {
			ct.appliedSuggestions[suggestion.name] = 1;
		} else {
			ct.appliedSuggestions[suggestion.name]++;
		}
		var a = [];
		for (var i in ct.appliedSuggestions) {
			a.push(i);
		}
		a.sort(function (x, y) {
			return ct.appliedSuggestions[x] > ct.appliedSuggestions[y] ? -1 :
				   ct.appliedSuggestions[x] < ct.appliedSuggestions[y] ? 1 :
				   x < y ? -1 : x > y ? 1 : 0;
		});
		var b = [];
		for (var j = 0; j < a.length; j++) {
			var count = ct.appliedSuggestions[a[j]];
			b.push(count == 1 ? a[j] : count + '×' + a[j]);
		}
		// Add "formatting: " and "using Advisor.js"; join the strings in "b" array
		var str = ct._(
			'formatting: $1 (using [[User:Cameltrader#Advisor.js|Advisor.js]])',
			b.join(', ')
		);
		// Render in DOM
		while (ct.eAddToSummary.firstChild != null) {
			ct.eAddToSummary.removeChild(ct.eAddToSummary.firstChild);
		}
		ct.eAddToSummary.style.display = '';
		ct.eAddToSummary.appendChild(ct.anchor(
			ct._('Add to summary'),
			'javascript: ct.addToSummary(decodeURIComponent("' + encodeURIComponent(str) + '"));',
			ct._('Append the proposed summary to the input field below')
		));
		ct.eAddToSummary.appendChild(document.createTextNode(': "' + str + '"'));
	}
	// Re-scan immediately
	ct.scan();
};

// The mnemonics of the accepted suggestions are accumulated in ct.appliedSuggestions
// and the user is presented with a sample edit summary. If she accepts it,
// addToSummary() gets called.
ct.addToSummary = function (summary) {
	var wpSummary = document.getElementById('wpSummary');
	if (wpSummary.value.trim() != '') {
		 // do not add separator if the summary contains only the section being edited
		summary = wpSummary.value + (wpSummary.value.match(/^\s*\/\*.*?\*\/\s*$/) ? '' : '; ') + summary;
	}
	if (wpSummary.maxLength > 0 && summary.length > wpSummary.maxLength) {
		alert(ct._(
			'Error: If the proposed text is added to the summary, '
			+ 'its length will exceed the $1-character maximum by $2 characters.',
			wpSummary.maxLength, // $1
			summary.length - wpSummary.maxLength // $2
		));
		return;
	}
	wpSummary.value = summary;
	ct.eAddToSummary.style.display = 'none';
};

// This is the entry point
if (document.readyState == 'complete') ct.entryPoint();
else ct.observe(window, 'load', ct.entryPoint);

// </nowiki>
