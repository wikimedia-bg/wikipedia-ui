addOnloadHook( function(){

var hotcat_loaded = false; // Guard against double inclusions
var hotcat_running = 0 ;
var hotcat_last_v = "" ;
var hotcat_exists_yes = "http://upload.wikimedia.org/wikipedia/commons/thumb/b/be/P_yes.svg/20px-P_yes.svg.png" ;
var hotcat_exists_no = "http://upload.wikimedia.org/wikipedia/commons/thumb/4/42/P_no.svg/20px-P_no.svg.png" ;
var hotcat_upload = 0 ;
var hotcat_no_autocommit = 0;
var hotcat_old_onsubmit = null;
var hotcat_nosuggestions = false;
// hotcat_nosuggestions is set to true if we don't have XMLHttp! (On IE6, XMLHttp uses
// ActiveX, and the user may deny execution.) If true, no suggestions will ever be
// displayed, and there won't be any checking whether the category  exists.
// Lupo, 2008-01-20

var hotcat_modify_blacklist = new Array (
"CC-" ,
"GFDL" ,
"PD"
) ;

// Borislav, 2009-01-19
gLang.addMessages( {
	"cat" : "Category",
	"cats" : "Categories",
	"delay" : "HotCat autocompletion delay (ms)",
	"notfound" : 'Category "$1" not found; maybe it is in a template?',
	"multifound" : 'Category "$1" found several times; don’t know which occurrence to remove.',
	"rmdcat" : 'Removed category "$1"',
	"catexists" : 'Category "$1" already exists; not added.',
	"quickcomment" : 'Quick-adding category "$1"$2',
	"rmduncat" : "removed {" + "{uncategorized}}",
	"using" : "using [[MediaWiki:Gadget-HotCat.js|HotCat.js]]",
	"redirresolved" : "(redirect \[\[:Category:$1|$1\]\] resolved)"
}, "en" );
gLang.addMessages( {
	"cat" : "Категория",
	"cats" : "Категории",
	"delay" : "Изчакване за автоматичен завършек (в ms)",
	"notfound" : 'Категория „$1“ не беше открита на страницата; може би е част от използван шаблон?',
	"multifound" : 'Категория „$1“ беше открита повече от един път на страницата; HotCat не знае кое от срещанията да премахне.',
	"rmdcat" : 'Премахване на категория „$1“',
	"catexists" : 'Категория „$1“ вече присъства в страницата и затова не беше добавена повторно.',
	"quickcomment" : 'Бързо добавяне на „$1“$2',
	"rmduncat" : "премахване на {" + "{uncategorized}}",
	"using" : "ползвайки [[MediaWiki:Gadget-HotCat.js|HotCat.js]]",
	"redirresolved" : "(оправено пренасочване към \[\[:Категория:$1|$1\]\])"
}, "bg" );


function hotcat_remove_upload ( text ) {
	var cats = document.getElementById ( "catlinks" ) ;
	cats = cats.getElementsByTagName ( "span" ) ;
	for ( var i = 0 ; i < cats.length ; i++ ) {
		if (cats[i].hotcat_name && cats[i].hotcat_name == text) {
			cats[i].parentNode.removeChild ( cats[i].nextSibling ) ;
			cats[i].parentNode.removeChild ( cats[i] ) ;
			break ;
		}
	}
}

function hotcat_check_upload () {
	// Don't do anything if not "Special:Upload", or user not logged in.
	if ( wgNamespaceNumber != -1 || wgTitle != "Upload" || wgUserName == null) return ;
	var ip = document.getElementById ( "wpWatchthis" ) ;
	// Go to Special:Upload, choose a local file, enter a target file name without extension,
	// then submit: you get a page that is "Special:Upload", but that doesn't have any form!
	if (ip == null) return;
	hotcat_upload = 1 ;
	var tr = ip.parentNode.parentNode ;
	var ntr = document.createElement ( "tr" ) ;
	var ntd = document.createElement ( "td" ) ;
	var ntde = document.createElement ( "td" ) ;
	var catline = document.createElement ( "div" ) ;
	var np = document.createElement ( "p" ) ;

	ntde.setAttribute ('id', 'hotcatLabel');
	var label = null;
	if (typeof (UFUI) != 'undefined' &&
			typeof (UFUI.getLabel) == 'function') {
		try {
			label = UFUI.getLabel ('wpCategoriesUploadLbl');
		} catch (ex) {
			label = null;
		}
	}
	if (label == null)
		ntde.appendChild (document.createTextNode ( gLang.msg("cats") + ":"));
	else {
		ntde.setAttribute ('id', 'hotcatLabelTranslated');
		// Change the ID to avoid that UploadForm tries to translate it again.
		ntde.appendChild (label);
	}
	ntde.style.textAlign = "right" ;
	ntde.style.verticalAlign = "middle" ;
	catline.id = "catlinks" ;
	// On the upload form, the suggestion box appears at the very top of the page. That is because
	// the innermost enclosing div of the upload form (and its table) that has position "relative"
	// is the bodyContent div. Try to fix that by giving catline relative positioning, so absolute
	// positioning within should be relative to catline. Lupo, 2008-01-18
	catline.style.position ="relative";
	catline.style.textAlign = "left";
	// Otherwise, it looks bad in the Classic skin on the upload form. Lupo, 2008-05-16
	np.className = "catlinks" ;
	np.style.textAlign = "left";
	catline.appendChild ( np ) ;
	ntd.appendChild ( catline ) ;
	ntde.className = 'mw-label';
	ntr.appendChild ( ntde ) ;
	ntr.appendChild ( ntd ) ;

	// Add handler for submit (changed by Lupo, 2008-01-18)
	var form = document.getElementById ('upload');
	// Grrr... they changed the upload form!
	// http://svn.wikimedia.org/viewvc/mediawiki/trunk/phase3/includes/SpecialUpload.php?r1=32033&r2=32190
	if (!form) form = document.getElementById ('mw-upload-form');
	if (form) {
		hotcat_old_onsubmit = form.onsubmit;
		form.onsubmit = hotcat_on_upload;
		tr.parentNode.insertBefore ( ntr , tr ) ; // Insert *above* "Watch this" box
	}
}

function hotcat_on_upload () {
	// First, make sure that if we have an open category input form, we close it.
	var input = document.getElementById ('hotcat_text');
	if (input != null) hotcat_ok ();

	var do_submit = true;
	// Call previous onsubmit handler, if any
	if (hotcat_old_onsubmit) {
		if (typeof hotcat_old_onsubmit == 'string')
			do_submit = eval (hotcat_old_onsubmit);
		else if (typeof hotcat_old_onsubmit == 'function')
			do_submit = hotcat_old_onsubmit ();
	}
	if (!do_submit) return false;
	// Only copy the categories if we do submit
	var cats = document.getElementById ( "catlinks" ) ;
	cats = cats.getElementsByTagName ( "span" ) ;
	var eb = document.getElementById ( "wpUploadDescription" )
					|| document.getElementById ( "wpDesc" ); // New upload form
	for ( var i = 0 ; i < cats.length ; i++ ) {
		var t = cats[i].hotcat_name;
		if (!t) continue ;
		var new_cat = "\[\["+ gLang.msg("cat") +":" + t + "\]\]" ;
		// Only add if not already present
		if (eb.value.indexOf (new_cat) < 0) eb.value += "\n" + new_cat ;
	}
	return true;
}

function hotcat () {
	JSconfig.registerKey('HotCatDelay', 100, gLang.msg("delay") + ':', 5);

	if ( hotcat_check_action() ) return ; // Edited page, reloading anyway
	if (hotcat_loaded) return; // Guard against double inclusions
	hotcat_loaded = true;
	hotcat_check_upload () ;

	function can_edit ()
	{
		var container = null;
		switch (skin) {
			case 'cologneblue':
				container = document.getElementById ('quickbar');
				// Fall through
			case 'standard':
			case 'nostalgia':
				if (!container) container = document.getElementById ('topbar');
				var lks = container.getElementsByTagName ('a');
				for (var i = 0; i < lks.length; i++) {
					if (   hotcatGetParamValue ('title', lks[i].href) == wgPageName
							&& hotcatGetParamValue ('action', lks[i].href) == 'edit')
						return true;
				}
				return false;
			default:
				// all modern skins:
				return document.getElementById ('ca-edit') != null;
		}
		return false;
	}

	if(    (!can_edit () && !hotcat_upload)           // User has no permission to edit
			|| wgAction != 'view'                         // User is editing or previewing or...
			|| wgNamespaceNumber == -1 && !hotcat_upload) // Special page other than Special:Upload
	return;

	if (!wgIsArticle && !hotcat_upload) return;       // Diff pages...
	// Note that wgIsArticle is also set to true for category, talk, user, etc. pages: anything that
	// can be edited. It is false for diff pages, special pages, and ...

	var visible_cats =
		document.getElementById ('mw-normal-catlinks') ||           // MW 1.13alpha
		getElementsByClassName ( document , "p" , "catlinks" ) [0]; // MW < 1.13 && Special:Upload
	var hidden_cats =
		document.getElementById ('mw-hidden-catlinks');
	if (visible_cats == null) {
		// Insert an empty category line
		var footer = null;
		if (hidden_cats == null) {
			footer = getElementsByClassName (document , "div" , "printfooter")[0];
			if (!footer) return; // Don't know where to insert the category line
		}
		visible_cats = document.createElement ('div');
		visible_cats.setAttribute ('id', 'mw-normal-catlinks');
		var label = document.createElement ('a');
		label.setAttribute ('href', wgArticlePath.replace (/\$1/, 'Special:Categories'));
		label.setAttribute ('title', 'Special:Categories');
		label.appendChild (document.createTextNode ( gLang.msg("cat") ));
		visible_cats.appendChild (label);
		visible_cats.appendChild (document.createTextNode (':'));
		if (hidden_cats == null) {
			var container = document.createElement ('div');
			container.setAttribute ('id', 'catlinks');
			container.className = 'catlinks';
			container.appendChild (visible_cats);
			footer.parentNode.insertBefore (container, footer.nextSibling);
		} else {
			hidden_cats.parentNode.insertBefore (visible_cats, hidden_cats);
			hidden_cats.parentNode.className = 'catlinks';
			hidden_cats.parentNode.style.display = ""; // For good measure, in case this changes again
		}
	} // end if no categories

	visible_cats.style.position = 'relative';
	hotcat_modify_existing ( visible_cats ) ;
	hotcat_append_add_span ( visible_cats ) ;

	// Check for state restoration (Lupo, 2008-02-06)
	if (   hotcat_upload
			&& typeof (UploadForm) != 'undefined'
			&& typeof (UploadForm.previous_hotcat_state) != 'undefined'
			&& UploadForm.previous_hotcat_state != null)
		UploadForm.previous_hotcat_state = hotcat_set_state (UploadForm.previous_hotcat_state);
}

function hotcat_append_add_span ( catline ) {
	var span_add = document.createElement ( "span" ) ;
	if ( catline.getElementsByTagName('span')[0] )
		catline.appendChild (document.createTextNode (" | "));
	else if (catline.firstChild)
		catline.appendChild (document.createTextNode (' '));
	catline.appendChild ( span_add );
	hotcat_create_span ( span_add );
}

String.prototype.ucFirst = function () {
	return this.substr(0,1).toUpperCase() + this.substr(1,this.length);
}

function hotcat_is_on_blacklist ( cat_title ) {
	if ( !cat_title ) return 0 ;
	// cat_title = cat_title.split(":",2).pop() ; // Not needed anymore: we work without 'Category:'
	for ( var i = 0 ; i < hotcat_modify_blacklist.length ; i++ ) {
		if ( cat_title.substr ( 0 , hotcat_modify_blacklist[i].length ) == hotcat_modify_blacklist[i] ) return 1 ;
	}
	return 0 ;
}

function hotcat_modify_span ( span , i ) {
	//var cat_title = span.firstChild.getAttribute ( "title" ) ;
	// This fails with MW 1.13alpha if the category is a redlink, because MW 1.13alpha appends
	// [[MediaWiki:Red-link-title]] to the category name... it also fails if the category name
	// contains "&" (because that is represented by &amp; in the XHTML both in the title and in
	// the link's content (innerHTML). Extract the category name from the href instead:
	var cat_title = null;
	var classes   = span.firstChild.getAttribute ('class');
	if (classes && classes.search (/\bnew\b/) >= 0) {  // href="/w/index.php?title=...&action=edit"
		cat_title = hotcatGetParamValue ('title', span.firstChild.href);
	} else { // href="/wiki/..."
		var re = new RegExp (wgArticlePath.replace (/\$1/, '(.*)'));
		var matches = re.exec (span.firstChild.href);
		if (matches && matches.length > 1)
			cat_title = decodeURIComponent (matches[1]);
		else
			return;
	}
	// Strip namespace, replace _ by blank
	cat_title = cat_title.substring (cat_title.indexOf (':') + 1).replace (/_/g, ' ');

	var sep1 = document.createTextNode ( " " ) ;
	var a1 = document.createTextNode ( "(−)" ) ;
	var remove_link = document.createElement ( "a" ) ;
	// Set the href to a dummy value to make sure we don't move if somehow the onclick handler
	// is bypassed.
	remove_link.href = "#catlinks";
	remove_link.onclick = hotcat_remove;
	remove_link.appendChild ( a1 ) ;
	span.appendChild ( sep1 ) ;
	span.appendChild ( remove_link ) ;

	if ( hotcat_is_on_blacklist ( cat_title ) ) return ;
	var mod_id = "hotcat_modify_" + i ;
	var sep2 = document.createTextNode ( " " ) ;
	var a2 = document.createTextNode ( "(±)" ) ;
	var modify_link = document.createElement ( "a" ) ;
	modify_link.id = mod_id ;
	modify_link.href = "javascript:hotcat_modify(\"" + mod_id + "\");" ;
	modify_link.appendChild ( a2 ) ;
	span.appendChild ( sep2 ) ;
	span.appendChild ( modify_link ) ;
	span.hotcat_name = cat_title; //Store the extracted category name in our own new property of the span DOM node
}

function hotcat_modify_existing ( catline ) {
	var spans = catline.getElementsByTagName ( "span" ) ;
	for ( var i = 0 ; i < spans.length ; i++ ) {
		hotcat_modify_span ( spans[i] , i ) ;
	}
}

function hotcat_getEvt (evt) {
	return evt || window.event || window.Event; // Gecko, IE, Netscape
}

function hotcat_evt2node (evt) {
	var node = null;
	try {
		var e = hotcat_getEvt (evt);
		node = e.target;
		if (!node) node = e.srcElement;
	} catch (ex) {
		node = null;
	}
	return node;
}

function hotcat_evtkeys (evt) {
	var code = 0;
	try {
		var e = hotcat_getEvt (evt);
		if (typeof(e.ctrlKey) != 'undefined') { // All modern browsers
			if (e.ctrlKey)  code |= 1;
			if (e.shiftKey) code |= 2;
		} else if (typeof (e.modifiers) != 'undefined') { // Netscape...
			if (e.modifiers & Event.CONTROL_MASK) code |= 1;
			if (e.modifiers & Event.SHIFT_MASK)   code |= 2;
		}
	} catch (ex) {
	}
	return code;
}

function hotcat_killEvt (evt)
{
	try {
		var e = hotcat_getEvt (evt);
		if (typeof (e.preventDefault) != 'undefined') {
			e.preventDefault ();
			e.stopPropagation ();
		} else
			e.cancelBubble = true;
	} catch (ex) {
	}
}

function hotcat_remove (evt) {
	var node = hotcat_evt2node (evt);
	if (!node) return false;
	// Get the category name from the original link to the category, which is at
	// node.parentNode.firstChild (the DOM structure here is
	// <span><a...>Category</a> <a...>(-)</a>...</span>).
	var cat_title = node.parentNode.hotcat_name;
	if ( hotcat_upload ) {
		hotcat_remove_upload ( cat_title ) ;
		hotcat_killEvt (evt);
		return false;
	}
	var editlk = wgServer + wgScript + '?title=' + encodeURIComponent (wgPageName)
						+ '&action=edit';
	if (hotcat_evtkeys (evt) & 1) // CTRL pressed?
		editlk = editlk + '&hotcat_nocommit=1';
	hotcat_killEvt (evt);
	document.location = editlk + '&hotcat_removecat=' + encodeURIComponent (cat_title);
	return false;
}

function hotcatGetParamValue(paramName, h) {
	if (typeof h == 'undefined' ) { h = document.location.href; }
	var cmdRe=RegExp('[&?]'+paramName+'=([^&]*)');
	var m=cmdRe.exec(h);
	if (m) {
		try {
			return decodeURIComponent(m[1]);
		} catch (someError) {}
	}
	return null;
}

// New. Code by Lupo & Superm401, added by Lupo, 2008-02-27
function hotcat_find_category (wikitext, category)
{
	var cat_name  = category.replace(/([\\\^\$\.\?\*\+\(\)])/g, "\\$1");
	var initial   = cat_name.substr (0, 1);
	// Borislav, 2009-01-19
	var cat_regex = new RegExp ("\\[\\[\\s*(Category|" + gLang.msg("cat") + ")\\s*:\\s*"
		+ (initial == "\\"
			? initial
			: "[" + initial.toUpperCase() + initial.toLowerCase() + "]")
		+ cat_name.substring (1).replace (/[ _]/g, "[ _]")
		+ "\\s*(\\|.*?)?\\]\\]", "gi"
	);
	var result = new Array ();
	var curr_match  = null;
	while ((curr_match = cat_regex.exec (wikitext)) != null) {
		result [result.length] = {match : curr_match};
	}
	return result; // An array containing all matches, with positions, in result[i].match
}

// All redirects to Template:Uncategorized
var hotcat_uncat_regex =
	/\{\{\s*([Uu]ncat(egori[sz]ed( image)?)?|[Nn]ocat|[Nn]eedscategory)[^}]*\}\}/g;

// Rewritten (nearly) from scratch. Lupo, 2008-02-27
function hotcat_check_action () {
	var ret = 0;
	if (wgAction != 'edit') return ret; // Not an edit page, so not our business...
	var summary = new Array () ;
	var t = document.editform.wpTextbox1.value ;
	var prevent_autocommit = 0;
	if (   (typeof hotcat_no_autocommit != "undefined" && hotcat_no_autocommit)
			|| hotcatGetParamValue ('hotcat_nocommit') == '1')
		prevent_autocommit = 1;

	var cat_rm  = hotcatGetParamValue ('hotcat_removecat');
	var cat_add = hotcatGetParamValue ('hotcat_newcat');
	var comment = hotcatGetParamValue ('hotcat_comment') || "";
	var cat_key = hotcatGetParamValue ('hotcat_sortkey');

	if (cat_key != null) cat_key = '|' + cat_key;
	if (cat_rm != null && cat_rm.length > 0) {
		var matches = hotcat_find_category (t, cat_rm);
		if (!matches || matches.length == 0) {
			alert ( gLang.msg("notfound", cat_rm) );
			prevent_autocommit = 1;
		} else if (matches.length > 1) {
			alert ( gLang.msg("multifound", cat_rm) );
			prevent_autocommit = 1;
		} else {
			if (cat_add != null && cat_add.length > 0 && matches[0].match.length > 1)
				cat_key = matches[0].match[1]; // Remember the category key, if any.
			var t1 = t.substring (0, matches[0].match.index);
			var t2 = t.substring (matches[0].match.index + matches[0].match[0].length);
			// Remove whitespace (properly): strip whitespace, but only up to the next line feed.
			// If we then have two linefeeds in a row, remove one. Otherwise, if we have two non-
			// whitespace characters, insert a blank.
			var i = t1.length - 1;
			while (i >= 0 && t1.charAt (i) != '\n' && t1.substr (i, 1).search (/\s/) >= 0) i--;
			var j = 0;
			while (j < t2.length && t2.charAt (j) != '\n' && t1.substr (j, 1).search (/\s/) >= 0) j++;
			if (i >= 0 && t1.charAt (i) == '\n' && j < t2.length && t2.charAt (j) == '\n')
				i--;
			if (i >= 0) t1 = t1.substring (0, i+1); else t1 = "";
			if (j < t2.length) t2 = t2.substring (j); else t2 = "";
			if (t1.length > 0 && t1.substring (t1.length - 1).search (/\S/) >= 0
					&& t2.length > 0 && t2.substr (0, 1).search (/\S/) >= 0)
				t1 = t1 + ' ';
			t = t1 + t2;
			summary.push ( gLang.msg("rmdcat", cat_rm) ) ;
			ret = 1;
		}
	}
	if (cat_add != null && cat_add.length > 0) {
		var matches = hotcat_find_category (t, cat_add);
		if (matches && matches.length > 0) {
			alert ( gLang.msg("catexists", cat_add) );
			prevent_autocommit = 1;
		} else {
			if (t.charAt (t.length - 1) != '\n') t = t + '\n';
			t = t + '\[\['+gLang.msg("cat")+':' + cat_add + (cat_key != null ? cat_key : "") + '\]\]\n';
			summary.push ( glang("quickcomment", cat_add, comment) );
			var t2 = t.replace(hotcat_uncat_regex, ""); // Remove "uncat" templates
			if (t2.length != t.length) {
				t = t2;
				summary.push ( gLang.msg("rmduncat") ) ;
			}
			ret = 1;
		}
	}
	if (ret) {
		document.editform.wpTextbox1.value = t ;
		document.editform.wpSummary.value = summary.join( "; " )
			+ " (" + gLang.msg("using") + ")" ;
		document.editform.wpMinoredit.checked = true ;
		if (!prevent_autocommit) {
			// Hide the entire edit section so as not to tempt the user into editing...
			var content = document.getElementById ("bodyContent")// "monobook" skin
				|| document.getElementById ("mw_contentholder")  // "modern" skin
				|| document.getElementById ("article");          // classic skins
			if (content) content.style.display = "none" ;
			document.editform.submit ();
		}
	}
	return ret;
}

function hotcat_clear_span ( span_add ) {
	while ( span_add.firstChild ) span_add.removeChild ( span_add.firstChild ) ;
}

function hotcat_create_span ( span_add ) {
	hotcat_clear_span ( span_add ) ;
	var a_add = document.createElement ( "a" ) ;
	var a_text = document.createTextNode ( "(+)" ) ;
	span_add.id = "hotcat_add" ;
	a_add.href = "javascript:hotcat_add_new()" ;
	a_add.appendChild ( a_text ) ;
	span_add.appendChild ( a_add ) ;
}

function hotcat_modify ( link_id ) {
	var link = document.getElementById ( link_id ) ;
	var span = link.parentNode ;
	var catname = span.hotcat_name;

	while ( span.firstChild.nextSibling ) span.removeChild ( span.firstChild.nextSibling ) ;
	span.firstChild.style.display = "none" ;
	hotcat_create_new_span ( span , catname ) ;
	hotcat_last_v = "" ;
	hotcat_text_changed () ; // Update icon
}

function hotcat_add_new () {
	var span_add = document.getElementById ( "hotcat_add" ) ;
	hotcat_clear_span ( span_add ) ;
	hotcat_last_v = "" ;
	hotcat_create_new_span ( span_add , "" ) ;
}

function hotcat_button_label (id, defaultText)
{
	var label = null;
	if (hotcat_upload
			&& typeof (UFUI) != 'undefined'
			&& typeof (UFUI.getLabel) == 'function'
	) {
		try {
			label = UFUI.getLabel (id, true);
			// Extract the plain text. IE doesn't know that Node.TEXT_NODE == 3
			while (label && label.nodeType != 3) label = label.firstChild;
		} catch (ex) {
			label = null;
		}
	}
	if (label == null || !label.data) return defaultText;
	return label.data;
}

function hotcat_create_new_span ( thespan , init_text ) {
	var form = document.createElement ( "form" ) ;
	form.method = "post" ;
	form.onsubmit = function () { hotcat_ok(); return false; } ;
	form.id = "hotcat_form" ;
	form.style.display = "inline" ;

	var list = null;

	if (!hotcat_nosuggestions) {
		// Only do this if we may actually use XMLHttp...
		list = document.createElement ( "select" ) ;
		list.id = "hotcat_list" ;
		list.onclick = function () {
			var l = document.getElementById("hotcat_list");
			if (l != null)
				document.getElementById("hotcat_text").value = l.options[l.selectedIndex].text;
			hotcat_text_changed();
		};
		list.ondblclick = function (evt) {
			var l = document.getElementById("hotcat_list");
			if (l != null)
				document.getElementById("hotcat_text").value = l.options[l.selectedIndex].text;
			// Don't call text_changed here if on upload form: hotcat_ok will remove the list
			// anyway, so we must not ask for new suggestions since show_suggestions might
			// raise an exception if it tried to show a no longer existing list.
			// Lupo, 2008-01-20
			if (!hotcat_upload) hotcat_text_changed();
			hotcat_ok(hotcat_evtkeys (evt) & 1); // CTRL pressed?
		};
		list.style.display = "none" ;
	}

	var text = document.createElement ( "input" ) ;
	text.size = 40 ;
	text.id = "hotcat_text" ;
	text.type = "text" ;
	text.value = init_text ;
	text.onkeyup = function () { window.setTimeout("hotcat_text_changed();", JSconfig.keys['HotCatDelay'] ); } ;

	var exists = null;
	if (!hotcat_nosuggestions) {
		exists = document.createElement ( "img" ) ;
		exists.id = "hotcat_exists" ;
		exists.src = hotcat_exists_no ;
	}

	var OK = document.createElement ( "input" ) ;
	OK.type = "button" ;
	OK.value = hotcat_button_label ('wpOkUploadLbl', 'OK') ;
	OK.onclick = function (evt) { hotcat_ok (hotcat_evtkeys (evt) & 1); };

	var cancel = document.createElement ( "input" ) ;
	cancel.type = "button" ;
	cancel.value = hotcat_button_label ('wpCancelUploadLbl', 'Cancel') ;
	cancel.onclick = hotcat_cancel ;

	if (list != null) form.appendChild ( list ) ;
	form.appendChild ( text ) ;
	if (exists != null) form.appendChild ( exists ) ;
	form.appendChild ( OK ) ;
	form.appendChild ( cancel ) ;
	thespan.appendChild ( form ) ;
	text.focus () ;
}

function hotcat_ok (nocommit) {
	var text = document.getElementById ( "hotcat_text" ) ;
	var v = text.value || "";
	v = v.replace(/_/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // Trim leading and trailing blanks

	// Empty category ?
	if (!v) {
		hotcat_cancel() ;
		return ;
	}

	// Get the links and the categories of the chosen category page
	var url = wgServer + wgScriptPath + '/api.php?action=query&titles='
		+ encodeURIComponent ('Category:' + v)
		+ '&prop=info|links|categories&plnamespace=14&format=json&callback=hotcat_json_resolve';
	var request = sajax_init_object() ;
	if (request == null) {
		//Oops! We don't have XMLHttp...
		hotcat_nosuggestions = true;
		hotcat_closeform (nocommit);
		hotcat_running = 0;
		return;
	}
	request.open ('GET', url, true);
	request.onreadystatechange =
		function () {
			if (request.readyState != 4) return;
			if (request.status != 200) {
				hotcat_closeform (nocommit);
			} else {
				var do_submit = eval (request.responseText);
				var txt = document.getElementById ('hotcat_text');
				if (do_submit) {
					hotcat_closeform (
						nocommit,
						(txt && txt.value != v)
							? " " + gLang.msg("redirresolved", v)
							: null
					);
				}
			}
		};
	request.setRequestHeader ('Pragma', 'cache=yes');
	request.setRequestHeader ('Cache-Control', 'no-transform');
	request.send (null);
}

function hotcat_json_resolve (params)
{
	function resolve (page)
	{
		var cats     = page.categories;
		var is_dab   = false;
		var is_redir = typeof (page.redirect) == 'string'; // Hard redirect?
		if (!is_redir && cats) {
			for (var c = 0; c < cats.length; c++) {
				var cat = cats[c]["title"];
				if (cat) cat = cat.substring (cat.indexOf (':') + 1); // Strip namespace prefix
				// TODO Localise
				if (cat == 'Disambiguation') {
					is_dab = true; break;
				} else if (cat == 'Category_redirects' || cat == 'Category redirects') {
					is_redir = true; break;
				}
			}
		}
		if (!is_redir && !is_dab) return true;
		var lks = page.links;
		var titles = new Array ();
		for (i = 0; i < lks.length; i++) {
			if (   lks[i]["ns"] == 14                               // Category namespace
					&& lks[i]["title"] && lks[i]["title"].length > 0 // Name not empty
			) {
				// Internal link to existing thingy. Extract the page name.
				var match = lks[i]["title"];
				// Remove the category prefix
				match = match.substring (match.indexOf (':') + 1);
				titles.push (match);
				if (is_redir) break;
			}
		}
		if (titles.length > 1) {
			// Disambiguation page
			hotcat_show_suggestions (titles);
			return false;
		} else if (titles.length == 1) {
			var text = document.getElementById ("hotcat_text");
			if (text) text.value = titles[0];
		}
		return true;
	} // end local function resolve

	// We should have at most one page here
	for (var page in params.query.pages) return resolve (params.query.pages[page]);
	return true; // In case we have none.
}

function hotcat_closeform (nocommit, comment)
{
	var text = document.getElementById ( "hotcat_text" ) ;
	var v = text.value || "";
	v = v.replace(/_/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // Trim leading and trailing blanks
	if (!v                                                 // Empty
			|| wgNamespaceNumber == 14 && v == wgTitle         // Self-reference
			|| text.parentNode.parentNode.id != 'hotcat_add'   // Modifying, but
				&& text.parentNode.parentNode.hotcat_name == v //   name unchanged
	) {
		hotcat_cancel ();
		return;
	}

	if (hotcat_upload) {
		hotcat_just_add (v) ; // Close the form
		return ;
	}
	var editlk = wgServer + wgScript + '?title=' + encodeURIComponent (wgPageName)
						+ '&action=edit';
	var url = editlk + '&hotcat_newcat=' + encodeURIComponent( v ) ;

	// Editing existing?
	var span = text.parentNode.parentNode ; // span.form.text
	if ( span.id != "hotcat_add" ) { // Not plain "addition"
		url += '&hotcat_removecat=' + encodeURIComponent (span.hotcat_name);
	}
	if (nocommit) url = url + '&hotcat_nocommit=1';
	if (comment) url = url + '&hotcat_comment=' + encodeURIComponent (comment);
	// Make the list disappear:
	var list = document.getElementById ( "hotcat_list" ) ;
	if (list) list.style.display = 'none';

	document.location = url ;
}

function hotcat_just_add ( text ) {
	var span = document.getElementById("hotcat_form") ;
	while ( span.tagName != "SPAN" ) span = span.parentNode ;
	var add = 0 ;
	if ( span.id == "hotcat_add" ) add = 1 ;
	span.id = "" ;
	while ( span.firstChild ) span.removeChild ( span.firstChild ) ;
	var na = document.createElement ( "a" ) ;
	na.href = wgArticlePath.split("$1").join("Category:" + encodeURI (text)) ;
	na.appendChild ( document.createTextNode ( text ) ) ;
	na.setAttribute ( "title" , gLang.msg("cat") + ":" + text ) ;
	span.appendChild ( na ) ;
	var catline = getElementsByClassName ( document , "p" , "catlinks" ) [0] ;
	if ( add ) hotcat_append_add_span ( catline ) ;

	for ( var i = 0 ; i < span.parentNode.childNodes.length ; i++ ) {
		if ( span.parentNode.childNodes[i] != span ) continue ;
		hotcat_modify_span ( span , i ) ;
		break ;
	}
}

function hotcat_cancel () {
	var span = document.getElementById("hotcat_form").parentNode ;
	if ( span.id == "hotcat_add" ) {
		hotcat_create_span ( span ) ;
	} else {
		while ( span.firstChild.nextSibling ) span.removeChild ( span.firstChild.nextSibling ) ;
		span.firstChild.style.display = "" ;
		for ( var i = 0 ; i < span.parentNode.childNodes.length ; i++ ) {
			if ( span.parentNode.childNodes[i] != span ) continue ;
			hotcat_modify_span ( span , i ) ;
			break ;
		}
	}
}

function hotcat_text_changed () {
	if ( hotcat_running ) return ;
	var text = document.getElementById ( "hotcat_text" ) ;
	var v = text.value.ucFirst() ;
	if ( hotcat_last_v == v ) return ; // Nothing's changed...

	if (hotcat_nosuggestions) {
		// On IE, XMLHttp uses ActiveX, and the user may deny execution... just make sure
		// the list is not displayed.
		var list = document.getElementById ('hotcat_list');
		if (list != null) list.style.display = "none" ;
		var exists = document.getElementById ('hotcat_exists');
		if (exists != null) exists.style.display = "none" ;
		return;
	}

	hotcat_running = 1 ;
	hotcat_last_v = v ;

	if ( v != "" ) {
		var url = wgServer + wgScriptPath
			+ "/api.php?format=xml&action=query&list=allpages&apnamespace=14&apfrom="
			+ encodeURIComponent( v ) ;
		var request = sajax_init_object() ;
		if (request == null) {
			//Oops! We don't have XMLHttp...
			hotcat_nosuggestions = true;
			var list = document.getElementById ('hotcat_list');
			if (list != null) list.style.display = "none" ;
			var exists = document.getElementById ('hotcat_exists');
			if (exists != null) exists.style.display = "none" ;
			hotcat_running = 0;
			return;
		}
		request.open('GET', url, true);
		request.onreadystatechange = function () {
			if (request.readyState == 4) {
				var xml = request.responseXML ;
				if ( xml == null ) return ;
				var pages = xml.getElementsByTagName( "p" ) ; // results are *with* namespace here
				var titles = new Array () ;
				for ( var i = 0 ; i < pages.length ; i++ ) {
					// Remove the namespace. No hardcoding of 'Category:', please, other Wikis may have
					// local names ("Kategorie:" on de-WP, for instance). Also don't break on category
					// names containing a colon
					var s = pages[i].getAttribute("title");
					s = s.substring (s.indexOf (':') + 1);
					if ( s.substr ( 0 , hotcat_last_v.length ) != hotcat_last_v ) break ;
					titles.push ( s ) ;
				}
				hotcat_show_suggestions ( titles ) ;
			}
		};
		request.setRequestHeader ('Pragma', 'cache=yes');
		request.setRequestHeader ('Cache-Control', 'no-transform');
		request.send(null);
	} else {
		hotcat_show_suggestions ( new Array () ) ;
	}
	hotcat_running = 0 ;
}

function hotcat_show_suggestions ( titles ) {
	var text = document.getElementById ( "hotcat_text" ) ;
	var list = document.getElementById ( "hotcat_list" ) ;
	var icon = document.getElementById ( "hotcat_exists" ) ;
	// Somehow, after a double click on the selection list, we still get here in IE, but
	// the list may no longer exist... Lupo, 2008-01-20
	if (list == null) return;
	if (hotcat_nosuggestions) {
		list.style.display = "none" ;
		if (icon != null) icon.style.display = "none";
		return;
	}
	if ( titles.length == 0 ) {
		list.style.display = "none" ;
		icon.src = hotcat_exists_no ;
		return ;
	}

	// Set list size to minimum of 5 and actual number of titles. Formerly was just 5.
	// Lupo, 2008-01-20
	list.size = (titles.length > 5 ? 5 : titles.length) ;
	// Avoid list height 1: double-click doesn't work in FF. Lupo, 2008-02-27
	if (list.size == 1) list.size = 2;
	list.style.align = "left" ;
	list.style.zIndex = 5 ;
	list.style.position = "absolute" ;

	// Was listh = titles.length * 20: that makes no sense if titles.length > list.size
	// Lupo, 2008-01-20
	var listh = list.size * 20;
	var nl = parseInt (text.offsetLeft) - 1 ;
	var nt = parseInt (text.offsetTop) - listh ;
	if (skin == 'nostalgia' || skin == 'cologneblue' || skin == 'standard') {
		// These three skins have the category line at the top of the page. Make the suggestions
		// appear *below* out input field.
		nt = parseInt (text.offsetTop) + parseInt (text.offsetHeight) + 3;
	}
	list.style.top = nt + "px" ;
	list.style.width = text.offsetWidth + "px" ;
	list.style.height = listh + "px" ;
	list.style.left = nl + "px" ;
	while ( list.firstChild ) list.removeChild ( list.firstChild ) ;
	for ( var i = 0 ; i < titles.length ; i++ ) {
		var opt = document.createElement ( "option" ) ;
		var ot = document.createTextNode ( titles[i] ) ;
		opt.appendChild ( ot ) ;
		//opt.value = titles[i] ;
		list.appendChild ( opt ) ;
	}

	icon.src = hotcat_exists_yes ;

	var nof_titles = titles.length;

	var first_title = titles.shift () ;
	var v = text.value.ucFirst() ;
	text.focus ();
	if ( first_title == v ) {
		if (nof_titles == 1) {
			// Only one result, and it's the same as whatever is in the input box: makes no sense
			// to show the list.
			list.style.display = 'none';
		}
		return ;
	}

	list.style.display = "block" ;

	// Put the first entry of the title list into the text field, and select the
	// new suffix such that it'll be overwritten if the user keeps typing.
	// ONLY do this if we have a way to select parts of the content of a text
	// field, otherwise, this is very annoying for the user. Note: IE does it
	// again differently from the two versions previously implemented.
	// Lupo, 2008-01-20
	// Only put first entry into the list if the user hasn't typed something
	// conflicting yet Dschwen 2008-02-18
	if ( ( text.setSelectionRange
				|| text.createTextRange
				|| typeof (text.selectionStart) != 'undefined'
				&& typeof (text.selectionEnd) != 'undefined' )
			&& v == first_title.substr(0,v.length)
	) {
		// taking hotcat_last_v was a major annoyance,
		// since it constantly killed text that was typed in
		// _since_ the last AJAX request was fired! Dschwen 2008-02-18
		var nosel = v.length ;

		text.value = first_title ;

		if (text.setSelectionRange)      // e.g. khtml
			text.setSelectionRange (nosel, first_title.length);
		else if (text.createTextRange) { // IE
			var new_selection = text.createTextRange();
			new_selection.move ("character", nosel);
			new_selection.moveEnd ("character", first_title.length - nosel);
			new_selection.select();
		} else {
			text.selectionStart = nosel;
			text.selectionEnd   = first_title.length;
		}
	}
}

function hotcat_get_state ()
{
	var cats = document.getElementById ('catlinks');
	if (cats == null) return "";
	var result = null;
	cats = cats.getElementsByTagName ('span') ;
	for (var i = 0; i < cats.length; i++ ) {
		var text = cats[i].hotcat_name;
		if (text) {
			if (result == null)
				result = text;
			else
				result = result + '\n' + text;
		}
	}
	return result;
}

function hotcat_set_state (state)
{
	var cats = state.split ('\n');
	if (cats.length == 0) return null;
	var parent = document.getElementById ('catlinks');
	if (parent == null) return state;
	// HotCat uses a 'p' element inside the 'div' to wrap its spans...
	parent = parent.firstChild;
	if (parent == null || parent.className != 'catlinks') return state;
	var n = (parent.childNodes ? parent.childNodes.length - 1 : 0);
	if (n < 0) n = 0;
	var before = parent.lastChild;
	for (var i = 0; i < cats.length; i++) {
		if (cats[i].length > 0) {
			var lk = document.createElement ('a');
			lk.href = wgArticlePath.split ('$1').join ('Category:' + encodeURI (cats[i]));
			lk.appendChild (document.createTextNode (cats[i]));
			lk.setAttribute ('title', cats[i]);
			var span = document.createElement ('span');
			span.appendChild (lk);
			parent.insertBefore (span, before);
			if (before != null) parent.insertBefore (document.createTextNode (' | '), before);
			hotcat_modify_span (span, n++);
		}
	}
	return null;
}

hotcat();

});