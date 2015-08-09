// Българска версия на скрипта Advisor.js,
// копирана тук от Потребител:Cameltrader/Advisor.js
// виж http://en.wikipedia.org/wiki/User:Cameltrader/Advisor.js/Description

if ($.inArray(mw.config.get('wgCanonicalNamespace'), ['User', 'MediaWiki', 'Template', 'Module']) === -1) {

// All functions, variables, and constants belonging to the script are
// encapsulated in a private namespace object---``ct'' for ``Cameltrader'':

var ct = ct || {};

// == Helpers ==

// === DOM manipulation ===

// Browsers offer means to highlight text between two given offsets (``start''
// and ``end'') in a textarea, but some of them do not automatically scroll to it.
// This function is an attempt to simulate cross-browser selection and scrolling.
ct.setSelectionRange = function (ta, start, end) {
	// Initialise static variables used within this function
	var _static = arguments.callee; // this is the Function we are in.  It will be used as a poor man's function-local static scope.
	if (ta.setSelectionRange) {
		// Guess the vertical scroll offset by creating a
		// separate hidden clone of the original textarea, filling it with the text
		// before ``start'' and computing its height.
		if (_static.NEWLINES == null) {
			_static.NEWLINES = '\n'; // 64 of them should be enough.
			for (var i = 0; i < 6; i++) {
				_static.NEWLINES += _static.NEWLINES;
			}
		}
		if (_static.helperTextarea == null) {
			_static.helperTextarea = document.createElement('TEXTAREA');
			_static.helperTextarea.style.display = 'none';
			document.body.appendChild(_static.helperTextarea);
		}
		var hta = _static.helperTextarea;
		hta.style.display = '';
		hta.style.width = ta.clientWidth + 'px';
		hta.style.height = ta.clientHeight + 'px';
		hta.value = _static.NEWLINES.substring(0, ta.rows) + ta.value.substring(0, start);
		var yOffset = hta.scrollHeight;
		hta.style.display = 'none';
		ta.focus();
		ta.setSelectionRange(start, end);
		if (yOffset > ta.clientHeight) {
			yOffset -= Math.floor(ta.clientHeight / 2);
			ta.scrollTop = yOffset;
			// Opera does not support setting the scrollTop property
			if (ta.scrollTop != yOffset) {
				// todo: Warn the user or apply a workaround
			}
		} else {
			ta.scrollTop = 0;
		}
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
		y += e.offsetTop  || 0;
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
	var e = document.createElement('A');
	e.href = href;
	e.appendChild(document.createTextNode(text));
	e.title = title || '';
	return e;
};

// ct.link() produces the HTML for a link to a Wikipedia article as a string.
// It is convenient to embed in a help popup.
ct.hlink = function (toWhat, text) {
	var wgServer = window.wgServer || 'http://en.wikipedia.org';
	var wgArticlePath = window.wgArticlePath || '/wiki/$1';
	var url = (wgServer + wgArticlePath).replace('$1', toWhat);
	return '<a href="' + url + '" target="_blank">' + (text || toWhat) + '</a>';
};

// === Helpers a la functional programming ===
// A higher-order function---produces a cached version of a one-arg function.
ct.makeCached = function (f) {
	var cache = {}; // a closure; the cache is private for f
	return function (x) {
		return (cache[x] != null) ? cache[x] : (cache[x] = f(x));
	};
};

// === Regular expressions ===
// Regular expressions can sometimes become inconveniently large.
// In order to make complex ones easier to read, we introduce
// a set of macros.  Tokens enclosed with ``{'' and ``}'' will be
// replaced according to the hashtable below.
//
// To do the replacements, one must pass the RegExp object
// through fixRegExp() and use the result instead, like this:
//
//	var re = ct.fixRegExp(/It happened in {month}/);
//
// Also, for the sake of convenience, we add the "getAllMatches(re, s)"
// method, which is a quick means to find all occurrences of a
// regex in some text.  It returns an array containing the results
// of applying RegExp.exec(..).

ct.REG_EXP_REPLACEMENTS = {
	'{letter}': // all Unicode letters
			// http://www.codeproject.com/dotnet/UnicodeCharCatHelper.asp
			'\\u0041-\\u005a\\u0061-\\u007a\\u00aa'
			+ '\\u00b5\\u00ba\\u00c0-\\u00d6'
			+ '\\u00d8-\\u00f6\\u00f8-\\u01ba\\u01bc-\\u01bf'
			+ '\\u01c4-\\u02ad\\u0386\\u0388-\\u0481\\u048c-\\u0556'
			+ '\\u0561-\\u0587\\u10a0-\\u10c5\\u1e00-\\u1fbc\\u1fbe'
			+ '\\u1fc2-\\u1fcc\\u1fd0-\\u1fdb\\u1fe0-\\u1fec'
			+ '\\u1ff2-\\u1ffc\\u207f\\u2102\\u2107\\u210a-\\u2113'
			+ '\\u2115\\u2119-\\u211d\\u2124\\u2126\\u2128'
			+ '\\u212a-\\u212d\\u212f-\\u2131\\u2133\\u2134\\u2139'
			+ '\\ufb00-\\ufb17\\uff21-\\uff3a\\uff41-\\uff5a',
	'{month}': // English only
			'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|'
			+ 'January|February|March|April|June|July|August|September|'
			+ 'October|November|December)',
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
		if (m == null) {
			return a;
		}
		m.start = p + m.index;
		m.end = p + m.index + m[0].length;
		a.push(m);
		p = m.end;
	}
};

// == Advisor core ==
// This is the basic functionality of showing and fixing suggestions.

// === Global constants and variables ===
ct.DEFAULT_MAX_SUGGESTIONS = 8;
ct.maxSuggestions = ct.DEFAULT_MAX_SUGGESTIONS;
ct.suggestions; // : Suggestion[]
ct.eSuggestions; // : Element; that's where suggestions are rendered
ct.eAddToSummary; // : Element; the proposed edit summary appears there
ct.eTextarea; // : Element; the one with id="wpTextbox1"
ct.appliedSuggestions = {}; // : Map<String, int>

ct.scannedText = null; // remember what we scan, to check if it is
                       // still the same when we try to fix it

ct.BIG_THRESHOLD = 100 * 1024;
ct.isBigScanConfirmed = false; // is the warning about a big article confirmed
ct.isTalkPageScanConfirmed = false;

ct.scanTimeoutId = null; // a timeout is set after a keystroke and before
                         // a scan, this variable tracks its id

// === int main() ===
// This is the entry point
ct.observe(window, 'load', function () {
	ct.eTextarea = document.getElementById('wpTextbox1');
	if (ct.eTextarea == null) {
		// This is not an ``?action=edit'' page
		return;
	}
	ct.eSuggestions = document.createElement('DIV');
	ct.eSuggestions.style.border = 'dashed #ccc 1px';
	ct.eSuggestions.style.color = '#888';
	var e = document.getElementById('editform');
	while (true) {
		var p = e.previousSibling;
		if ( (p == null) || ((p.nodeType == 1) && (p.id != 'toolbar')) ) {
			break;
		}
		e = p;
	}
	e.parentNode.insertBefore(ct.eSuggestions, e);
	ct.eAddToSummary = document.createElement('DIV');
	ct.eAddToSummary.style.border = 'dashed #ccc 1px';
	ct.eAddToSummary.style.color = '#888';
	ct.eAddToSummary.style.display = 'none';
	var wpSummaryLabel = document.getElementById('wpSummaryLabel');
	wpSummaryLabel.parentNode.insertBefore(ct.eAddToSummary, wpSummaryLabel);
	ct.scan(); // do a scan now ...
	ct.observeWikiText(ct.delayScan); // ... and every time the user pauses typing
});

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
// with editors like wikEd (http://en.wikipedia.org/wiki/User:Cacycle/wikEd)

ct.getWikiText = function () {
	if (window.wikEdUseWikEd) {
		var obj = {sel: WikEdGetSelection()};
		WikEdParseDOM(obj, wikEdFrameBody);
		return obj.plain;
	}
	return ct.eTextarea.value;
};

ct.setWikiText = function (s) {
	if (window.wikEdUseWikEd) {
		// todo: wikEd compatibility
		alert(ct._('Changing text in wikEd is not yet supported.'));
		return;
	};
	ct.eTextarea.value = s;
};

ct.focusWikiText = function () {
	if (window.wikEdUseWikEd) {
		wikEdFrameWindow.focus();
		return;
	}
	ct.eTextarea.focus();
};

ct.selectWikiText = function (start, end) {
	if (window.wikEdUseWikEd) {
		var obj = x = {sel: WikEdGetSelection(), changed: {}};
		WikEdParseDOM(obj, wikEdFrameBody);
		var i = 0;
		while ((obj.plainStart[i + 1] != null) && (obj.plainStart[i + 1] <= start)) {
			i++;
		}
		var j = i;
		while ((obj.plainStart[j + 1] != null) && (obj.plainStart[j + 1] <= end)) {
			j++;
		}
		obj.changed.range = document.createRange();
		obj.changed.range.setStart(obj.plainNode[i], start - obj.plainStart[i]);
		obj.changed.range.setEnd(obj.plainNode[j], end - obj.plainStart[j]);
		WikEdRemoveAllRanges(obj.sel);
		obj.sel.addRange(obj.changed.range);
		return;
	}
	ct.setSelectionRange(ct.eTextarea, start, end);
};

ct.observeWikiText = function (callback) {
	// todo: wikEd compatibility
	ct.observe(ct.eTextarea, 'keyup', ct.delayScan);
};

// === Interaction with the user ===
// ct.scan() analyses the text and handles how the proposals are reflected in the UI.
ct.scan = function (force) {
	ct.scanTimeoutId = null;
	var s = ct.getWikiText();
	if ((s === ct.scannedText) && !force) {
		return; // Nothing to do, we've already scanned the very same text
	}
	ct.scannedText = s;
	while (ct.eSuggestions.firstChild != null) {
		ct.eSuggestions.removeChild(ct.eSuggestions.firstChild);
	}
	// Warn about scanning a big article
	if ((s.length > ct.BIG_THRESHOLD) && !ct.isBigScanConfirmed) {
		ct.eSuggestions.appendChild(document.createTextNode(
				ct._('This article is rather long.  Advisor.js may consume a lot of '
				+ 'RAM and CPU resources while trying to parse the text.  You could limit '
				+ 'your edit to a single section, or ')
		));
		ct.eSuggestions.appendChild(ct.anchor(
				ct._('scan the text anyway.'),
				'javascript: ct.isBigScanConfirmed = true; ct.scan(true); void(0);',
				ct._('Ignore this warning.')
		));
		return;
	}
	// Warn about scanning a talk page
	if ((window.wgCanonicalNamespace != null)
				&& /(\b|_)talk$/i.test(window.wgCanonicalNamespace)
				&& !ct.isTalkPageScanConfirmed) {
		ct.eSuggestions.appendChild(document.createTextNode(
				ct._('Advisor.js is disabled on talk pages, because ' +
				'it might suggest changing other users\' comments.  That would be ' +
				'something against talk page conventions.  If you promise to be ' +
				'careful, you can ')
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
				ct._('OK \u2014 Advisor.js found no issues with the text.') // U+2014 is an mdash
		));
		return;
	}
	var nSuggestions = Math.min(ct.maxSuggestions, ct.suggestions.length);
	ct.eSuggestions.appendChild(document.createTextNode(
		(ct.suggestions.length == 1)
				? ct._('1 suggestion: ')
				: ct._('$1 suggestions: ', ct.suggestions.length)
	));
	for (var i = 0; i < nSuggestions; i++) {
		var suggestion = ct.suggestions[i];
		var eA = ct.anchor(
				suggestion.name,
				'javascript:ct.showSuggestion(' + i + '); void(0);',
				suggestion.description
		);
		suggestion.element = eA;
		ct.eSuggestions.appendChild(eA);
		if (suggestion.replacement != null) {
			var eSup = document.createElement('SUP');
			ct.eSuggestions.appendChild(eSup);
			eSup.appendChild(ct.anchor(
					ct._('fix'), 'javascript:ct.fixSuggestion(' + i + '); void(0);'
			));
		}
		ct.eSuggestions.appendChild(document.createTextNode(' '));
	}
	if (ct.suggestions.length > ct.maxSuggestions) {
		ct.eSuggestions.appendChild(ct.anchor(
				'...', 'javascript: ct.maxSuggestions = 1000; ct.scan(true); void(0);',
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
		return (x.start < y.start) ? -1 :
		       (x.start > y.start) ? 1 :
		       (x.end < y.end) ? -1 :
		       (x.end > y.end) ? 1 : 0;
	});
	return suggestions;
};

// delayScan() postpones the invocation of scan() with a certain timeout.
// If delayScan() is invoked once again during that time, the original
// timeout is cancelled, and another, clean timeout is started from zero.
//
// delayScan() will normally be invoked when a key is pressed---this
// prevents frequent re-scans while the user is typing.
ct.delayScan = function () {
	if (ct.scanTimeoutId != null) {
		clearTimeout(ct.scanTimeoutId);
		ct.scanTimeoutId = null;
	}
	ct.scanTimeoutId = setTimeout(ct.scan, 500);
};

// showSuggestion() handles clicks on the suggestions above the edit area
// This does one of two things:
// * on first click---highlight the corresponding text in the textarea
// * on a second click, no later than a fixed number milliseconds after the
// 		first one---show the help popup
ct.showSuggestion = function (k) {
	if (ct.getWikiText() != ct.scannedText) {
		// The text has changed - just do another scan and don't change selection
		ct.scan();
		return;
	}
	var suggestion = ct.suggestions[k];
	var now = new Date().getTime();
	if ((suggestion.help != null) && (ct.lastShownSuggestionIndex === k) && (now - ct.lastShownSuggestionTime < 1000)) {
		// Show help
		var p = ct.getPosition(suggestion.element);
		var POPUP_WIDTH = 300;
		var eDiv = document.createElement('DIV');
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
		ct.observe(document.body, 'click', function (event) {
			event = event || window.event;
			var target = event.target || event.srcElement;
			var e = target;
			while (e != null) {
				if (e == eDiv) {
					return;
				}
				e = e.parentNode;
			}
			document.body.removeChild(eDiv);
			ct.stopObserving(document.body, 'click', arguments.callee);
		});
		ct.focusWikiText();
		return;
	}
	ct.lastShownSuggestionIndex = k;
	ct.lastShownSuggestionTime = now;
	ct.selectWikiText(suggestion.start, suggestion.end);
};

// Usually, there is a ``fix'' link next to each suggestion.  It is handled by:
ct.fixSuggestion = function (k) {
	var s = ct.getWikiText();
	if (s != ct.scannedText) {
		ct.scan();
		return;
	}
	var suggestion = ct.suggestions[k];
	if (suggestion.replacement == null) { // the issue is not automatically fixable
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
	if (!editform['wpSection'] || (editform['wpSection'].value != 'new')) {
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
			return (ct.appliedSuggestions[x] > ct.appliedSuggestions[y]) ? -1 :
				   (ct.appliedSuggestions[x] < ct.appliedSuggestions[y]) ? 1 :
				   (x < y) ? -1 : (x > y) ? 1 : 0;
		});
		var s = '';
		for (var i = 0; i < a.length; i++) {
			var count = ct.appliedSuggestions[a[i]];
			s += ', ' + ((count == 1) ? a[i] : (count + 'x ' + a[i]));
		}
		// Cut off the leading ``, '' and add ``formatting: '' and ``using Advisor.js''
		s = ct._(
				'formatting: $1 (using [[User:Cameltrader#Advisor.js|Advisor.js]])',
				s.substring(2)
		);
		// Render in DOM
		while (ct.eAddToSummary.firstChild != null) {
			ct.eAddToSummary.removeChild(ct.eAddToSummary.firstChild);
		}
		ct.eAddToSummary.style.display = '';
		ct.eAddToSummary.appendChild(ct.anchor(
				ct._('Add to summary'),
				'javascript:ct.addToSummary(unescape("' + escape(s) + '"));',
				ct._('Append the proposed summary to the input field below')
		));
		ct.eAddToSummary.appendChild(document.createTextNode(': "' + s + '"'));
	}
	// Re-scan immediately
	ct.scan();
};

// The mnemonics of the accepted suggestions are accumulated in ct.appliedSuggestions
// and the user is presented with a sample edit summary.  If she accepts it,
// addToSummary() gets called.
ct.addToSummary = function (summary) {
	var wpSummary = document.getElementById('wpSummary');
	if (wpSummary.value != '') {
		summary = wpSummary.value + '; ' + summary;
	}
	if ((wpSummary.maxLength > 0) && (summary.length > wpSummary.maxLength)) {
		alert(ct._(
				'Error: If the proposed text is added to the summary, '
				+ 'its length will exceed the $1-character maximum by $2 characters.',
				/* $1 = */ wpSummary.maxLength,
				/* $2 = */ summary.length - wpSummary.maxLength
		));
		return;
	}
	wpSummary.value = summary;
	ct.eAddToSummary.style.display = 'none';
};

// == Rules ==

// This chapter contains the ``rules'' that produce suggestions---this is where
// most of the load resides.  Each rule is a javascript function that accepts a
// string as a parameter (the wikitext of the page being edited) and returns an
// array of ``suggestion'' objects.  A suggestion object must have the following
// properties:
// * start---the 0-based inclusive index of the first character to be replaced
// * end---analogous to start, but exclusive
// * replacement---the proposed wikitext
// * name---this is what appears at the top of the page
// * description---used as a tooltip for the name of the suggestion

// The set of rules to apply depends on the content language.  Different
// languages have different formatting conventions, therefore this is not
// a matter of internationalisation like the UI core, but of unrelated
// implementations.  What follows is the implementation for the English-language
// Wikipedia.

if (!window.wgContentLanguage || (window.wgContentLanguage === 'en')) { // from this line on, a level of indent is spared

// The rules are stored in an array:
ct.rules = []; // : Function[]
// and are grouped into categories.

// === Linking rules ===

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
				name: 'A|A',
				description: '"[[A|A]]" can be simplified to [[A]].',
				help: ct.hlink('WP:Syntax#Wiki_markup', 'MediaWiki syntax')
					+ ' allows links of the form <tt>[[A|A]]</tt> to be abbreviated as <tt>[[A]].</tt>  '
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
				name: 'A|AB',
				description: '"[[A|AB]]" can be simplified to [[A]]B.',
				help: ct.hlink('WP:Syntax#Wiki_markup', 'MediaWiki syntax')
					+ ' allows links of the form <tt>[[A|AB]]</tt> to be abbreviated as <tt>[[A]]B.</tt>'
		};
	}
	return a;
});

