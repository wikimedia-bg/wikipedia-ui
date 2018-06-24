( function ( $ ) {
	'use strict';
	$( function () {
		$( '.switcher-container' ).each( function ( i ) {
			var activeElement, $showRadio, $showAllRadio;
			var elements = [], container = this;
			var radioName = 'switcher-' + i;
			$( this ).children().each( function () {
				var self = this;
				var $labelContainer = $( this ).find( '.switcher-label' );
				var $labelText = $labelContainer.contents();
				if ( !$labelText.length ) {
					return;
				}
				elements.push( this );
				$showRadio = $( '<input type="radio" />' ).attr( 'name', radioName ).click( function () {
					$( activeElement ).hide();
					$( self ).show();
					activeElement = self;
				} );
				$( '<label style="display:block"></label>' ).append( $showRadio ).append( $labelText ).appendTo( container );
				if ( !activeElement ) {
					activeElement = this;
					$showRadio.prop( 'checked', true );
				} else if ( $labelContainer.is( '[data-switcher-default]' ) ) { 
					$showRadio.click();
				} else {
					$( this ).hide();
				}
				$labelContainer.remove();
			} );
			if ( elements.length > 1 ) {
				$showAllRadio = $( '<input type="radio" />' ).attr( 'name', radioName ).click( function () {
					$( elements ).show();
					activeElement = elements;
				} );
				$( '<label style="display:block">Show all</label>' ).prepend( $showAllRadio ).appendTo( container );
			} else if ( elements.length === 1 ) {
				$showRadio.remove();
			}
		} );
	} );
} )( jQuery );