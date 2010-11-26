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
	Here users can apply display settings for navigation frames by class name.
	Examples:
		// frames with the class “user-bigbadframe” should be hidden by default
		myElementsDisplay["bigbadframe"] = false;

		// frames with the class “user-important” should be visible by default
		myElementsDisplay["important"] = true;
*/
var myElementsDisplay = {};

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

/** Trim leading chars (or white-spaces) */
String.prototype.ltrim = function(chars) {
	var s = typeof chars == "undefined" ? "\s" : chars;
	return this.replace(new RegExp("^[" + s + "]+", "g"), "");
}

/** Trim ending chars (or white-spaces) */
String.prototype.rtrim = function(chars) {
	var s = typeof chars == "undefined" ? "\s" : chars;
	return this.replace(new RegExp("[" + s + "]+$", "g"), "");
}

/** Trim leading and ending white-spaces */
String.prototype.trim = function() {
	return this.ltrim().rtrim();
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

/** Set display mode for all elements with a given class name */
function setElementsDisplayByClassName(className, display) {
	var els = getElementsByClassName(document, "*", className);
	for (var i = 0; i < els.length; i++) {
		els[i].style.display = display;
	}
}

/** Hide all elements with a given class name */
function hideElementsByClassName(className) {
	setElementsDisplayByClassName(className, "none");
}

/** Show all elements with a given class name */
function showElementsByClassName(className) {
	setElementsDisplayByClassName(className, "");
}


/* Test if an element has a certain class **************************************
 *
 * Description: Uses regular expressions and caching for better performance.
 * Maintainers: [[:en:User:Mike Dillon]], [[:en:User:R. Koot]], [[:en:User:SG]]
 */
var hasClass = (function () {
    var reCache = {};
    return function (element, className) {
        return (reCache[className] ? reCache[className] : (reCache[className] = new RegExp("(?:\\s|^)" + className + "(?:\\s|$)"))).test(element.className);
    };
})();

var Creator = {
	createOptgroup: function(label, data) {
		var g = document.createElement("optgroup");
		g.label = label;
		for (var i in data) {
			g.appendChild( Creator.createOption(data[i], i) );
		}
		return g;
	},

	createOption: function(val, text) {
		var o = document.createElement("option");
		o.value = val;
		o.appendChild( document.createTextNode(text) );
		return o;
	},

	createAnchor: function(url, text, title) {
		var attrs = { "href" : url, "title" : title };
		return Creator.createElement("a", attrs, text);
	},

	createHiddenField: function(name, value) {
		var attrs = { "type" : "hidden", "name" : name, "value" : value };
		return Creator.createElement("input", attrs);
	},

	createTextarea: function(id, name, value, rows, cols) {
		var attrs = { "id" : id, "name" : name || id,
			"rows" : rows || 3, "cols" :  cols || 40 };
		return Creator.createElement("textarea", attrs, value || "");
	},

	createElement: function(node, attrs, content) {
		var e = document.createElement(node);
		for (var attr in attrs) {
			e.setAttribute(attr, attrs[attr]);
		}
		if (content instanceof Array) {
			Creator.appendChildrenTo(e, content);
		} else {
			Creator.appendChildTo(e, content);
		}
		return e;
	},

	createInternUrl: function(page, action, args) {
		page = encodeURI(page.replace(/ /g, "_"));
		if ( typeof(action) == "undefined" || action === null ) {
			return wgArticlePath.replace("$1", page);
		}
		var url = wgScript + "?title="+ page +"&action="+ action;
		if ( typeof(args) == "undefined" || args === null ) {
			return url;
		}
		for (var arg in args) {
			url += "&" + arg + "=" + args[arg];
		}
		return url;
	},

	appendChildrenTo: function(parent, children) {
		for (var i = 0; i < children.length; i++) {
			parent = Creator.appendChildTo(parent, children[i]);
		}
		return parent;
	},

	appendChildTo: function(parent, child) {
		if ( typeof(child) == "string" ) {
			parent.appendChild( document.createTextNode(child) );
		} else if ( typeof(child) == "object" && child.nodeType && child.nodeType === 1 ) {
			parent.appendChild(child);
		}
		return parent;
	}
};

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
var _debug_lang = false;

function MessageLanguage() {
	this.lang = DEFAULT_USER_LANGUAGE;
	this.messages = new Object();
	this.prefix = "";

	this.addMessages = function(messages, code, prefix) {
		if ( typeof this.messages[code] == "undefined" ) {
			this.messages[code] = new Object();
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
			if ( _debug_lang ) alert(key + " го няма на "+this.lang);
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

	this.importMessages = function(lang) {
		importScript("MediaWiki:Messages/" + lang + ".js");
	};
}


var gLang = new MessageLanguage();

// import message files
gLang.setLanguage( wgUserLanguage );

var mainLangs = [ DEFAULT_USER_LANGUAGE, FALLBACK_USER_LANGUAGE ];
if ( ! inArray( wgUserLanguage, mainLangs ) ) {
	gLang.importMessages( FALLBACK_USER_LANGUAGE );
}

// add messages on load
addOnloadHook( function() {
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


/** Attach (or remove) an Event to a specific object **********
 * Cross-browser event attachment (John Resig)
 * http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
 *
 * obj  : DOM tree object to attach the event to
 * type : String, event type ("click", "mouseover", "submit", etc.)
 * fn   : Function to be called when the event is triggered (the ''this''
 *        keyword points to ''obj'' inside ''fn'' when the event is triggered)
 *
 * Local Maintainer: [[meta:User:Dschwen]]
 */

function addEvent( obj, type, fn )
{
 if (obj.addEventListener)
  obj.addEventListener( type, fn, false );
 else if (obj.attachEvent)
 {
  obj["e"+type+fn] = fn;
  obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
  obj.attachEvent( "on"+type, obj[type+fn] );
 }
}

function removeEvent( obj, type, fn )
{
 if (obj.removeEventListener)
  obj.removeEventListener( type, fn, false );
 else if (obj.detachEvent)
 {
  obj.detachEvent( "on"+type, obj[type+fn] );
  obj[type+fn] = null;
  obj["e"+type+fn] = null;
 }
}


/** JSconfig ************
 * (copied from [[meta:MediaWiki:Common.js]])
 *
 * Global configuration options to enable/disable and configure
 * specific script features from [[MediaWiki:Common.js]] and
 * [[MediaWiki:Monobook.js]]
 * This framework adds config options (saved as cookies) to [[Special:Preferences]]
 * For a more permanent change you can override the default settings in your 
 * [[Special:Mypage/monobook.js]]
 * for Example: JSconfig.keys[loadAutoInformationTemplate] = false;
 *
 *  Maintainer: [[meta:User:Dschwen]]
 */
 
var JSconfig =
{
 prefix : 'jsconfig_',
 keys : {},
 meta : {},
 
 //
 // Register a new configuration item
 //  * name          : String, internal name
 //  * default_value : String or Boolean (type determines configuration widget)
 //  * description   : String, text appearing next to the widget in the preferences
 //  * prefpage      : Integer (optional), section in the preferences to insert the widget:
 //                     0 : User profile
 //                     1 : Skin
 //                     2 : Math
 //                     3 : Files
 //                     4 : Date and time
 //                     5 : Editing
 //                     6 : Recent changes
 //                     7 : Watchlist
 //                     8 : Search
 //                     9 : Misc
 //
 // Access keys through JSconfig.keys[name]
 //
 registerKey : function( name, default_value, description, prefpage )
 {
  if( typeof(JSconfig.keys[name]) == 'undefined' ) 
   JSconfig.keys[name] = default_value;
  else {
 
   // all cookies are read as strings, 
   // convert to the type of the default value
   switch( typeof(default_value) )
   {
    case 'boolean' : JSconfig.keys[name] = ( JSconfig.keys[name] == 'true' ); break;
    case 'number'  : JSconfig.keys[name] = JSconfig.keys[name]/1; break;
   }
 
  }
 
  JSconfig.meta[name] = { 'description' : description, 'page' : prefpage || 0, 'default_value' : default_value };
 },
 
 readCookies : function()
 {
  var cookies = document.cookie.split("; ");
  var p =JSconfig.prefix.length;
  var i;
 
  for( var key in cookies )
  {
   if( cookies[key].substring(0,p) == JSconfig.prefix )
   {
    i = cookies[key].indexOf('=');
    //alert( cookies[key] + ',' + key + ',' + cookies[key].substring(p,i) );
    JSconfig.keys[cookies[key].substring(p,i)] = cookies[key].substring(i+1);
   }
  }
 },
 
 writeCookies : function()
 {
  for( var key in JSconfig.keys )
   document.cookie = JSconfig.prefix + key + '=' + JSconfig.keys[key] + '; path=/; expires=Thu, 2 Aug 2009 10:10:10 UTC';
 },
 
 evaluateForm : function()
 {
  var w_ctrl,wt;
  //alert('about to save JSconfig');
  for( var key in JSconfig.meta ) {
   w_ctrl = document.getElementById( JSconfig.prefix + key )
   if( w_ctrl ) 
   {
    wt = typeof( JSconfig.meta[key].default_value );
    switch( wt ) {
     case 'boolean' : JSconfig.keys[key] = w_ctrl.checked; break;
     case 'string' : JSconfig.keys[key] = w_ctrl.value; break;
    }
   }
  }
 
  JSconfig.writeCookies();
  return true;
 },
 
 setUpForm : function()
 { 
  var prefChild = document.getElementById('preferences');
  if( !prefChild ) return;
  prefChild = prefChild.childNodes;
 
  //
  // make a list of all preferences sections
  //
  var tabs = new Array;
  var len = prefChild.length;
  for( var key = 0; key < len; key++ ) {
   if( prefChild[key].tagName &&
       prefChild[key].tagName.toLowerCase() == 'fieldset' ) 
    tabs.push(prefChild[key]);
  }
 
  //
  // Create Widgets for all registered config keys
  //
  var w_div, w_label, w_ctrl, wt;
  for( var key in JSconfig.meta ) {
   w_div = document.createElement( 'DIV' );
 
   w_label = document.createElement( 'LABEL' );
   w_label.appendChild( document.createTextNode( JSconfig.meta[key].description ) )
   w_label.htmlFor = JSconfig.prefix + key;
 
   wt = typeof( JSconfig.meta[key].default_value );
 
   w_ctrl = document.createElement( 'INPUT' );
   w_ctrl.id = JSconfig.prefix + key;
 
   // before insertion into the DOM tree
   switch( wt ) {
    case 'boolean' : w_ctrl.type = 'checkbox'; break;
    case 'string'  : w_ctrl.type = 'text'; break;
   }
 
   w_div.appendChild( w_label );
   w_div.appendChild( w_ctrl );
   tabs[JSconfig.meta[key].page].appendChild( w_div );
 
   // after insertion into the DOM tree
   switch( wt ) {
    case 'boolean' : w_ctrl.defaultChecked = w_ctrl.checked = JSconfig.keys[key]; break;
    case 'string' : w_ctrl.defaultValue = w_ctrl.value = JSconfig.keys[key]; break;
   }
 
  }
  addEvent(document.getElementById('preferences').parentNode, 'submit', JSconfig.evaluateForm );
 }
}
 
JSconfig.readCookies();
addOnloadHook(JSconfig.setUpForm);


 /** MediaWiki media player *******************************************************
   *
   *  Description: A Java player for in-browser playback of media files.
   *  Created by: [[:en:User:Gmaxwell]]
   */

 document.write('<script type="text/javascript" src="'
             + 'http://en.wikipedia.org/w/index.php?title=Mediawiki:Wikimediaplayer.js'
             + '&action=raw&ctype=text/javascript&dontcountme=s"></scr'+'ipt>');


/** Преместване на препратките [редактиране]
* Copyright 2006, Marc Mongenet. Licence GPL et GFDL.
* The function looks for <span class="editsection">, and moves them
* to the end of their parent.
* var oldEditsectionLinks=true disables the function.
*/

function setModifySectionStyle() {
	try {
		if ( typeof oldEditsectionLinks != 'undefined' && oldEditsectionLinks ) return;
		var spans = document.getElementsByTagName("span");
		for (var s = 0, len = spans.length; s < len; ++s) {
			var span = spans[s];
			if (span.className == "editsection") {
				span.style.cssFloat = span.style.styleFloat = "none";
				span.parentNode.appendChild(document.createTextNode(" "));
				span.parentNode.appendChild(span);
			}
		}
	} catch (e) { /* something went wrong */ }
}

addOnloadHook(setModifySectionStyle);


/* * * * * * * * * *   Toolbox add-ons   * * * * * * * * * */

/***** subPagesLink ********
 * Adds a link to subpages of current page
 * (copied from [[commons:MediaWiki:Common.js]] and slightly modified)
 *
 * JSconfig items: bool JSconfig.subPagesLink
 * 	(true=enabled (default), false=disabled)
 ****/
var subPagesLink =
{
	wo_ns : [NS_MEDIA, NS_SPECIAL, NS_IMAGE, NS_CATEGORY],

	install: function()
	{
		// honor user configuration
		if( !JSconfig.keys['subPagesLink'] ) return;

		if ( document.getElementById("p-tb")
				&& ! inArray( wgNamespaceNumber, subPagesLink.wo_ns) )
		{
			addPortletLink( 'p-tb',
				Creator.createInternUrl('Special:Prefixindex/' + wgPageName +'/'),
				gLang.msg("tb-subpages"), 't-subpages' );
		}
	}
}
addOnloadHook( function() {
	JSconfig.registerKey('subPagesLink', true, gLang.msg("tb-subpages-settings"), 9);
	subPagesLink.install();

	if ( inArray("sysop", wgUserGroups) && wgCanonicalNamespace.indexOf("User") === 0 ) {
		addPortletLink( 'p-tb',
			Creator.createInternUrl('Специални:Потребителски права/' + wgTitle),
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
	var ptb = document.getElementById("p-tb");
	if ( ! ptb ) {
		return; // no toolbox, no place to go, asta la vista
	}

	var wrappers = getElementsByClassName(document, "*", 'interProject');
	if ( wrappers.length == 0 ) {
		return;
	}
	var elements = [];

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
	};

	// get projectlinks
	for (var i = 0; i < wrappers.length; i++) {
		var url = wrappers[i].getElementsByTagName('a')[0].cloneNode(true);
		url.innerHTML = getProjectName(url.href);
		elements[i] = url;
	}

	// sort alphabetically
	function sortbylabel(a, b) {
		return (a.innerHTML < b.innerHTML) ? -1 : 1;
	}
	elements.sort(sortbylabel);

	// create list
	var pllist = document.createElement('ul');
	for (var i = 0; i < elements.length; i++) {
		var plitem = Creator.createElement('li', {}, elements[i]);
		pllist.appendChild(plitem);
	}
	// and navbox
	var plheader = Creator.createElement('h5', {}, gLang.msg("tb-inother"));
	var plbox = Creator.createElement('div', {'class' : 'pBody body'}, pllist);
	var portlet = Creator.createElement( 'div',
		{'class' : 'portlet portal persistent', 'id' : 'p-sl'}, [plheader, plbox] );
	ptb.parentNode.insertBefore(portlet, ptb.nextSibling);
}

addOnloadHook(Projectlinks);


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

addOnloadHook(externMessage);


/* * * * * * * * * *   Edit tools functions   * * * * * * * * * */

/* * *   Extra buttons for text insertion   * * */

// от тези данни ще се генерират допълнителни бутони с insertTags()
var customInsButtons = {
	// "CODE" : ["LEFT", "MIDDLE", "RIGHT", "SHOWN TEXT", "TITLE"],
	"b1" : ["#виж ["+"[", "Страница", "]]", "вж", "+команда за пренасочване"],
	"b2" : ["<code>", "моля, въведете програмен код", "</code>", "<tt>код</tt>", "Текст в равноширок шрифт — обикновено код"],
	"b3" : ["<sub>", "моля, въведете индекс", "</sub>", "a<sub>x</sub>", "+долен индекс"],
	"b4" : ["<sup>", "моля, въведете степен", "</sup>", "a<sup>x</sup>", "+горен индекс"],
	"b5" : ["&"+"nbsp;", "", "", "nbsp", "+несекаем интервал"],
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
	"b22" : ["["+"[|", "", "]]", "[[...|...]]", "+препратка с разделител (курсорът е отдясно)"],
	"b23" : ["["+"[:", "", "]]", "[[:...]]", "+текстова препратка"],
	"b24" : ["#", "", "", "...#...", "+диез"]
};

// cleanup by articles
if ( "" == wgCanonicalNamespace && "edit" == wgAction ) {
	delete customInsButtons['b14'];
	delete customInsButtons['b15'];
	hookEvent("load", function() {
		var sig = document.getElementById('mw-editbutton-signature');
		if (sig) sig.style.display = "none";
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
	"ch" : ["addChars(); toggleElemDisplay('"+charsElemId+"');", "Още…",
		"Виртуална клавиатура"]
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
	"Музикална група" : atplb + "Музикална група",
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
	document.getElementById(charsElemId).innerHTML = cont;
	existChars = true;
}

/* * *   Extra buttons for text insertion   * * */

/** add some buttons and drop-down menus */
function setupCustomEditTools() {
	var toolbar = document.getElementById("toolbar");

	if ( !toolbar ) { 
		if ( ! document.getElementById("editform") ) {
			return;
		}
		// check for the enhanced toolbar
		if ( getElementsByClassName(document, "div", "toolbar").length ) {
			toolbar = putToolbar(true);
		} else {
			return;
		}
	}
	toolbar.className += " buttonlinks";
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

hookEvent("load", setupCustomEditTools);


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
	var buts = document.createElement("div");
	buts.id = "custombuttons";
	for (var i in customInsButtons) {
		var el = customInsButtons[i];
		var title = el[4];
		if ( title.charAt(0) == "+" ) {
			title = gLang.msg("et-addpref") + title.substr(1);
		}
		appendCustomButton(buts,
			{"href": "javascript:insertTags('"+el[0] +"','"+el[2]+"','"+ el[1]+"')",
			"title": title, "innerHTML": el[3]});
	}
	for (var i in customMiscButtons) {
		var el = customMiscButtons[i];
		appendCustomButton(buts, {"href":"javascript:"+el[0], "title":el[2], "innerHTML":el[1]});
	}
	parent.appendChild(buts);
}

function appendCustomButton(box, item) {
	var b = document.createElement("a");
	for (var attr in item) { b[attr] = item[attr]; }
	box.appendChild(b);
	box.appendChild( document.createTextNode(" ") );
}

function appendExtraChars(parent) {
	if ( typeof(charsElemId) == "undefined" ) {
		return;
	}
	var chbox = document.createElement("div");
	chbox.id = charsElemId;
	chbox.style.display = "none";
	parent.appendChild(chbox);
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
	var box = document.createElement("select");
	box.id = id;
	box.title = gLang.msg("et-ddmenutitle");
	box.onchange = function() {
		if (this.value != "-") {
			callback(this.value);
			this.selectedIndex = 0;
		}
		return;
	};
	if ( appendOptions(box, content) > 1 ) {
		parent.appendChild(box);
	}
}


function appendOptions(box, opts) {
	var count = 0;
	for (var i in opts) {
		if (opts[i] == "") {
			continue; // skip emtpy entries
		}
		var child = typeof(opts[i]) == "object"
			? Creator.createOptgroup(i, opts[i])
			: Creator.createOption(opts[i], i);
		box.appendChild(child);
		count++;
	}
	return count;
}


/** show/hide an element */
function toggleElemDisplay(elemId) {
	var elem = document.getElementById(elemId);
	elem.style.display = elem.style.display == 'none' ? '' : 'none';
}

/**
	insert an edit toolbar before the textarea.
	useful for testing user script pages while previewing
	use it with:
		putToolbar();
	put in your script page, e.g. User:Your_Name/monobook.js
*/
function putToolbar(rightNow) {
	var toolbar = Creator.createElement("div", {"id" : "toolbar"});
	var putIt = function() {
		var editform = document.getElementById("editform");
		editform.parentNode.insertBefore(toolbar, editform);
	};
	if ( typeof rightNow != "undefined" && rightNow ) {
		putIt();
	} else {
		addOnloadHook(putIt);
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


/* * * * * * * * * *   Featured article marker   * * * * * * * * * */

/** Interwiki links to featured articles ***************************************
*
*  Description: Highlights interwiki links to featured articles (or
*               equivalents) by changing the bullet before the interwiki link
*               into a star.
*  Maintainers: [[:en:User:R. Koot]]
*  Slightly modified by [[:bg:User:Borislav]]
*/
function LinkFA() {
	var langBody = document.getElementById("p-lang");
	if ( !langBody ) { return; }
	var InterwikiLinks = langBody.getElementsByTagName("li");
	for ( var i = 0, l = InterwikiLinks.length; i < l; i++ ) {
		if ( document.getElementById( InterwikiLinks[i].className + "-fa" ) ) {
			InterwikiLinks[i].className += " FA";
			InterwikiLinks[i].title = gLang.msg("fa-linktitle");
		} else if ( document.getElementById( InterwikiLinks[i].className + "-ga" ) ) {
			InterwikiLinks[i].className += " GA";
			InterwikiLinks[i].title = "Тази статия на друг език е определена за добра.";
		}
	}
}

addOnloadHook(LinkFA);


/* * * * * * * * * *   Dynamic Navigation Bars   * * * * * * * * * */

var NavBarHide = "Скриване";
var NavBarShow = "Показване";
var NavBarHideSlim = "−";
var NavBarShowSlim = "+";
var displayStyles = new Object();
displayStyles[NavBarHide] = displayStyles[NavBarHideSlim] = "block";
displayStyles[NavBarShow] = displayStyles[NavBarShowSlim] = "none";

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

	var isSlim = hasClass(NavFrame, "slim");
	NavToggle.firstChild.data = getNavBarLinkText(
		NavToggle.firstChild.data == getNavBarLinkText(false, isSlim),
		isSlim);
	var display = displayStyles[ NavToggle.firstChild.data ];
	for (var NavChild = NavFrame.firstChild;
			NavChild != null;
			NavChild = NavChild.nextSibling) {
		if (NavChild.nodeName == "#text") { continue; }
		if ( hasClass(NavChild, 'NavPic') || hasClass(NavChild, 'NavContent') ) {
			NavChild.style.display = display;
		}
	}
}

// adds show/hide-button to navigation bars
function createNavBarToggleButton()
{
	var indexNavBar = 0;
	var skipFrames = []; // these should be skipped in the hiding process
	// iterate over all < div >-elements
	var divs = document.getElementsByTagName("div");
	for (var i=0; i < divs.length; i++) {
		var NavFrame = divs[i];
		if ( ! hasClass(NavFrame, "NavFrame") ) { continue; }
		// if found a navigation bar
		indexNavBar++;
		var NavToggle = document.createElement("a");
		NavToggle.className = 'NavToggle';
		NavToggle.setAttribute('id', 'NavToggle' + indexNavBar);
		NavToggle.setAttribute('href', 'javascript:toggleNavBar(' + indexNavBar + ');');

                var isCollapsed = hasClass( NavFrame, "collapsed" );
                if (isCollapsed) {
                    for (var NavChild = NavFrame.firstChild; NavChild != null; NavChild = NavChild.nextSibling) {
                        if ( hasClass( NavChild, 'NavPic' ) || hasClass( NavChild, 'NavContent' ) ) {
                            NavChild.style.display = 'none';
                        }
                    }
                }

		var NavToggleText = document.createTextNode(
			getNavBarLinkText(isCollapsed, hasClass(NavFrame, "slim")) );
		NavToggle.appendChild(NavToggleText);

		// if there is no content div, create one
		var contents = getElementsByClassName(NavFrame, "*", "NavContent");
		if ( contents.length == 0 ) {
			var content = Creator.createElement("div", {"class" : "NavContent"});
			// move all frame children in it
			var skipped = 0;
			while (NavFrame.childNodes.length > skipped) {
				var ch = NavFrame.childNodes[skipped];
				if ( ch.nodeName != "#text" && hasClass(ch, "NavHead") ) {
					alert(indexNavBar + ": " + ch.className);
					skipped++;
					continue;
				}
				content.appendChild( ch );
			}
			NavFrame.appendChild( content );
		}

		// Find the NavHead and attach the toggle link
		var heads = getElementsByClassName(NavFrame, "*", "NavHead");
		if ( heads.length ) {
			heads[0].appendChild(NavToggle);
		} else {
			var head = Creator.createElement("div", {"class" : "NavHead"}, NavToggle);
			NavFrame.insertBefore(head, NavFrame.firstChild);
		}

		NavFrame.setAttribute('id', 'NavFrame' + indexNavBar);

		if ( hasClass(NavFrame, "important") ) {
			// important frame, do not hide it
			skipFrames[indexNavBar] = true;
		}
		var hidden = false;
		if ( hasClass(NavFrame, "unimportant") ) {
			// unimportant frame, hide it
			toggleNavBar(indexNavBar);
			hidden = true;
			skipFrames[indexNavBar] = true;
		}
		// apply user display settings if this frame is controlable by users
		var userClass = NavFrame.className.match( /user-([\w-]+)/ );
		if ( userClass != null
				&& typeof myElementsDisplay[ userClass[1] ] != "undefined" ) {
			if ( myElementsDisplay[ userClass[1] ] == false && !hidden ) {
				toggleNavBar(indexNavBar);
			}
			skipFrames[indexNavBar] = true;
		}
	}
	// if more Navigation Bars found than Default: hide all
	if (NavBarShowDefault < indexNavBar) {
		for (var i = 1; i <= indexNavBar; i++) {
			if ( skipFrames[i] ) continue;
			toggleNavBar(i);
		}
	}
}

function getNavBarLinkText(toShow, isSlim) {
	return toShow
		? ( isSlim ? NavBarShowSlim : NavBarShow )
		: ( isSlim ? NavBarHideSlim : NavBarHide );
}

addOnloadHook(createNavBarToggleButton);

/** Collapsible tables *********************************************************
 *
 *  Description: Allows tables to be collapsed, showing only the header. See
 *               [[:en:Wikipedia:NavFrame]].
 *  Maintainers: [[:en:User:R. Koot]]
 */

var autoCollapse = 2;
var collapseCaption = NavBarHide;
var expandCaption = NavBarShow;

function collapseTable( tableIndex )
{
	var Button = document.getElementById( "collapseButton" + tableIndex );
	var Table = document.getElementById( "collapsibleTable" + tableIndex );

	if ( !Table || !Button ) {
		return;
	}

	var Rows = Table.rows;

	if ( Button.firstChild.data == collapseCaption ) {
		for ( var i = 1; i < Rows.length; i++ ) {
			Rows[i].style.display = "none";
		}
		Button.firstChild.data = expandCaption;
	} else {
		for ( var i = 1; i < Rows.length; i++ ) {
			Rows[i].style.display = Rows[0].style.display;
		}
		Button.firstChild.data = collapseCaption;
	}
}

function createCollapseButtons()
{
	var tableIndex = 0;
	var NavigationBoxes = new Object();
	var Tables = document.getElementsByTagName( "table" );

	for ( var i = 0; i < Tables.length; i++ ) {
		if ( hasClass( Tables[i], "collapsible" ) ) {

			/* only add button and increment count if there is a header row to work with */
			var HeaderRow = Tables[i].getElementsByTagName( "tr" )[0];
			if (!HeaderRow) continue;
			var Header = HeaderRow.getElementsByTagName( "th" )[0];
			if (!Header) continue;

			NavigationBoxes[ tableIndex ] = Tables[i];
			Tables[i].setAttribute( "id", "collapsibleTable" + tableIndex );

			var Button     = document.createElement( "span" );
			var ButtonLink = document.createElement( "a" );
			var ButtonText = document.createTextNode( collapseCaption );

			Button.style.styleFloat = "right";
			Button.style.cssFloat = "right";
			Button.style.fontWeight = "normal";
			Button.style.textAlign = "right";
			Button.style.width = "6em";

			ButtonLink.style.color = Header.style.color;
			ButtonLink.setAttribute( "id", "collapseButton" + tableIndex );
			ButtonLink.setAttribute( "href", "javascript:collapseTable(" + tableIndex + ");" );
			ButtonLink.appendChild( ButtonText );

			/* Button.appendChild( document.createTextNode( "[" ) ); */
			Button.appendChild( ButtonLink );
			/* Button.appendChild( document.createTextNode( "]" ) ); */

			Header.insertBefore( Button, Header.childNodes[0] );
			tableIndex++;
		}
	}

	for ( var i = 0;  i < tableIndex; i++ ) {
		if ( hasClass( NavigationBoxes[i], "collapsed" ) || ( tableIndex >= autoCollapse && hasClass( NavigationBoxes[i], "autocollapse" ) ) ) {
			collapseTable( i );
		}
	}
}

addOnloadHook( createCollapseButtons );

/* * * * * * * * * *   Mwbot stuff   * * * * * * * * * */

/**
	Extends the functionality of an inputbox in a div.mwbot element.
	Appends { { MAINPAGE/SUBPAGE } } to MAINPAGE upon creation of MAINPAGE/SUBPAGE

	Uses the class Mwbot ([[Потребител:Borislav/mwbot.js]]).

	License: GNU GPL 2 or later / GNU FDL
	Author: [[:bg:User:Borislav|Borislav Manolov]]
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
	var wrappers = getElementsByClassName(document, "div", "mwbot");
	for (var wi = 0; wi < wrappers.length; wi++) {
		var forms = wrappers[wi].getElementsByTagName("form");
		for (var fi = 0; fi < forms.length; fi++) {
			if ( forms[fi].name == "createbox" ) {
				attachMemorizer( forms[fi] );
			}
		}
	}
}

function attachMemorizer(form) {
	var mainpage = form.title.value.rtrim("/");
	if ( mainpage == "" ) {
		mainpage = wgPageName;
	}
	form.title.value = "";
	jQuery(form).bind("submit", function() {
		if ( this.title.value.trim() == "" ) {
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
		Creator.appendChildTo(this, Creator.createHiddenField("preloadtitle", subpage));
		Memory.memorize("transcludeSubpage",
			[mainpage, subpage],
			fullpage.replace(/ /g, "_"), "view");
		return true;
	});
}

function transcludeSubpage(mainpage, subpage) {
	if ( mainpage.trim() == "" || subpage.trim() == "" ) {
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

addOnloadHook(function() {
	attachMemorizers();
	hideElementsByClassName("done-by-script");
	showElementsByClassName("showme");
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
    addOnloadHook(function()
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


/**
	Add a start new page input box to the sidebar.
	Author: Borislav Manolov
	License: Public domain
*/
gLang.addMessages({
	"p-createnew" : "Нова страница",
	"action-create" : "Създаване"
}, "bg");
gLang.addMessages({
	"p-createnew" : "Create New Page",
	"action-create" : "Create"
}, "en");

addOnloadHook(function(){
	var psearch = document.getElementById("p-search");
	if ( ! psearch || skin != "monobook" ) {
		return;
	}

	var header = Creator.createElement('h5', {}, gLang.msg("p-createnew"));
	var form = Creator.createElement('form', {
		action : wgScript, id: "createform"
	}, Creator.createElement("div", {}, [
		Creator.createHiddenField("action", "edit"),
		Creator.createElement("input", {type: "text", name: "title", id: "createPageInput"}),
		Creator.createElement("input", {type: "submit", "class": "searchButton", value: gLang.msg("action-create")})
	]));
	var box = Creator.createElement('div', {'class' : 'pBody'}, form);
	var portlet = Creator.createElement( 'div',
		{'class' : 'portlet', 'id' : 'p-create'}, [header, box] );
	psearch.parentNode.insertBefore(portlet, psearch.nextSibling);

	os_enableSuggestionsOn("createPageInput", "createform");
});



// Verwendung von OpenStreetMap in Wikipedia.
// (c) 2008 by Magnus Manske
// Released under GPL

function openStreetMapInit () {
  var c = document.getElementById ( 'coordinates' ) ;
  if ( !c ) return ;

  var a = c.getElementsByTagName ( 'a' ) ;
  var geohack = false;
  for ( var i = 0 ; i < a.length ; i++ ) {
    var h = a[i].href ;
    if ( !h.match(/geohack/) ) continue ;
    geohack = true ;
    break ;
  }
  if ( !geohack ) return ;

  var na = document.createElement ( 'a' ) ;
  na.href = '#' ;
  na.onclick = openStreetMapToggle ;
  na.appendChild ( document.createTextNode ( '⇓' ) ) ;
  c.appendChild ( document.createTextNode ( ' (' ) ) ;
  c.appendChild ( na ) ;
  c.appendChild ( document.createTextNode ( ')   ' ) ) ;
}

function openStreetMapToggle () {
  var c = document.getElementById ( 'coordinates' ) ;
  if ( !c ) return ;
  var cs = document.getElementById ( 'contentSub' ) ;
  var osm = document.getElementById ( 'openstreetmap' ) ;

  if ( cs && osm ) {
    if ( osm.style.display == 'none' ) {
      osm.style.display = 'block' ;
    } else {
      osm.style.display = 'none' ;
    }
    return false ;
  }

  var found_link = false ;
  var a = c.getElementsByTagName ( 'a' ) ;
  var h;
  for ( var i = 0 ; i < a.length ; i++ ) {
    h = a[i].href ;
    if ( !h.match(/geohack/) ) continue ;
    found_link = true ;
    break ;
  }
  if ( !found_link ) return ; // No geohack link found

  h = h.split('params=')[1] ;
  
  var i = document.createElement ( 'iframe' ) ;
  var url = 'http://toolserver.org/~kolossos/openlayers/kml-on-ol.php?lang=' + wgUserLanguage + '&params=' + h ;

  i.id = 'openstreetmap' ;
  i.style.width = '100%' ;
  i.style.height = '350px' ;
  i.style.clear = 'both' ;
  i.src = url ;
  cs.appendChild ( i ) ;
  return false ;
}

addOnloadHook(openStreetMapInit);