ct.rules.push(function (s) {
	// Initialise statics
	var _static = arguments.callee;
	if (_static.MONTH_MAP == null) {
		_static.MONTH_MAP = {
				Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May',
				Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October',
				Nov: 'November', Dec: 'December', January: 'January', February: 'February',
				March: 'March', April: 'April', June: 'June', July: 'July',
				August: 'August', September: 'September', October: 'October',
				November: 'November', December: 'December'
		};
	}
	// This will match either a date+year or just a year, and will not match solitary dates.
	// If the year is part of an ISO date of the form [[yyyy]]-[[mm-dd]], the remainder is included.
	// The rule only controls the transition from linked to unlinked, as practice has shown
	// that improper linking is significantly more common than leaving linkable dates as plain text.
	var re = /(?:\[\[((?:(\d\d?) +({month}))|(?:({month}) +(\d\d?)))\]\],?( )? *)?\[\[({year})\]\](-\[\[\d\d-\d\d\]\])?/;
	re = ct.fixRegExp(re);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var date = m[1] || null;
		var year = m[7] || null;
		if (date == null) {
			if (!m[8]) { // protect ISO dates---m[8] is the ISO remainder
				b.push({
						start: m.start,
						end: m.end,
						replacement: year,
						name: 'year link',
						description: 'Convert link to normal text',
						help: 'It is useless to link a year unless it is preceded by a day and month.'
							+ '<br/>Years with a day and month are normally linked so that the user '
							+ 'preferences for date format can be applied, but linking a year alone '
							+ 'has no effect.'
				});
			}
		} else {
			var isAmerican = !m[2];
			var day = (isAmerican) ? m[5] : m[2];
			var month = _static.MONTH_MAP[(isAmerican) ? m[4] : m[3]];
			var ws = m[6] || ''; // whitespace between date and year
			var replacement = (isAmerican)
					? ('[[' + month + ' ' + day + ']],' + ws + '[[' + year + ']]')
					: ('[[' + day + ' ' + month + ']]' + ws + '[[' + year + ']]');
			if (replacement != m[0]) {
				b.push({
						start: m.start,
						end: m.end,
						replacement: replacement,
						name: 'date format',
						description: 'Fix date format',
						help: 'Commas in dates should follow one of these styles:<br/>'
								+ '<tt>[[1 January]] [[1970]]</tt><br>'
								+ '<tt>[[January 1]], [[1970]]</tt><br>'
								+ 'and month names should not be abbreviated.'
				});
			}
		}
	}
	return b;
});

ct.rules.push(function (s) {
	// Matches decades in the range 1000s ... 2990s,
	// linked either as [[xxx0]]s or as [[xxx0s]]
	var re = /\[\[([12][0-9][0-9]0)(\]\]s\b|'?s\]\])/g;
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
				start: m.start,
				end: m.end,
				replacement: m[1] + 's',
				name: 'decade link',
				description: 'Convert link to normal text',
				help: 'Decades should not be linked, unless they deepen the '
					+ 'readers\' understanding of the topic.'
		};
	}
	return a;
});

ct.rules.push(function (s) {
	// Matches decades in the range 1000s ... 2990s
	var re = /\bthe +([12][0-9][0-9]0)'s\b/g;
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
				start: m.start,
				end: m.end,
				replacement: m[1] + 's',
				name: 'decade format',
				description: 'Remove the apostrophe from the decade',
				help: 'The preferred decade format is without an apostrophe, per '
						+ ct.hlink('WP:DATE#Longer_periods') + '.'
		};
	}
	return a;
});

ct.rules.push(function (s) {
	var re = /\[\[([0-9]{1,2}(st|nd|rd|th) century)\]\]/g
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
				start: m.start,
				end: m.end,
				replacement: m[1],
				name: 'century link',
				description: 'Convert link to normal text',
				help: 'Centuries should not be linked, unless they deepen the '
					+ 'readers\' understanding of the topic.'
		};
	}
	return a;
});

