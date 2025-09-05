/**
 * ProveIt is a reference manager for Wikipedia and any other MediaWiki wiki
 * Documentation: https://www.mediawiki.org/wiki/ProveIt
 * Source code: https://www.mediawiki.org/wiki/MediaWiki:Gadget-Global-ProveIt.js
 */
function loadProveIt() {
	mw.config.set( {

		// Local citation templates (without namespace)
		'proveit-templates': [
			'Cite book',
			'Цитат книга',
			'Cite web',
			'Цитат уеб',
			'Cite journal',
			'Cite news'
		],

		// Supported namespaces, see https://www.mediawiki.org/wiki/Manual:Namespace_constants
		'proveit-namespaces': [ 0, 2 ],

		// Revision tag defined at Special:Tags (optional)
		'proveit-tag': 'Редакция с ProveIt',

		// Automatic edit summary (optional)
		'proveit-summary': 'Източник редактиран с ProveIt',
	} );

	// Load from the central, global version at MediaWiki.org
	mw.loader.load( '//www.mediawiki.org/w/load.php?modules=ext.gadget.Global-ProveIt' );
}

// Only load when editing
mw.hook( 'wikipage.editform' ).add( editForm => window.ProveIt || loadProveIt() );
mw.hook( 've.newTarget' ).add( target => target.constructor.static.name === 'article' && target.on( 'surfaceReady', loadProveIt ) );
