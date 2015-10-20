( function(w) {
	var customInsButtons = {};
	var customMiscButtons = {};

	w.setCustomInsButton = function(code, left, middle, right, shownText, title) {
		customInsButtons[code] = [left, middle, right, shownText, title];
	};

	w.setCustomMiscButton = function(code, codeToRun, shownText, title) {
		customMiscButtons[code] = [codeToRun, shownText, title];
	};

	// define fake API as fallback when core is not loaded
	w.rmCustomInsButtons =
	w.rmCustomMiscButtons =
	w.rmCustomButtons =
	w.putToolbar = function() {};
	w.customInsButtons =
	w.customMiscButtons = {};
}(window) );

if ($.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ] ) !== -1) {
	mw.loader.using('ext.gadget.EditToolbar-core', function () {
		$.extend(window.customInsButtons, customInsButtons);
		$.extend(window.customMiscButtons, customMiscButtons);
	});
}