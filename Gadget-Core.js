function importOuterScript( page, wiki ) {
	// if 'wiki' is a URL, use it, otherwise assume it's a WMF project name, e.g. 'en'
	// we now also widely use HTTPS and schema-less URLs are pretty common too
	var server = wiki.match(/^(http(s)?:)?\/\//)
		? wiki
		: '//' + wiki + '.wikipedia.org/w';
	document.write('<script type="text/javascript" src="'
		+ server + '/index.php?title='
		+ encodeURIComponent( page.replace( / /g, '_' ) )
		+ '&action=raw&ctype=text/javascript"></scr'+'ipt>');
}