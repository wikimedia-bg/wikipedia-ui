function parsePhabLinks() {
	var $jss9Comments =
	// The method of selecting only and all JSS 9's comments depends on the page we're on.
		( mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Contributions' ) ?
	// If this is the page with JSS 9's contributions, simply select all span.comments on it.
			$( 'span.comment' ) :
	// Elsewhere first get the <a> elements that link to JSS 9's user page.  They are part of the
	// rev or diff we need. To get the comment itself, go up two nodes and find a span.comment
	// descendant (there should be only one).  The type of those parent elements varies with the
	// page we are processing, but going up two nodes works universally, which is why we use the
	// somewhat clumsy double parent(), instead of e.g. closest().
			$( 'a.mw-userlink' )
				.filter( function() { return $( this ).text() === 'JSS 9'; } )
				.parent().parent().find( 'span.comment' );
	// Process each of the selected span.comment elements.
	$.each( $jss9Comments, function() {
			if ( $( this ).html() ) {
				var oldHtml = $( this ).html().split( '|' );
				// oldHtml[2] includes the span.comment closing parenthesis, which we do not want to
				// include in the link itself. Discard it by slice() and re-add it after the </a>.
				$( this ).html(
					$.trim( oldHtml[0] ) +
					': <a href="' +
					$.trim( oldHtml[1] ) +
					'" target="_blank">' +
					$.trim( oldHtml[2] ).slice( 0, -1 ) +
					'</a>)'
				);
			}
		}
	);
}

( function( $, mw, undefined ) {
	// Parse the links only if...
	if (
		// ...this is Special:Recentchanges or Special:Watchlist...
		$.inArray(
			mw.config.get( 'wgCanonicalSpecialPageName' ),
			[ 'Recentchanges', 'Watchlist' ]
		) !== -1 ||
		// ...OR if this is Special:Contributions/JSS 9...
		(
			mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Contributions' &&
			mw.config.get( 'wgRelevantUserName' ) === 'JSS 9'
		) ||
		// ...OR if this is...
		(
			// ...a page in MediaWiki or Module namespace...
			$.inArray(
				mw.config.get( 'wgCanonicalNamespace' ),
				[ 'MediaWiki', 'Module' ]
			) !== -1 &&
			// ...AND we are looking at its history or a diff link.
			(
				mw.config.get( 'wgDiffOldId' ) !== null ||
				mw.config.get( 'wgAction' ) === 'history'
			)
		)
	) $( parsePhabLinks() );
} )( jQuery, mediaWiki );

// vim: ts=4 sts=4 sw=4 tw=100 noet:
