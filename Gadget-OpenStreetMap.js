mw.loader.using( [ 'mediawiki.util' ], function() { $( function() {
	var c = $( '#coordinates' );
	if ( !c.length ) {
		return;
	}

	var a = c.find( 'a' );
	var geohack = false;
	for (var i = 0; i < a.length; i++) {
		var h = a[i].href;
		if (!h.match(/geohack/)) continue;
		if (h.match(/skyhack/)) continue;
		if (h.match(/_globe:/)) continue; // no OSM for moon, mars, etc
		geohack = true;
		break;
	}
	if ( !geohack ) {
		return;
	}

	var separator = $( document.createElement( 'span' ) );
	separator.text( ' | ' );
	separator.attr( 'class', 'noprint coordinates-separator' );
	c.append( separator );
	var img = $( document.createElement( 'img' ) );
	img.attr( {
		'src': '//upload.wikimedia.org/wikipedia/commons/thumb/c/c9/OpenStreetMapLogo.png/17px-OpenStreetMapLogo.png',
		'width': '17px',
		'height': '17px'
	} );
	var a = $( document.createElement( 'a' ) );
	a.attr( {
		'href': '#',
		'title': 'Показване на координатите на карта от OpenStreetMap',
		'class': 'noprint osm-icon-coordinates'
	} );
	a.click( function () {
		var c = $( '#coordinates' );
		if ( !c.length) {
			return;
		}
		var cs = $( '#contentSub' );
		var osm = $( '#openstreetmap' );
	
		if ( cs.length && osm.length ) {
			if ( osm.css( 'display' ) === 'none' ) {
				osm.css( 'display', 'block' );
			} else {
				osm.css( 'display', 'none' );
			}
			return false;
		}
	
		var found_link = false;
		var a = c.find( 'a' );
		var h;
		for (var i = 0; i < a.length; i++) {
			h = a[i].href;
			if (!h.match(/geohack/)) continue;
			found_link = true;
			break;
		}
		if ( !found_link ) {
			return; // No geohack link found
		}
	
		h = h.split('params=')[1];
	
		var url = '//tools.wmflabs.org/wiwosm/osm-on-ol/kml-on-ol.php?'
			+ 'lang=' + mw.config.get('wgUserLanguage')
			+ '&params=' + h
			+ '&title=' + mw.util.wikiUrlencode( mw.config.get( 'wgTitle' ) )
			+ ( window.location.protocol == 'https:' ? '&secure=1' : '' ) ;
	
		var iframe = $( document.createElement( 'iframe' ) );
		iframe.attr( 'id', 'openstreetmap' );
		iframe.css({
			'width': '100%',
			'height': '350px',
			'clear': 'both'
		});
		iframe.attr( 'src', url );
		cs.append( iframe );
		return false;
	});
	a.append( img );
	c.append( a );
})});