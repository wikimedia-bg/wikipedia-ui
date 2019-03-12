( function () {
	if ( window.location.pathname.startsWith( '/wiki//' ) ) {
		window.location.replace( window.location.toString().replace( '/wiki//', '/wiki/' ) );
	}
} )();

// vim: ts=4 sts=4 sw=4 tw=100 noet:
