/**
 * ProveIt is a powerful reference manager for Wikipedia
 * Documentation at https://commons.wikimedia.org/wiki/Help:Gadget-ProveIt
 *
 * This script sets the configuration options specific to this wiki
 * and loads the gadget code from Wikimedia Commons
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
