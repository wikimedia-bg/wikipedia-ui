( function(w) {
	// define fake API as fallback when core is not loaded
	w.putToolbar = function() {};

	if ($.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ] ) !== -1) {
		mw.loader.load('ext.gadget.EditToolbar-core');
	}
}(window) );