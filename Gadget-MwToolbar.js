( function ( $, mw, undefined ) {
    var toolbar, $currentFocused;

    mw.libs.toolbar = {
        /**
         * Apply tagOpen/tagClose to selection in currently focused textarea.
         *
         * Uses `sampleText` if selection is empty.
         *
         * @param {string} tagOpen
         * @param {string} tagClose
         * @param {string} sampleText
         */
        insertTags: function ( tagOpen, tagClose, sampleText ) {
            if ( $currentFocused && $currentFocused.length ) {
                $currentFocused.textSelection(
                    'encapsulateSelection', {
                        pre: tagOpen,
                        peri: sampleText,
                        post: tagClose
                    }
                );
            }
        }
    };

    $( function () {
        // Used to determine where to insert tags
        $currentFocused = $( '#wpTextbox1' );
        // Apply to dynamically created textboxes as well as normal ones
        $( document ).on( 'focus', 'textarea, input:text', function () {
            $currentFocused = $( this );
        } );
    } );

} )( jQuery, mediaWiki );

// vim: set ts=4 sts=4 sw=4 et:
