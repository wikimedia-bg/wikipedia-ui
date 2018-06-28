/** Switcher
 * Превключвател
 *
 * Позволява на едно и също място в страница да се показва различно съдържание,
 * като превключването се осъществява с помощта на радио бутони. Може да се
 * използва както директно, с помощта на съответните класове елементи
 * (вж. по-долу), така и с помощта на шаблона {{превключвател}}.
 * 
 * Кратко ръководство:
 * 1. Оградете различното съдържание в подходящи елементи (най-често <div>).
 * 2. Вътре в тези елементи включете (под)елемент (най-удобно <span>) с клас
 *    „switcher-label“ и съдържание - етикета на съответния радио бутон.
 * 3. На елемента, който трябва да се показва по подразбиране, добавете атрибут
 *    „data-switcher-default=""“ в „switcher-label“ поделемента от точка (2).
 * 4. Оградете всички елементи от точка (1) с (над)елемент (най-удобно <div>)
 *    с клас „switcher-container“.
 * 5. Ако искате радио-бутоните да се показват над съдържанието, в наделемента
 *    от точка (4) добавете клас „switcher-top“.
 * 6. Ако не искате да бъде добавен бутон „Показване на всички“, в наделемента
 *    от точка (4) добавете клас „switcher-noall“.
 * 
 * Пример:
 * <div class="switcher-container switcher-top switcher-noall">
 *   <div>
 *     Съдържание 1
 *     <span class="switcher-label" data-switcher-default="">Едно</span>
 *   </div>
 *   <div>
 *     Съдържание 2
 *     <span class="switcher-label">Две</span>
 *   </div>
 * </div>
 * 
 * Оригинален код: [[:en:MediaWiki:Gadget-switcher.js]]
 * Автор на оригиналния код: [[:en:User:Jackmcbarn]]
 * Разширена версия за bgwiki: [[User:Iliev|Luchesar]]
 */
 
( function ( $ ) {
	'use strict';
	$( function () {
		$( '.switcher-container' ).each( function ( i ) {
			var activeElement, $showRadio, $showAllRadio;
			var elements = [], container = this;
			var radioName = 'switcher-' + i;
			var onTop = ( $( this ).hasClass( "switcher-top" ) ) ? true : false;
			var noAll = ( $( this ).hasClass( "switcher-noall" ) ) ? true : false;
			var radioControls = [];
			var action;
			$( this ).children().each( function () {
				var self = this;
				var $labelContainer = $( this ).find( '.switcher-label' );
				var $labelText = $labelContainer.contents();
				if ( !$labelText.length ) {
					return;
				}
				elements.push( this );
				$showRadio = $( '<input type="radio" />' ).attr( 'name', radioName ).click( function () {
					$( activeElement ).hide();
					$( self ).show();
					activeElement = self;
				} );
				radioControls.push( $( '<label style="display:block"></label>' ).append( $showRadio ).append( $labelText ) );
				if ( !activeElement ) {
					activeElement = this;
					$showRadio.prop( 'checked', true );
				} else if ( $labelContainer.is( '[data-switcher-default]' ) ) { 
					$showRadio.click();
				} else {
					$( this ).hide();
				}
				$labelContainer.remove();
			} );
			if ( elements.length > 1 && !noAll ) {
				$showAllRadio = $( '<input type="radio" />' ).attr( 'name', radioName ).click( function () {
					$( elements ).show();
					activeElement = elements;
				} );
				radioControls.push( $( '<label style="display:block">Показване на всички</label>' ).prepend( $showAllRadio ) );
			} else if ( elements.length === 1 ) {
				$showRadio.remove();
			}
			if ( onTop ) {
				radioControls.reverse();
				action = jQuery.fn.prependTo;
			} else {
				action = jQuery.fn.appendTo;
			}
			radioControls.forEach( function(control) {
				action.apply( control, [ container ] );
			} );
		} );
	} );
} )( jQuery );