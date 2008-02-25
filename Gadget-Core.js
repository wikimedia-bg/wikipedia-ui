function importOuterScript( page, wiki ) {
	var server = wiki.indexOf('http://') == -1
		? 'http://' + wiki + '.wikipedia.org/w'
		: wiki;
	document.write('<script type="text/javascript" src="'
		+ server + '/index.php?title='
		+ encodeURIComponent( page.replace( / /g, '_' ) )
		+ '&action=raw&ctype=text/javascript"></scr'+'ipt>');
}

importScript("МедияУики:JSconfig.js");