// === Character formatting rules ===

ct.rules.push(function (s) {
	var a = ct.getAllMatches(/ +$/gm, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (/^[=\|]$/.test(s[m.start - 1])) { // this can be tolerated, it happens too often in templates
			continue;
		}
		b.push({
				start: m.start,
				end: m.end,
				replacement: '',
				name: 'whitespace',
				description: 'Delete trailing whitespace',
				help: 'Trailing whitespace at the end of a line is unnecessary.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /[{letter}]( +- +)[{letter}]/g;
	re = ct.fixRegExp(re);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		// Be careful not to break wikilinks.  If we find a ']' before we find an '['---drop the suggestion.
		var rightContext = s.substring(m.end);
		var indexOfOpening = rightContext.indexOf('[');
		var indexOfClosing = rightContext.indexOf(']');
		if ((indexOfClosing != -1)
				&& ((indexOfOpening == -1) || (indexOfOpening > indexOfClosing))) {
			continue;
		}
		b.push({
				start: m.start + 1,
				end: m.end - 1,
				replacement: '&nbsp;\u2014 ', // U+2014 is an mdash
				name: 'mdash',
				description: 'In a sentence, a hyphen surrounded by spaces means almost certainly an mdash.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /[^0-9]({year}) *(?:-|\u2014|&mdash;|--) *({year})[^0-9]/g; // U+2014 is an mdash
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
				start: m.start + 1,
				end: m.end - 1,
				replacement: m[1] + '\u2013' + m[2], // U+2013 is an ndash
				name: 'ndash',
				description: 'Year ranges look better with an n-dash.'
		};
	}
	return a;
});

ct.rules.push(function (s) {
	var re = / (\u2014|\u2013|&mdash;|&ndash;)/g; // an m/ndash surrounded by normal spaces
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
				start: m.start,
				end: m.end,
				replacement: '&nbsp;' + m[1], // a non-breaking space and the dash
				name: 'nbsp-dash',
				description: 'Put a non-breaking space before the dash',
				help: 'Putting a ' + ct.hlink('non-breaking space') + ' (<tt>&amp;nbsp;</tt>) before a dash would '
					+ 'prevent the user agent from wrapping it at the beginning of the next line.'
		};
	}
	return a;
});

ct.rules.push(function (s) {
	var a = ct.getAllMatches(
		/(\{\{\s*(?:IPA[0-3]?|IPAAusE|IPAEng|IPAHe|[Pp]ronAusE|[Pp]ronEng|[Pp]ronounced)\s*\|\s*)([^\|\}]+)/gi, s
	);
	var b = [];
	var ipaSubstitions = {
			':': {
					replacement: '\u02d0', // U+02D0 is a ``Modifier letter triangular colon'' (used to denote vowel lengthening in IPA)
					additionalHelp: "<p>In this case the triangular colon (``\u02d0'', <tt>U+02D0</tt>), "
						+ "used to denote vowel lengthening, looks like a regular colon (``:'', <tt>U+003A</tt>)."
			},
			'\'': {
					replacement: '\u02c8', // U+02C8 is a ``Modifier letter vertical line'' (put before a stresses syllable)
					additionalHelp: "<p>In this case the vertical line (``\u02c8'', <tt>U+02c8</tt>), "
						+ " which is put before a stressed syllable, looks like an apostrophe (`` ' '', <tt>U+0027</tt>)."
			}
	};
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var ipaText = m[2];
		for (var j = 0; j < ipaText.length; j++) {
			var ch = ipaText[j];
			if (ipaSubstitions[ch] != null) {
				b.push({
						start: m.start + m[1].length + j,
						end: m.start + m[1].length + j + 1,
						replacement: ipaSubstitions[ch].replacement,
						name: 'IPA character',
						description: "Replace ``false friend'' with the correct IPA character",
						help: 'The correct IPA character '
							+ ct.hlink('WP:IPA#Entering_IPA_characters', 'should be used')
							+ " instead of its ``false friend''."
							+ '<p>Unicode contains a reserved range of characters for '
							+ ct.hlink('International Phonetic Alphabet', 'IPA')
							+ ' transcription.  Some of them look very similar to other, '
							+ 'more commonly used, alphabetic or punctuation characters ('
							+ ct.hlink('False friend', 'false friends')
							+ ').' + (ipaSubstitions[ch].additionalHelp || '')
				});
			}
		}
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /&#(([1-9][0-9]{0,4})|x([a-fA-F0-9]{1,4}));/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var charCode = (m[2]) ? parseInt(m[2]) : parseInt(m[3], 16);
		if ((charCode < 128) || (charCode > 0xffff)) {
			continue;
		}
		var ch = String.fromCharCode(charCode);
		var chHex = charCode.toString(16).toUpperCase();
		chHex = '0000'.substring(chHex.length) + chHex;
		b.push({
				start: m.start,
				end: m.end,
				replacement: ch,
				name: 'unicode-escape',
				description: 'Replace with an inline Unicode character',
				help: ct.hlink('WP:EDIT#Character_formatting', 'HTML-style escapes')
					+ " like ``<tt>&amp;#" + m[1]
					+ ";</tt>'' can be written inline using a Unicode character&mdash;in this case ``"
					+ ch + "'' (<tt>U+" + chHex + "</tt>)."
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /&([A-Za-z]+);/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	// Use a DOM element and its innerHTML property to do
	// the unescaping, let the browser do the dirty job.
	var e = document.createElement('DIV');
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (m[1] == 'nbsp') {
			// Opera incorrectly replaces nbsp-s with regular spaces:
			// http://en.wikipedia.org/w/index.php?title=User_talk%3ACameltrader&diff=179233698&oldid=175946199
			continue;
		}
		e.innerHTML = m[0];
		var ch = e.innerHTML;
		if (ch.length != 1) {
			// The entity is not a single Unicode character---ignore it
			continue;
		}
		var chHex = ch.charCodeAt(0).toString(16).toUpperCase();
		chHex = '0000'.substring(chHex.length) + chHex;
		b.push({
				start: m.start,
				end: m.end,
				replacement: e.innerHTML, // the entity, unescaped
				name: 'HTML entity',
				description: 'Replace with an inline Unicode character',
				help: ct.hlink('WP:EDIT#Character_formatting', 'HTML-style escapes')
					+ " like ``<tt>&amp;" + m[1]
					+ ";</tt>'' can be written inline using a Unicode character&mdash;in this case ``"
					+ ch + "'' (<tt>U+" + chHex + "</tt>)."
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var a = ct.getAllMatches(/\u2026/g, s); // ellipsis
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		b.push({
				start: m.start,
				end: m.end,
				replacement: '...',
				name: 'ellipsis',
				description: 'Replace ellipsis with three periods/full stops',
				help: "The ellipsis character (``\u2026'', U+2026) should be replaced with "
					+ "three periods/full stops per "
					+ ct.hlink('WP:MOS#Ellipses')
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var a = ct.getAllMatches(/\b(NOT)\b/g, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if ((s.substring(m.start - 2, m.start) == "''")
				&& (s.substring(m.end, m.end + 2) == "''")) {
			continue;
		}
		var noMoreLinksRemainder = ' A COLLECTION OF LINKS NOR SHOULD IT BE USED FOR';
		if (s.substring(m.end, m.end + noMoreLinksRemainder.length) === noMoreLinksRemainder) {
			// Tolerate subst'ed Template:NoMoreLinks
			continue;
		}
		b.push({
				start: m.start,
				end: m.end,
				replacement: "''not''",
				name: 'all-caps',
				description: 'Change to lowercase',
				help: 'According to the ' + ct.hlink('WP:MOS#Capital_letters', 'Manual of Style')
					+ ', the word <i>' + m[1].toLowerCase() + '</i> should be italicised instead '
					+ 'of being written in all caps.'
		});
	}
	return b;
});

// === Template usage rules ===

ct.rules.push(function (s) {
	// Initialise statics
	var _static = arguments.callee;
	if (_static.LANGUAGE_MAP == null) {
		_static.LANGUAGE_MAP = { // : Hashtable<String, String>
			// From http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
			// Note, that not all of these have a lang-xx template, but finding a reference
			// to such a language is a good reason to create the template.
			aa: 'Afar', ab: 'Abkhazian', ae: 'Avestan', af: 'Afrikaans', ak: 'Akan', am: 'Amharic', an: 'Aragonese', ar: 'Arabic',
			as: 'Assamese', av: 'Avaric', ay: 'Aymara', az: 'Azerbaijani', ba: 'Bashkir', be: 'Belarusian', bg: 'Bulgarian',
			bh: 'Bihari', bi: 'Bislama', bm: 'Bambara', bn: 'Bengali', bo: 'Tibetan', br: 'Breton', bs: 'Bosnian', ca: 'Catalan',
			ce: 'Chechen', ch: 'Chamorro', co: 'Corsican', cr: 'Cree', cs: 'Czech', cu: 'Church Slavic', cv: 'Chuvash', cy: 'Welsh',
			da: 'Danish', de: 'German', dv: 'Divehi', dz: 'Dzongkha', ee: 'Ewe', el: 'Greek', en: 'English', eo: 'Esperanto',
			es: 'Spanish', et: 'Estonian', eu: 'Basque', fa: 'Persian', ff: 'Fulah', fi: 'Finnish', fj: 'Fijian', fo: 'Faroese',
			fr: 'French', fy: 'Western Frisian', ga: 'Irish', gd: 'Gaelic', gl: 'Galician', gn: 'Guaran\u00ed', gu: 'Gujarati',
			gv: 'Manx', ha: 'Hausa', he: 'Hebrew', hi: 'Hindi', ho: 'Hiri Motu', hr: 'Croatian', ht: 'Haitian', hu: 'Hungarian',
			hy: 'Armenian', hz: 'Herero', ia: 'Interlingua (International Auxiliary Language Association)', id: 'Indonesian',
			ie: 'Interlingue', ig: 'Igbo', ii: 'Sichuan Yi', ik: 'Inupiaq', io: 'Ido', is: 'Icelandic', it: 'Italian', iu: 'Inuktitut',
			ja: 'Japanese', jv: 'Javanese', ka: 'Georgian', kg: 'Kongo', ki: 'Kikuyu', kj: 'Kuanyama', kk: 'Kazakh', kl: 'Kalaallisut',
			km: 'Khmer', kn: 'Kannada', ko: 'Korean', kr: 'Kanuri', ks: 'Kashmiri', ku: 'Kurdish', kv: 'Komi', kw: 'Cornish',
			ky: 'Kirghiz', la: 'Latin', lb: 'Luxembourgish', lg: 'Ganda', li: 'Limburgish', ln: 'Lingala', lo: 'Lao', lt: 'Lithuanian',
			lu: 'Luba-Katanga', lv: 'Latvian', mg: 'Malagasy', mh: 'Marshallese', mi: 'M\u0101ori', mk: 'Macedonian', ml: 'Malayalam',
			mn: 'Mongolian', mo: 'Moldavian', mr: 'Marathi', ms: 'Malay', mt: 'Maltese', my: 'Burmese', na: 'Nauru',
			nb: 'Norwegian Bokm\u00e5l', nd: 'North Ndebele', ne: 'Nepali', ng: 'Ndonga', nl: 'Dutch', nn: 'Norwegian Nynorsk',
			no: 'Norwegian', nr: 'South Ndebele', nv: 'Navajo', ny: 'Chichewa', oc: 'Occitan', oj: 'Ojibwa', om: 'Oromo', or: 'Oriya',
			os: 'Ossetian', pa: 'Panjabi', pi: 'P\u0101li', pl: 'Polish', ps: 'Pashto', pt: 'Portuguese', qu: 'Quechua',
			rm: 'Raeto-Romance', rn: 'Kirundi', ro: 'Romanian', ru: 'Russian', rw: 'Kinyarwanda', sa: 'Sanskrit', sc: 'Sardinian',
			sd: 'Sindhi', se: 'Northern Sami', sg: 'Sango', sh: 'Serbo-Croatian', si: 'Sinhala', sk: 'Slovak', sl: 'Slovenian',
			sm: 'Samoan', sn: 'Shona', so: 'Somali', sq: 'Albanian', sr: 'Serbian', ss: 'Swati', st: 'Southern Sotho', su: 'Sundanese',
			sv: 'Swedish', sw: 'Swahili', ta: 'Tamil', te: 'Telugu', tg: 'Tajik', th: 'Thai', ti: 'Tigrinya', tk: 'Turkmen',
			tl: 'Tagalog', tn: 'Tswana', to: 'Tonga', tr: 'Turkish', ts: 'Tsonga', tt: 'Tatar', tw: 'Twi', ty: 'Tahitian',
			ug: 'Uighur', uk: 'Ukrainian', ur: 'Urdu', uz: 'Uzbek', ve: 'Venda', vi: 'Vietnamese', vo: 'Volap\u00fck', wa: 'Walloon',
			wo: 'Wolof', xh: 'Xhosa', yi: 'Yiddish', yo: 'Yoruba', za: 'Zhuang', zh: 'Chinese', zu: 'Zulu'
		};
		_static.REVERSE_LANGUAGE_MAP = {}; // : Hashtable<String, String>
		for (var i in _static.LANGUAGE_MAP) {
			_static.REVERSE_LANGUAGE_MAP[_static.LANGUAGE_MAP[i]] = i;
		}
	}

	// U+201e and U+201c are opening and closing double quotes
	// U+2013 and U+2014 are an ndash and an mdash
	var re = /\[\[(\w+) language\|\1\]\] *: (\'+)*([{letter} \"\'\u201e\u201c\/\u2014\u2013\-]+)(?:\2)/g;
	re = ct.fixRegExp(re);
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (_static.REVERSE_LANGUAGE_MAP[m[1]] == null) {
			continue;
		}
		var code = _static.REVERSE_LANGUAGE_MAP[m[1]];
		// Markers for italics and bold are stripped off
		b.push({
				start: m.start,
				end: m.end,
				replacement: '{{lang-' + code + '|' + m[3] + '}}',
				name: 'lang-' + code,
				description: 'Apply the {{lang-' + code + '}} template',
				help: 'The <tt>' + ct.hlink('Template:lang-' + code, '{{lang-' + code + '}}')
					+ '</tt> template can be applied for this text.'
					+ '<br/>Similar templates are available in the '
					+ ct.hlink('Category:Multilingual_support_templates', 'multilingual support templates category')
					+ '.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /^[ ':]*(?:Main +article)[ ']*:[ ']*\[\[([^\]]+)\]\][ ']*$/mig;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if ((m[1] != null) && (m[1] != "")) {
			b.push({
					start: m.start,
					end: m.end,
					replacement: '{{main|' + m[1] + '}}',
					name: 'template-main',
					description: 'Use the {{main|...}} template',
					help: 'Template <tt>' + ct.hlink('Template:Main', '{{main|...}}')
						+ '</tt> can be used in this place.'
			});
		}
	}
	return b;
});

ct.rules.push(function (s) {
	var re = /^[ ':]*(?:(?:Further|More) +info(?:rmation)?)[ ']*:[ ']*\[\[([^\]]+)\]\][ ']*$/mig;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if ((m[1] != null) && (m[1] != '')) {
			b.push({
					start: m.start,
					end: m.end,
					replacement: '{{futher|' + m[1] + '}}',
					name: 'template-further',
					description: 'Use the {{futher|...}} template',
					help: 'Template <tt>' + ct.hlink('Template:Further', '{{further|...}}')
						+ '</tt> can be used in this place.'
			});
		}
	}
	return b;
});

ct.rules.push(function (s) {
	var exceptions = {};
	var wgTitle = window.wgTitle || '';
	if (exceptions[wgTitle]) {
		return [];
	}
	var re0 = /^([{letter}\-]+(?: [{letter}\-]+\.?)?) ([{letter}\-]+(?:ov|ev|ski))$/;
	re0 = ct.fixRegExp(re0);
	var m0 = re0.exec(wgTitle);
	if (m0 == null) {
		return [];
	}
	if (s.indexOf('DEFAULTSORT:') != -1) {
		return [];
	}
	var firstNames = m0[1];
	var lastName = m0[2];
	var re1 = new RegExp(
			'\\[\\[(Category:[\\w _\\(\\),\\-]+)\\| *'
			+ ct.escapeRegExp(lastName) + ', *'
			+ ct.escapeRegExp(firstNames)
			+ ' *\\]\\]', 'gi'
	);
	var a = ct.getAllMatches(re1, s);
	if (a.length == 0) {
		return [];
	}
	var aStart = a[0].start;
	var aEnd = a[a.length - 1].end;
	var original = s.substring(aStart, aEnd);
	var replacement = '{{' + 'DEFAULTSORT:' + lastName + ', ' + firstNames + '}}\n'
	                + original.replace(re1, '[[$1]]');
	return [{
			start: aStart,
			end: aEnd,
			replacement: replacement,
			name: 'default-sort',
			description: 'Use DEFAULTSORT to specify the common sort key',
			help: 'The <tt>' + ct.hlink('Help:Categories#Default_sort_key', 'DEFAULTSORT')
				+ '</tt> magic word can be used to specify sort keys for categories.  It was '
				+ ct.hlink('Wikipedia:Wikipedia_Signpost/2007-01-02/Technology_report',
							'announced in January 2007')
				+ '.'
	}];
});

ct.rules.push(function (s) {
	var wgTitle = window.wgTitle || '';
	var reTitle = /^(a|the) (.*)$/i;
	if (!reTitle.test(wgTitle) || (s.indexOf('DEFAULTSORT') !== -1)) {
		return [];
	}
	var a = ct.getAllMatches(/(\[\[)[Cc]ategory:[^\]]+\]\]/g, s);
	if (a.length === 0) {
		return [];
	}
	var mTitle = ct.getAllMatches(reTitle, wgTitle)[0]; // the match object for the title
	var article = mTitle[1];
	var nounPhrase = mTitle[2];
	var highlightStart = a[0].start;
	var highlightEnd = a[a.length - 1].end;
	return [{
			start: highlightStart,
			end: highlightEnd,
			replacement: '{{' + 'DEFAULTSORT:' + nounPhrase + ', ' + article + '}}\n'
						+ s.substring(highlightStart, highlightEnd),
			name: 'defaultsort-' + article.toLowerCase(),
			description: 'Add DEFAULTSORT',
			help: "Articles starting with ``a'' or ``the'' should participate in categories without the first word."
	}];
});

ct.rules.push(function (s) {
	var re = /(\{\{\s*)DEFAULTSORT\s*\|/g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		b.push({
				start: m.start,
				end: m.end,
				replacement: m[1] + 'DEFAULTSORT:',
				name: 'default-sort-magic-word',
				description: 'Replace the template with a magic word',
				help: 'Usage of the <tt>{{' + ct.hlink('Template:DEFAULTSORT', 'DEFAULTSORT')
						+ '}}</tt> template is discouraged.  The magic word with the same name should be used instead.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
	var _static = arguments.callee;
	if (_static.DEPRECATED_TEMPLATES_ARRAY == null) {
		_static.DEPRECATED_TEMPLATES_ARRAY = [
				'ArB', 'ArTranslit', 'ArabDIN', 'BridgeType', 'CFB Coaching Record End', 'CFB Coaching Record Entry',
				'CFB Coaching Record Start', 'CFB Coaching Record Team', 'CFB Coaching Record Team End', 'CURRENTWEEKDAY', 'Canada CP 2001',
				'CelsiusToKelvin', 'Chembox', 'Chembox simple inorganic', 'Chembox simple organic', 'Chinesename', 'ConvertVolume',
				'ConvertWeight', 'Country', 'Cultivar hybrid', 'Dated episode notability', 'Doctl', 'Dynamic navigation box',
				'Dynamic navigation box with image', 'Dynamic navigation small', 'Episode-unreferenced', 'Extra album cover', 'Extra chronology',
				'Fa', 'Factor', 'Fn', 'Fnb', 'Football stadium', 'Footnote', 'GUE', 'Geolinks-US-loc', 'Getamap', 'Harvard reference',
				'Hiddenkey', 'IAST-hi', 'IAST1', 'ISOtranslit', 'Iftrue', 'Illinois Area Codes', 'Infobox Minor Planet', 'Infobox Ship',
				'Infobox music venue', 'Ivrit', 'JER', 'Lang-yi2', 'Lang2iso', 'LangWithNameNoItals', 'Latinx',
				'Military-Insignia', 'Mmuk mapdet', 'Mmuk mapho25', 'Mmuk maphot', 'Mmuknr map', 'Mmuknr photo', 'Mmukpc prim', 'Navbox generic',
				'Navigation', 'Navigation box with image', 'Navigation no hide', 'Navigation with columns', 'Navigation with image', 'NavigationBox',
				'Novelinfoboxincomp', 'Novelinfoboxneeded', 'OldVGpeerreview', 'Ordinal date', 'PD-LOC', 'PIqaD',
				'Pekinensis tail familia Amaranthaceae', 'Pekinensis tail genus Chenopodium', 'Pekinensis tail regnum Plantae', 'PerB',
				'PerTranslit', 'Pound avoirdupois', 'Prettyinfobox', 'Prettytable', 'Qif', 'Rating-10', 'Rating-3', 'Rating-4', 'Rating-5',
				'Rating-6', 'Ref num', 'Reqimage', 'Rewrite-section', 'Ruby', 'Sectionrewrite', 'Semxlit', 'Skyscraper', 'Sortdate', 'Source',
				'Storm pics', 'Supertribus', 'Switch', 'Tablabonita', 'Taxobox superregnum entry', 'Taxobox supertribus entry', 'IPA fonts',
				'Unicode fonts', 'User R-proglang', 'User asm', 'User cobol', 'User css', 'User haskell', 'User html', 'User java', 'User mobile',
				'User programming', 'User unicode', 'User xhtml', 'User xml', 'Tfd-kept', 'Timeline infobox finish', 'Timeline infobox start',
				'Translit-yi2', 'WAFerry', 'Weight'
		];
		_static.DEPRECATED_TEMPLATES_SET = {};
		for (var i = _static.DEPRECATED_TEMPLATES_ARRAY.length - 1; i >= 0; i--) {
			_static.DEPRECATED_TEMPLATES_SET[_static.DEPRECATED_TEMPLATES_ARRAY[i]] = true;
		}
	}
	var a = ct.getAllMatches(ct.fixRegExp(/(\{\{\s*)([{letter}0-9\s\-]+)(\s*(\||\}\}))/g), s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var name = m[2].replace(/ /g, '_');
		name = name.charAt(0).toUpperCase() + name.substring(1);
		if (_static.DEPRECATED_TEMPLATES_SET[name]) {
			b.push({
					start: m.start,
					end: m.end,
					name: 'deprecated-template',
					description: 'Template {{' + name + '}} has been deprecated',
					help: 'Template <tt>' + ct.hlink('Template:' + name, '{{' + name + '}}')
						+ ' is ' + ct.hlink('Category:Deprecated templates', 'deprecated')
						+ '.  Consider using another one as recommended on the template page.'
			});
		}
	}
	return b;
});

// === Other rules ===

ct.rules.push(function (s) {
	var re = /^(?: *)(==+)( *)([^=]*[^= ])( *)\1/gm;
	var a = ct.getAllMatches(re, s);
	if (a.length == 0) {
		return [];
	}
	var b = [];
	var level = 0; // == Level 1 ==, === Level 2 ===, ==== Level 3 ====, etc.
	var editform = document.getElementById('editform');
	// If we are editing a section, we have to be tolerant to the first heading's level
	var isSection = editform &&
	                (editform['wpSection'] != null) &&
	                (editform['wpSection'].value != '');
	// Count spaced and non-spaced headings to find out the majority
	var counters = {spaced: 0, nonSpaced: 0, unclear: 0};
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		counters[(!m[2] && !m[4]) ? 'nonSpaced' : (m[2] && m[4]) ? 'spaced' : 'unclear']++;
	}
	var predominantSpacingStyle;
	if (counters.spaced > counters.nonSpaced) {
		predominantSpacingStyle = 'spaced';
	} else if (counters.spaced < counters.nonSpaced) {
		predominantSpacingStyle = 'nonSpaced';
	} else {
		predominantSpacingStyle = 'unclear';
		// We cannot decide which spacing style is predominant,
		// so we show a suggestion attached to the first heading,
		// recommending consistent spacing:
		b.push({
				start: a[0].start,
				end: a[0].end,
				replacement: null,
				name: 'heading',
				description: 'Consider using consistent heading spacing',
				help: 'Heading style should be either '
					+ "``<tt>==&nbsp;Heading&nbsp;==</tt>'' or ``<tt>==Heading==</tt>''.  "
					+ "Headings in this article use an equal number of both.  "
					+ "Consider choosing a heading style and using it consistently."
		});
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
					name: 'heading',
					description: 'Fix whitespace',
					help: 'Heading style should be either '
						+ "``<tt>==&nbsp;Heading&nbsp;==</tt>'' or ``<tt>==Heading==</tt>''."
			});
		} else if ((m[2] && (predominantSpacingStyle == 'nonSpaced'))
		       || (!m[2] && (predominantSpacingStyle == 'spaced'))) {
			var spacer = (m[2]) ? '' : ' ';
			b.push({
					start: m.start,
					end: m.end,
					replacement: m[1] + spacer + m[3] + spacer + m[1],
					name: 'heading-style',
					description: 'Conform to the existing majority of '
						+ ((m[2]) ? 'non-spaced' : 'spaced') + ' headings',
					help: 'There are two styles of writing headings in wikitext:<tt><ul><li>== Spaced ==<li>==Non-spaced==</ul>'
						+ 'Most of the headings in this article are '
						+ ((m[2]) ? 'non-spaced' : 'spaced')
						+ '  (' + counters.spaced + ' vs ' + counters.nonSpaced + ').  '
						+ 'It is recommended that you adapt your style to the majority.'
			});
		}
		var oldLevel = level;
		level = m[1].length - 1;
		if ( (level - oldLevel > 1) && (!isSection || (oldLevel > 0)) ) {
			var h = '======='.substring(0, oldLevel + 2);
			b.push({
					start: m.start,
					end: m.end,
					replacement: h + m[2] + m[3] + m[2] + h,
					name: 'heading-nesting',
					description: 'Fix improper nesting',
					help: 'A heading ' + ct.hlink('WP:MOS#Section_headings', 'should be')
						+ ' nested one level deeper than its parent heading.'
			});
		}
		var frequentMistakes = [
				{ code: 'see-also',  wrong: /^see *al+so$/i,          correct: 'See also' },
				{ code: 'ext-links', wrong: /^external links?$/i,     correct: 'External links' },
				{ code: 'refs',      wrong: /^ref+e?r+en(c|s)es?$/i,  correct: 'References' }
		];
		for (var j = 0; j < frequentMistakes.length; j++) {
			var fm = frequentMistakes[j];
			if (fm.wrong.test(m[3]) && (m[3] != fm.correct)) {
				var r = m[1] + m[2] + fm.correct + m[2] + m[1];
				if (r != m[0]) {
					b.push({
							start: m.start,
							end: m.end,
							replacement: r,
							name: fm.code,
							description: 'Change to ``' + fm.correct + "''.",
							help: 'The correct spelling/capitalisation is ``<tt>' + fm.correct + "</tt>''."
					});
				}
			}
		}
		if (titleSet[m[3]] != null) {
			b.push({
					start: m.start + (m[1] || '').length + (m[2] || '').length,
					end: m.start + (m[1] || '').length + (m[2] || '').length + m[3].length,
					replacement: null, // we cannot propose anything, it's the editor who has to choose a different title
					name: 'duplicate-title',
					description: 'Avoid duplicate section titles',
					help: 'Section names '
						+ ct.hlink('WP:MOS#Section_headings', 'should preferably be unique')
						+ ' within a page; this applies even for the names of subsections.'
			});
		}
		titleSet[m[3]] = true;
	}
	return b;
});

ct.rules.push(function (s) {
	// U+2013 and U+2014 are an ndash and an mdash
	var re = /\( *(?:b\.? *)?({year}) *(?:[\-\\u2013\\u2014]|&ndash;|&mdash;|--) *\)/g;
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
				start: m.start,
				end: m.end,
				replacement: '(born ' + m[1] + ')',
				name: 'born',
				description: 'The word \'born\' should be fully written.',
				help: 'According to '
					+ ct.hlink('WP:DATE#Dates_of_birth_and_death', 'WP:DATE')
					+ ', the word <i>born</i> should be fully written.'
		};
	}
	return a;
});

ct.rules.push(function (s) {
	// ISBN: ten or thirteen digits, each digit optionally followed by a hyphen, the last digit can be 'X' or 'x'
	var a = ct.getAllMatches(/ISBN *=? *(([0-9Xx]-?)+)/gi, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var s = m[1].replace(/[^0-9Xx]+/g, '').toUpperCase(); // remove all non-digits
		if ((s.length !== 10) && (s.length !== 13)) {
			b.push({
					start: m.start,
					end: m.end,
					name: 'ISBN',
					description: 'Should be either 10 or 13 digits long',
					help: 'ISBN numbers should be either 10 or 13 digits long.  '
							+ 'This one consists of ' + s.length + ' digits:<br><tt>' + m[1] + '</tt>'
			});
			continue;
		}
		var isNew = (s.length === 13); // old (10 digits) or new (13 digits)
		var xIndex = s.indexOf('X');
		if ((xIndex !== -1) && ((xIndex !== 9) || isNew)) {
			b.push({
					start: m.start,
					end: m.end,
					name: 'ISBN',
					description: 'Improper usage of X as a digit',
					help: "``<tt>X</tt>'' can only be used in 10-digit ISBN numbers "
							+ ' as the last digit:<br><tt>' + m[1] + '</tt>'
			});
			continue;
		}
		var computedChecksum = 0;
		var modulus = (isNew) ? 10 : 11;
		for (var j = s.length - 2; j >= 0; j--) {
			var digit = s.charCodeAt(j) - 48; // 48 is the ASCII code of '0'
			var quotient = (isNew)
								? ((j & 1) ? 3 : 1) // the new way: 1 for even, 3 for odd
								: (10 - j);         // the old way: 10, 9, 8, etc
			computedChecksum = (computedChecksum + (quotient * digit)) % modulus;
		}
		computedChecksum = (modulus - computedChecksum) % modulus;
		var c = s.charCodeAt(s.length - 1) - 48;
		var actualChecksum = ((c < 0) || (9 < c)) ? 10 : c;
		if (computedChecksum === actualChecksum) {
			continue;
		}
		b.push({
				start: m.start,
				end: m.end,
				name: 'ISBN',
				description: 'Bad ISBN checksum',
				help: 'Bad ISBN checksum for<br/><tt>' + m[1] + '</tt><br/>'
		});
	}
	return b;
});

} // end if (window.wgContentLanguage === 'en')


}






var ct = ct || {};

function inBrackets(s, m, brackets) {
    var leftContext = s.substring(0, m.start);
    var rightContext = s.substring(m.end);

    var indexOfOpeningLeft = leftContext.lastIndexOf(brackets[0]);
    var indexOfClosingLeft = leftContext.lastIndexOf(brackets[1]);
    var indexOfOpeningRight = rightContext.indexOf(brackets[0]);
    var indexOfClosingRight = rightContext.indexOf(brackets[1]);

    return (indexOfOpeningLeft != -1 && (indexOfClosingLeft == -1 || indexOfOpeningLeft > indexOfClosingLeft)) ||
        (indexOfClosingRight != -1 && (indexOfOpeningRight == -1 || indexOfOpeningRight > indexOfClosingRight))
}

if (window.wgUserLanguage === 'bg') {
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
	'форматиране: $1 (ползвайки [[МедияУики:Gadget-Advisor.js|Advisor.js]])',

'Add to summary':
	'Добави към резюмето',

'Append the proposed summary to the input field below':
	'Добави предложеното резюме към полето отдолу',

'Error: If the proposed text is added to the summary, its length will exceed the $1-character maximum by $2 characters.':
	'Ако предложеният текст бъде добавен към резюмето, дължината му ще прехвърли ограничението от $1 символа с $2.',

'':''
	};
}

if (window.wgContentLanguage === 'bg') {

ct.rules = [];

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
	var a = ct.getAllMatches(/ +$/gm, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		if (/^[=\|]$/.test(s[m.start - 1])) { // this can be tolerated, it happens too often in templates
			continue;
		}
		b.push({
			start: m.start,
			end: m.end,
			replacement: '',
			name: 'интервали',
			description: 'Изтрий интервалите в края на реда',
			help: 'Интервалите в края на реда са ненужни.'
		});
	}
	return b;
});

