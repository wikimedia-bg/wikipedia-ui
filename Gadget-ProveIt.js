/**
 * ProveIt is a powerful reference manager for Wikipedia
 * Documentation at https://commons.wikimedia.org/wiki/Help:Gadget-ProveIt
 *
 * The gadget code is loaded directly from Wikimedia Commons
 * This code is just the loader with some checks to minimize requests
 * and the configuration options specific to this wiki
 */

// Only load on some namespaces
var namespace = mw.config.get( 'wgNamespaceNumber' );
if ( namespace === 0 || namespace === 2 ) {

	// Only load on wikitext pages (and not in common.js or common.css, for example)
	var contentModel = mw.config.get( 'wgPageContentModel' );
	if ( contentModel === 'wikitext' ) {

		// Only load on wikitext editors
		mw.hook( 'wikipage.editform' ).add( loadProveIt );
		mw.hook( 've.activationComplete' ).add( function () {
		    $( '#proveit' ).remove();
			if ( ve.init.target.getSurface().getMode() === 'source' ) {
				loadProveIt();
			}
		});
		mw.hook( 've.deactivationComplete' ).add( function () {
			$( '#proveit' ).remove();
		});
	}
}

function loadProveIt() {
	mw.config.set({
		'proveit-tag': 'Редакция с ProveIt', // Revision tag defined at Special:Tags (optional)
		'proveit-summary': 'Източник редактиран с ProveIt', // Automatic edit summary (optional)
		'proveit-templates': [ // Citation templates with template data (recommended)
			'Шаблон:Cite book',
			'Шаблон:Цитат книга',
			'Шаблон:Cite web',
			'Шаблон:Цитат уеб',
			'Шаблон:Cite journal',
			'Шаблон:Cite news'
		]
	});
	mw.loader.load( 'https://commons.wikimedia.org/w/index.php?title=MediaWiki:Gadget-ProveIt2.js&action=raw&ctype=text/javascript' );
	mw.loader.load( 'https://commons.wikimedia.org/w/index.php?title=MediaWiki:Gadget-ProveIt2.css&action=raw&ctype=text/css', 'text/css' );
}
