'use strict';

const redirectURL = 'https://commons.wikimedia.org/wiki/Special:UploadWizard';
const redirectTimeout = 5;  // seconds
const redirectTimeoutMsec = redirectTimeout * 1000;

function showInfo() {
	const infoCSS = 'padding: 5vw; font-size: 150%; font-style: italic;';
	const infoHeaderCSS = 'font-size: 120%; font-weight: bold;';
	const redirectAlt = 'Wikimedia Commons Upload Wizard';

	// Note that only ECMAScript 5 is supported, so no backtick literals.
	const infoHTML = '\
	<div style="' + infoCSS + '">\
		<span style="' + infoHeaderCSS + '">\
			Качвайте файлове в Общомедия!\
		</span>\
		<br><br>\
		Ако не бъдете автоматично пренасочени\
		след ' + redirectTimeout + ' секунди, моля,\
		<a href="' + redirectURL + '" alt="' + redirectAlt + '">\
			щракнете върху тази връзка\
		</a>!\
	</div>\
	';
	
	$( '#content' ).html( infoHTML );
}

function doRedirect() {
	/*
	Not sure why it complains about "changes you made may not be saved", when we
	simply clicked the "Upload file" link, but let's really disable it.
	*/
	$( window ).off( 'beforeunload' );
	
	/*
	replace() seems better than "href =" here, as when people try going back, we
	want them to return to the page on which they clicked the "Upload file" link,
	not to the local upload page, which is the one we want them to avoid.
	*/
	window.location.replace( redirectURL );
}

$( function () {
	/*
	Redirect on [[Special:Upload]] or [[MediaWiki:Uploadtext]]. For reasons
	unknown, our "Качване на файл" link leads to the latter, not the former.
	*/
	if (
		(
			mw.config.get( 'wgCanonicalNamespace' ) === 'Special' &&
			mw.config.get( 'wgCanonicalSpecialPageName' ) === 'Upload'
		) ||
		(
			mw.config.get( 'wgCanonicalNamespace' ) === 'MediaWiki' &&
			mw.config.get( 'wgTitle' ) === 'Uploadtext'
		)
	) {
		showInfo();
		setTimeout( doRedirect, redirectTimeoutMsec );
	}
} );
