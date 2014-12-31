if ($.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ] ) !== -1) {
	mw.loader.load('ext.gadget.EditToolbar-core');
}