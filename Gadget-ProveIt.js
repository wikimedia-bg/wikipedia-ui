/**
 * ProveIt is a powerful reference manager for Wikipedia
 * Documentation at https://commons.wikimedia.org/wiki/Help:Gadget-ProveIt
 *
 * The gadget code is loaded directly from Wikimedia Commons,
 * but here are a few conditionals to minimize requests
 * and some configuration options specific to this wiki
 */

// Only load on appropriate namespaces
var namespace = mw.config.get( 'wgNamespaceNumber' );
if ( namespace === 0 || namespace === 2 ) {

	// Only load when editing 
	var action = mw.config.get( 'wgAction' );
	if ( action === 'edit' || action === 'submit' ) {

		// Only load when editing wikitext (and not in common.js or common.css, for example)
		var contentModel = mw.config.get( 'wgPageContentModel' );
		if ( contentModel === 'wikitext' ) {

			// Only load with the classic wikitext editors, not the new one
			$( function () {
				var textbox = $( '#wpTextbox1' );
				if ( textbox.length ) {

					// Configure the gadget (all options are optional)
					mw.config.set({
						'proveit-tag': 'Редакция с ProveIt', // Revision tag created at Special:Tags
						'proveit-summary': 'Източник редактиран с ProveIt', // Automatic edit summary
						'proveit-templates': [ // These templates should have their TemplateData defined
							'Шаблон:Cite book',
							'Шаблон:Цитат книга',
							'Шаблон:Cite web',
							'Шаблон:Цитат уеб',
							'Шаблон:Cite journal'
						]
					});

					// Load the latest code directly from Commons
					mw.loader.load( '//commons.wikimedia.org/w/load.php?modules=ext.gadget.ProveIt&only=scripts' );
					mw.loader.load( '//commons.wikimedia.org/w/load.php?modules=ext.gadget.ProveIt&only=styles', 'text/css' );
				}
			} );
		}
	}
}