ct.rules.push(function (s) {
    var re = /[{letter}]( +- +)[{letter}]/g;
    re = ct.fixRegExp(re);
    var a = ct.getAllMatches(re, s);
    var b = [];
    for (var i = 0; i < a.length; i++) {
        var m = a[i];

        // Be careful not to break interwiki or mediawiki links
        if (inBrackets(s, m, ['[', ']']) || inBrackets(s, m, ['{', '}'])) {
            continue;
        }

        b.push({
            start: m.start + 1,
            end: m.end - 1,
            replacement: '\u00a0\u2014 ', // U+2014 is an mdash
            name: 'дълго тире',
            description: 'Смени с дълго тире (em dash)',
            help: 'В изречение, късо тире оградено с интервали, почти сигурно трябва да е дълго тире (em dash).'
        });
    }
    return b;
});

ct.rules.push(function (s) {
	var re = /[^0-9]({year}) *(?:-|\u2014|&mdash;|--) *({year})[^0-9]/g; // U+2014 is an mdash
	var a = ct.getAllMatches(re, s);
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		a[i] = {
			start: m.start + 1,
			end: m.end - 1,
			replacement: m[1] + '\u2013' + m[2], // U+2013 is an ndash
			name: 'средно тире',
			description: 'Периодите от години изглеждат по добре със средно тире (en dash).'
		};
	}
	return a;
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
				replacement: h + m[2] + m[3] + m[2] + h,
				name: 'заглавие-вложеност',
				description: 'Поправи неправилната вложеност',
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
				replacement: 'и&#768;',
				name: 'й→и\u0300',
				description: 'Промени „й“ на „и\u0300“',
				help: 'Когато се ползва като местоимение, „й“ трябва да се изписва '
					+ 'като „и&#x0300;“ с ударение. В уикитекста това може да се направи чрез '
					+ '<tt>и&amp;#x0300;</tt> или <tt>и&amp;#768;</tt>.'
			});
		} else {
			// todo: check spelling
		}
	}
	return b;
});

ct.rules.push(function (s) {
	// год. предшествано от цифри, евентуално оградени с [[ и ]]
	var re = /((\[\[[0-9]+\]\]|[0-9]+)( +|&nbsp;)?)\u0433\u043e\u0434\./g;
	var a = ct.getAllMatches(re, s);
	var b = [];
	for (var i = 0; i < a.length; i++) {
		var m = a[i];
		var original = m[0];
		var replacement = m[1] + 'г.';
		if (original !== replacement) {
			b.push({
				start: m.start,
				end: m.end,
				replacement: replacement,
				name: 'год.→г.',
				description: 'год.→г.',
				help: 'Приетото съкращение за година е „г.“, а не „год.“'
			});
		}
	}
	return b;
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
    var re = /([^\n\s])( {2,})([^\s=/])/g;
    re = ct.fixRegExp(re);
    var a = ct.getAllMatches(re, s);
    for (var i = 0; i < a.length; i++) {
        var m = a[i];
        a[i] = {
            start: m.start,
            end: m.end,
            replacement: m[1] + ' ' + m[3],
            name: 'дв. интервал',
            description: 'Замени двойните интервали с единични',
            help: 'Двойните интервали са ненужни.'
        };
    }
    return a;
});

ct.rules.push(function (s) {
    var re = /(\S*[{letter}\]\)“])( , ?|,)([{letter}\[\(„])/g;
    re = ct.fixRegExp(re);
    var a = ct.getAllMatches(re, s);
    var b = [];
    for (var i = 0; i < a.length; i++) {
        var m = a[i];
        if ((m[1].indexOf('://') > -1 && m[2] == ',') || inBrackets(s, m, ['[', ']']) || inBrackets(s, m, ['{', '}'])) {
        	continue;
        }
        
		b.push({
		    start: m.start,
		    end: m.end,
		    replacement: m[1] + m[2].trim() + ' ' + m[3],
		    name: 'запетая',
		    description: 'Премахни интервала преди запетаята и/или добави такъв след нея',
		    help: 'Интервалът трява да е след запетаята и не преди нея.'
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

}