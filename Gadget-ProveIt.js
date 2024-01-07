/**
 * ProveIt is a reference manager for Wikipedia and any other MediaWiki wiki
 * Documentation at https://www.mediawiki.org/wiki/ProveIt
 *
 * This initialization script sets the configuration options specific to this wiki
 * and then loads the ProveIt code directly from MediaWiki.org
 */
function loadProveIt() {
	mw.config.set({
		'proveit-tag': 'Редакция с ProveIt', // Revision tag defined at Special:Tags (optional)
		'proveit-summary': 'Източник редактиран с ProveIt', // Automatic edit summary (optional)
		'proveit-templates': [ // Citation templates (without namespace)
			'Cite book',
			'Цитат книга',
			'Cite web',
			'Цитат уеб',
			'Cite journal',
			'Cite news'
		],
		'proveit-namespaces': [ // Supported namespaces (see https://www.mediawiki.org/wiki/Manual:Namespace_constants)
			0, // Main namespace
			2, // User namespace
		]
	});
	mw.loader.load( '//www.mediawiki.org/w/load.php?modules=ext.gadget.ProveIt&only=scripts' );
	mw.loader.load( '//www.mediawiki.org/w/load.php?modules=ext.gadget.ProveIt&only=styles', 'text/css' );
}

// Only load when editing
mw.hook( 'wikipage.editform' ).add( loadProveIt );
mw.hook( 've.activationComplete' ).add( loadProveIt );
