// From http://en.wikipedia.org/wiki/User:Cameltrader/Advisor.js (version from 19 November 2012)
// See http://en.wikipedia.org/wiki/User:Cameltrader/Advisor.js/Description
// for details and installation instructions.
//
// The script consists of three major parts:
// * some helper functions
// * the core of the user interface, including code that collects suggestions from a set of rules
// * the rule implementations
//
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
	var wgServer = mw.config.get('wgServer') || 'http://en.wikipedia.org';
	var wgArticlePath = mw.config.get('wgArticlePath') || '/wiki/$1';
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
ct.entryPoint = function () {
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
};

if (document.readyState == 'complete') ct.entryPoint();
else ct.observe(window, 'load', ct.entryPoint);

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
    var wgCanonicalNamespace = mw.config.get('wgCanonicalNamespace');
	if ((wgCanonicalNamespace != null)
				&& /(^|_)talk$/i.test(wgCanonicalNamespace)
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

// The ``rules'' that produce suggestions is where
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
// implementations.