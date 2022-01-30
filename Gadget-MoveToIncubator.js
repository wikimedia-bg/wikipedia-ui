function initMoveToIncubatorMenu() {

	// =======================  CONFIGURATION  =======================

	var incubatorPrefix = 'Чернова:';

	var menuText = '... в инкубатор';
	var menuHotkey = 'z';
	var menuPopupText = 'Преместване на статията в инкубатора';

	var moveLeaveRedirect = '0'; // '0' - false, '1' - true
	var moveReason = (
		'Преместване в [[Уикипедия:Инкубатор|инкубатора]], ' +
		'тъй като статията не отговаря на изискванията на Уикипедия.'
	);

	// ===============================================================

	var scriptBase = mw.config.get( 'wgScript' ) + '?';

	var movePageTarget = 'Special:MovePage/' + mw.config.get( 'wgPageName' );
	var movePageNewTitle = incubatorPrefix + mw.config.get( 'wgTitle' );

	var menuElementPrefix = '<li id="ca-move-incubator">';
	var menuElementSuffix = '</li>';

	var menuPopupFullText = menuPopupText + ' [alt-shift-' + menuHotkey + ']';

	var menuHrefParams = [
		'title=' + movePageTarget,
		'wpNewTitle=' + movePageNewTitle,
		'wpLeaveRedirect=' + moveLeaveRedirect,
		'wpReason=' + moveReason
	];

	var menuHrefLink = 'href="' + encodeURI( scriptBase + menuHrefParams.join( '&' ) ) + '"';
	var menuHrefTitle = 'title="' + menuPopupFullText + '"';
	var menuHrefHotkey = 'accesskey="' + menuHotkey + '"';

	var menuHrefAttribs = [
		menuHrefLink,
		menuHrefTitle,
		menuHrefHotkey
	];

	var menuHrefHTML = '<a ' + menuHrefAttribs.join( ' ' ) + '>' + menuText + '</a>';

	// Add the new menu option after the existing "Move" one.
	$( '#ca-move' ).after( menuElementPrefix + menuHrefHTML + menuElementSuffix );

}


$( function () {
	if ( mw.config.get( 'wgNamespaceNumber' ) === 0 ) initMoveToIncubatorMenu();
} );


// vim: ts=4 sts=4 sw=4 tw=100 noet:
