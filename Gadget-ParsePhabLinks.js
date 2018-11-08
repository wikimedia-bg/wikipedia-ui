( function( $, mw, undefined ) {
	if (
		mw.config.get( 'wgAction' ) !== 'history' ||
		$.inArray( mw.config.get( 'wgCanonicalNamespace' ), [ 'MediaWiki', 'Module' ] ) === -1
	) return;
	$( function() {
		$.each( $( 'ul#pagehistory > li' ), function() {
			if ( $( this ).find( 'a.mw-userlink' ).text() === 'JSS 9' ) {
				var $comment = $( this ).find( 'span.comment' );
				if ( $comment.html() ) {
					var commentOldHtml = $comment.html().split( '|' );
					// commentOldHtml[2] includes the span.comment closing parenthesis,
					// hence why we discard it by slice() and re-add it after </a>.
					$comment.html(
						$.trim( commentOldHtml[0] ) +
						': <a href="' +
						$.trim( commentOldHtml[1] ) +
						'" target="_blank">' +
						$.trim( commentOldHtml[2] ).slice( 0, -1 ) +
						'</a>)'
					);
				}
			}
		} );
	} );
} )( jQuery, mediaWiki );

// vim: ts=4 sts=4 sw=4 noet:
