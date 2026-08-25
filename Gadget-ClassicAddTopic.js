( function () {
	'use strict';

	// Adapt DiscussionTools' server-rendered Minerva Add Topic OOUI widget.
	// Runtime gating is intentional: skins=minerva would hide this preference
	// when Special:Preferences is viewed with another skin.
	if ( !mw.config.get( 'wgMFMode' ) || mw.config.get( 'skin' ) !== 'minerva' ) {
		return;
	}

	$( function () {
		const element = document.querySelector(
			'.ext-discussiontools-init-new-topic > .ext-discussiontools-init-new-topic-button'
		);

		if ( !element ) {
			return;
		}

		mw.loader.using( 'oojs-ui-core' ).then( () => {
			let button, url;

			// DiscussionTools also infuses this widget. Repeated OOUI infusion
			// safely reuses the same widget regardless of load order.
			try {
				button = OO.ui.ButtonWidget.static.infuse( element );
			} catch ( _ ) {
				return;
			}

			if ( !( button instanceof OO.ui.ButtonWidget ) || !button.getHref() ) {
				return;
			}

			try {
				url = new URL( button.getHref(), document.baseURI );
			} catch ( _ ) {
				return;
			}

			// Fail closed if DiscussionTools changes the destination contract.
			if (
				url.origin !== location.origin ||
				url.searchParams.get( 'action' ) !== 'edit' ||
				url.searchParams.get( 'section' ) !== 'new'
			) {
				mw.log.warn( 'ClassicAddTopic: unexpected Add Topic destination; doing nothing' );
				return;
			}

			// action=submit requests the classic source editor; dtenable=0
			// independently opts this request out of DiscussionTools.
			url.searchParams.set( 'action', 'submit' );
			url.searchParams.delete( 'veaction' );
			url.searchParams.set( 'dtenable', '0' );
			button.setHref( url.pathname + url.search + url.hash );
		} ).catch( () => {
			// Leave DiscussionTools behavior unchanged if OOUI cannot load.
		} );
	} );
}() );
