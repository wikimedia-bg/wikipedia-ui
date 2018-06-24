/**
 * Extends the functionality of an inputbox in a div.mwbot element.
 * Appends { { MAINPAGE/SUBPAGE } } to MAINPAGE upon creation of MAINPAGE/SUBPAGE
 */
var Memory = {
	memoryTtl: 86400, // last this many seconds
	allowedActions: ["transcludeSubpage"],
	delim1: "::",
	delim2: ";;",

	memorize: function(jsAction, jsArgs, mwPage, mwAction) {
		mw.cookie.set(
			Memory.getCookieName(mwPage, mwAction),
			jsAction + Memory.delim1 + jsArgs.join(Memory.delim2),
			new Date(Date.now() + Memory.memoryTtl*1000));
	},

	executeCurrentAction: function() {
		var cookieName = Memory.getCookieName(mw.config.get('wgPageName'), mw.config.get('wgAction'));
		var rawData = mw.cookie.get(cookieName);
		if (rawData) {
			mw.cookie.set(cookieName, null);
			var p = rawData.split(Memory.delim1);
			if ( $.inArray(p[0], Memory.allowedActions) !== -1 ) {
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
		attachMemorizer(this, false);
	});
	$('.mwbot-root').find('form[name="createbox"]').each(function() {
		attachMemorizer(this, true);
	});
}

function attachMemorizer(form, mainIsRoot) {
	var mainpage;
	var subpath = '';
	if (mainIsRoot) {
		var titleElements = form.title.value.split('/');
		mainpage = titleElements[0];
		subpath = (titleElements.length > 2) ?
			titleElements.slice(1, -1).join('/') + '/' :
			'';
	} else {
		mainpage = form.title.value.replace(/\/+$/g, '');
	}
	if ( mainpage == "" ) {
		mainpage = mw.config.get('wgPageName');
	}
	form.title.value = "";
	jQuery(form).submit(function() {
		if ( $.trim(this.title.value) == "" ) {
			alert( mw.msg("ta-emptyfield") );
			return false;
		}
		var subpage = this.title.value;
		var prefix = mainpage + "/" + subpath;
		var prefindex = subpage.indexOf(prefix);
		if ( prefindex == 0 ) { // the prefix is already there, remove it
			subpage = subpage.substr(prefix.length);
		}
		var fullpage = prefix + subpage;
		this.title.value = fullpage;
		// allow summary prefilling by new section
		$('<input>', {type: 'hidden', name: "preloadtitle", value: subpath + subpage}).appendTo(this);
		Memory.memorize("transcludeSubpage",
			[mainpage, subpath, subpage],
			fullpage.replace(/ /g, "_"), "view");
		return true;
	});
}

function transcludeSubpage(mainpage, subpath, subpage) {
	// subpath is okay to be empty.
	if ( $.trim(mainpage) == "" || $.trim(subpage) == "" ) {
		return;
	}
	var api = new mw.Api();
	var fullpage = mainpage + "/" + subpath + subpage;
	api.postWithToken("edit", {
		action: "edit",
		title: mainpage,
		summary: mw.msg("ta-summary", fullpage),
		appendtext: "\n{"+"{" + fullpage + "}}"
	});
}

$( function( $ ) {
	attachMemorizers();
	$(".done-by-script").hide();
	$(".showme").show();
	Memory.executeCurrentAction();
} );