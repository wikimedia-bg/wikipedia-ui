( function(w) {
	// define fake API as fallback when core is not loaded
	w.setCustomInsButton =
	w.setCustomMiscButton =
	w.rmCustomInsButtons =
	w.rmCustomMiscButtons =
	w.rmCustomButtons =
	w.putToolbar = function() {};
	w.customInsButtons =
	w.customMiscButtons = [];
}(window) );
if ($.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ] ) !== -1) {
	mw.loader.load('ext.gadget.EditToolbar-core');
}