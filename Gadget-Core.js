function importOuterScript( page, wiki ) {
	document.write('<script type="text/javascript" src="'
		+ 'http://' + wiki + '.wikipedia.org/w/index.php?title='
		+ encodeURIComponent( page.replace( / /g, '_' ) )
		+ '&action=raw&ctype=text/javascript"></scr'+'ipt>');
}