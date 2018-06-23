/** Smart watchlist
*
* Provides ability to selectively hide and/or highlight changes in a user's watchlist display.
* Author: [[:en:User:UncleDouggie]]
* 
* Upstream: [[:en:User:UncleDouggie/smart watchlist.js]]
*
*/

// Extend jQuery to add a simple color picker optimized for our use
( function() {

	// works on any display element
	$.fn.swlActivateColorPicker = function( callback ) {    
		if (this.length > 0 && !$colorPalette) {
			constructPalette();
		}
		return this.each( function() { 
			attachColorPicker( this, callback );
		} );
	};

	$.fn.swlDeactivateColorPicker = function() {    
		return this.each( function() { 
			deattachColorPicker( this );
		} );
	};

	// set background color of elements using the palette within this class
	$.fn.swlSetColor = function( paletteIndex ) {    
		return this.each( function() { 
			setColor( this, paletteIndex );
		} );
	};

	var colorPickerOwner;
	var $colorPalette = null;
	var paletteVisible = false;
	var onChangeCallback = null;  // should be able to vary for each color picker using a subclosure (not today)

	var constructPalette = function() {
		$colorPalette = $( "<div>" )
		.css( {
			width: '97px',
			position: 'absolute',
			border: '1px solid #0000bf',
			'background-color': '#f2f2f2',
			padding: '1px'
		} );

		// add each color swatch to the pallete
		$.each( colors, function(i) {
			$("<div>&nbsp;</div>").attr("flag", i)
			.css( {
				height: '12px',
				width: '12px',
				border: '1px solid #000',
				margin: '1px',
				float: 'left',
				cursor: 'pointer',
				'line-height': '12px',
				'background-color': "#" + this
			} )
			.bind( "click", function() { 
				changeColor( $(this).attr("flag"), $(this).css("background-color") )
			} )
			.bind( "mouseover", function() { 
				$(this).css("border-color", "#598FEF"); 
			} ) 
			.bind( "mouseout", function() { 
				$(this).css("border-color", "#000");
			} )
			.appendTo( $colorPalette );
		} );
		$("body").append( $colorPalette );
		$colorPalette.hide();
	};

	var attachColorPicker = function( element, callback ) {
		onChangeCallback = callback;
		$( element )
		.css( {
			border: '1px solid #303030',
			cursor: 'pointer'
		} )
		.bind("click", togglePalette);
	};

	var deattachColorPicker = function(element) {
		if ($colorPalette) {
			$( element )
			.css( {
				border: 'none',  // should restore previous value
				cursor: 'default'  // should restore previous value
			} )
			.unbind("click", togglePalette);
			hidePalette();
		}
	};

	var setColor = function( element, paletteIndex ) {
		$(element).css( {
			'background-color': '#' + colors[ paletteIndex ]
		} );
		var bright = brightness( colors[ paletteIndex ] );
		if ( bright < 128 ) {
			$(element).css( "color", "#ffffff" );  // white text on dark background
		}
		else {
			$(element).css( "color", "" );
		}
	};

	var checkMouse = function(event) {
	
		// check if the click was on the palette or on the colorPickerOwner
		var selectorParent = $(event.target).parents($colorPalette).length;
		if (event.target == $colorPalette[0] || event.target == colorPickerOwner || selectorParent > 0) {
			return;
		}
		hidePalette();   
	};

	var togglePalette = function() {
		colorPickerOwner = this; 
		paletteVisible ? hidePalette() : showPalette();
	};

	var hidePalette = function(){
		$(document).unbind( "mousedown", checkMouse );
		$colorPalette.hide();
		paletteVisible = false;
	};

	var showPalette = function() {
		$colorPalette
		.css( {
			top: $(colorPickerOwner).offset().top + ( $(colorPickerOwner).outerHeight() ),
			left: $(colorPickerOwner).offset().left
		} )
		.show();

		//bind close event handler
		$(document).bind("mousedown", checkMouse);
		paletteVisible = true;
	};

	var changeColor = function( paletteIndex, newColor) {
		setColor( colorPickerOwner, paletteIndex );
		hidePalette();
		if ( typeof(onChangeCallback) === "function" ) {
			onChangeCallback.call( colorPickerOwner, paletteIndex );
		}
	};
	
	var brightness = function( hexColor ) {
		// returns brightness value from 0 to 255
		// algorithm from http://www.w3.org/TR/AERT

		var c_r = parseInt( hexColor.substr(0, 2), 16);
		var c_g = parseInt( hexColor.substr(2, 2), 16);
		var c_b = parseInt( hexColor.substr(4, 2), 16);

		return ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
	};

	var colors = [
		'ffffff', 'ffffbd','bdffc2', 'bdf7ff', 'b3d6f9', 'ffbdfa',
		'feb88a', 'ffff66','a3fe8a', '8afcfe', 'c1bdff', 'ff80e9',
		'ff7f00', 'ffd733','39ff33', '33fffd', '0ea7dd', 'cf33ff',
		'db0000', 'e0b820','0edd1f', '0ba7bf', '3377ff', 'a60edd',
		'990c00', '997500','0c9900', '008499', '1a0edd', '800099',
		'743436', '737434','347440', '346674', '1b0099', '743472' ];
} ) ();


/** Smart watchlist settings
*
* All settings are grouped together to support save, load, undo, import and export.
* Child objects are read from local storage or created on the fly.
* Structure of the settings object:
*
* settings: {
*    controls: {},
*       Used for control of the GUI and meta data about the settings object.
*       Not subject to undo or import operations, but it is saved, loaded and exported.
*
*    userCategories: [ (displayed category names in menu order, 1 based with no gaps)
*       1: {
*          key: category key,
*          name: category display name
*       },
*       2: ...
*    ],
*    nextCategoryKey: 1 (monotonically increasing key to link page categories with display names)
*    rebuildCategoriesOnUndo: "no" or "rebuild" (optimization for undo)
*
*    wikiList: [ (in display order when sorted by wiki)
*       0: {
*          domain: wiki domain (e.g., "en.wikipedia.org")
*          displayName: "English Wikipedia"
*       },
*       1: ...
*    ],
*    wikis: {
*       wiki domain 1: {
*          watchlistToken: [  // not included for home wiki/account
*             0: { token: tokenID,
*                  userName: username on remote wiki }
*             1: ...
*          ],
*          active: boolean,
*          expanded: boolen,
*          lastLoad: time,
*          pages {  // contains only pages with settings, not everything on a watchlist
*             pageID1: {
*                category: category key,
*                patrolled: revision ID,
*                flag: page flag key,
*                hiddenSections: {
*                   section 1 title: date hidden,
*                   ...
*                   }
*                hiddenRevs: {
*                   revID1: date hidden,
*                   ...
*                }
*             },
*             pageID2: ...
*          },
*          users {
*             username1: {
*                flag: user flag key,
*                hidden: date hidden
*             },
*             username2: ...
*          }
*       },
*       wiki domain 2: ...
*    }
* }
*/

// create a closure so the methods aren't global but we can still directly reference them
( function() {

	// global hooks for event handler callbacks into functions within the closure scope
	SmartWatchlist = {
		changeDisplayedCategory: function() {
			changeDisplayedCategory.apply(this, arguments);
		},
		changePageCategory: function() {
			changePageCategory.apply(this, arguments);
		},
		hideRev: function() {
			hideRev.apply(this, arguments);
		},
		patrolRev: function() {
			patrolRev.apply(this, arguments);
		},
		hideUser: function() {
			hideUser.apply(this, arguments);
		},
		processOptionCheckbox: function() {
			processOptionCheckbox.apply(this, arguments);
		},
		clearSettings: function() {
			clearSettings.apply(this, arguments);
		},
		undo: function() {
			undo.apply(this, arguments);
		},
		setupCategories: function() {
			if (setupCategories) {
				setupCategories.apply(this, arguments);
			}
			else {
				alert("Редакторът на групи не може да бъде стартиран. Опитайте да презаредите страницата.");
			}
		}
	};
	
	var settings = {};
	var lastSettings = [];
	var maxSettingsSize = 2000000;
	var maxUndo = 100;  // dynamically updated
	var maxSortLevels = 4;
	
	// for local storage - use separate settings for each wiki user account
	var storageKey = "SmartWatchlist." + mw.config.get( 'wgUserName' );  
	var storage = null;
	
	var initialize = function() {
	
		// check for local storage availability
		try {
			if ( typeof(localStorage) === "object"  && typeof(JSON) === "object" ) {
				storage = localStorage;
			}
		}
		catch(e) {}  // ignore error in FF 3.6 with dom.storage.enabled=false
		
		readLocalStorage();  // load saved user settings
		initSettings();
		createSettingsPanel();
		
		// build menu to change the category of a page
		var $categoryMenuTemplate = $constructCategoryMenu( "no meta" )
				// no attributes other than onChange allowed so the menu can be rebuilt in setupCategories()!
				.attr( "onChange", "javascript:SmartWatchlist.changePageCategory(this, value);" );
			
		var lastPageID = null;
		var rowsProcessed = 0;
		
		// process each displayed change row
		$("table.mw-enhanced-rc tr").each( function() {
		
			rowsProcessed++;
			var $tr = $(this);
			var $td = $tr.find("td:last-child");
			var isHeader = false;
			
			// check if this is the header for an expandable list of changes
			if ( $tr.find(".mw-changeslist-expanded").length > 0 ) {
				isHeader = true;
				lastPageID = null;  // start of a new page section
			}

			/* Parse IDs from the second link. The link text can be of the following forms:
			     1. "n changes" - used on a header row for a collapsable list of changes
				 2. "cur" - an individual change within a list of changes to the same page
				 3. "diff" - single change with no header row 
				 4. "talk" - deleted revision. No page ID is present on such a row. */
				 
			var $secondLink = $td.find("a:eq(1)");  // get second <a> tag in the cell
			var href = $secondLink.attr("href");
			var linkText = $secondLink.text();
			var pageID = href.replace( /.*&curid=/, "" ).replace( /&.*/, "" );
			var revID = href.replace( /.*&oldid=/, "" ).replace( /&.*/, "" );
			var user = $td.find(".mw-userlink").text();
			
			// check if we were able to parse the page ID
			if ( !isNaN(parseInt(pageID)) ) {
				lastPageID = pageID;
			}
			// check for a deleted revision
			else if ( $td.find(".history-deleted").length > 0 && lastPageID ) {
				pageID = lastPageID;  // use page ID from the previous row in the same page, if any
			}
			// unable to determine type of row
			else {
				pageID = null;
				if (console) {
					console.log("SmartWatchlist: unable to parse row " + $td.text());
				}
			}
				
			if (pageID) {
					
				$tr.attr( {
					pageID: pageID,
					wiki: document.domain
				} );

				// check if we were able to parse the rev ID and have an individual change row
				if ( !isNaN(parseInt(revID)) &&  
					["cur", "diff", "тек", "разл"].includes(linkText) ) {

					// add the hide change link
					$tr.attr( "revID", revID );
					var $revLink = $("<a>", {
						href: "javascript:SmartWatchlist.hideRev('" + pageID + "', '" + revID + "');",
						title: "Скриване на тази редакция",
						text: "скр. ред."
					});
					$td.append( $( "<span>" )
						.addClass( "swlRevisionButton" )
						.append( " [" ).append( $revLink ).append( "]" )
					);

					// add the patrol prior changes link
					var $patrolLink = $("<a>", {
						href: "javascript:SmartWatchlist.patrolRev('" + pageID + "', '" + revID + "');",
						title: "Скриване на всички предишни редакции по страницата",
						text: "скр. вс."
					});
					$td.append( $( "<span>" )
						.addClass( "swlRevisionButton" )
						.append( " [" ).append( $patrolLink ).append( "]" )
					);
				}

				// check if this is the top-level row for a page
				if ( isHeader || linkText.match(/(^diff$|^разл$|^\d+\sпромени$)/) ) {
				
					// add the category menu with the current page category pre-selected
					$newMenu = $categoryMenuTemplate.clone();
					$td.prepend( $newMenu );
					
					// add the page attribute to the link to the page to support highlighting specific pages
					$td.find("a:eq(0)")  // get first <a> tag in the cell
						.attr( {
							pageID: pageID,
							wiki: document.domain
						} )
						.addClass( "swlPageTitleLink" );
				}
			}
			
			// check if we parsed a user for an individual change row
			if (user && !isHeader) {
				
				// mark change row for possible hiding/flagging
				$tr.attr( "wpUser", user );
				if ( !$tr.attr("wiki") ) {
					$tr.attr( "wiki", document.domain );
				}

				// add the hide user link
				var $hideUserLink = $("<a>", {
					href: "javascript:SmartWatchlist.hideUser('" + user + "');",
					title: "Скриване на редакции от " + user + " по всички страници",
					text: "скр. потр."
				});
				$td.append( $( "<span>" )
					.addClass( "swlHideUserButton" )
					.append( " [" ).append( $hideUserLink ).append( "]" )
				);
			}
		});  // close each()
		
		// set the user attribute for each username link to support highlighting specific users
		$(".mw-userlink").each( function() {
			var $userLink = $(this);
			$userLink.attr( {
				wiki: document.domain,
				wpUser: $userLink.text() 
			} )
			.addClass("swlUserLink");
		});
		
		initDisplayControls();
		
		// restore last displayed category and apply display settings
		changeDisplayedCategory( 
			selectCategoryMenu( $( "#swlSettingsPanelCategorySelector" ), getSetting("controls", "displayedCategory" ) ) );

		// check if we were able to do anything
		if (rowsProcessed == 0) {
			$("#SmartWatchlistOptions")
				.append( $( "<p>", {
						text: 'За да използвате подобрения списък за наблюдение, активирайте опцията „Групиране по страници на промените..." в раздела „Последни промени“ на потребителските си настройки.' 
					} )
					.css("color", "#cc00ff")
				);
		}
	};

	var initDisplayControls = function() {
		// set visibility of buttons and pulldowns shown on each change row
		$( ".swlOptionCheckbox" ).each( function() {
			$checkbox = $(this);
			
			// restore saved checkbox setting
			$checkbox.attr( "checked", getSetting("controls", [ $checkbox.attr("controlsProperty") ] ) );
			
			// apply checkbox value to buttons
			processOptionCheckbox( this );
		} );
	};

	// if the desired category exists, pre-select it in the menu
	// otherwise, fallback to the default selection
	var selectCategoryMenu = function( $selector, category ) {
	
		// check if page category has been deleted
		if ( typeof( category ) === "undefined" ) {
			$selector.attr("selectedIndex", "0");  // fallback to first option
		}
		else {
			// attempt to use set page category
			$selector.val( category );
			if ( $selector.val() == null ) {
				// desired category not in the menu, fallback to first option
				$selector.attr("selectedIndex", "0");
			}
		}
		return $selector.val();  // return actual category selected
	};

	// called when the displayed category menu setting is changed
	var changeDisplayedCategory = function(category) {
		setSetting( "controls", "displayedCategory", category );
		applySettings();
		writeLocalStorage();
	};
	
	// called when the category for a page is changed
	var changePageCategory = function( td, category ) {
	
		var $tr = $( td.parentNode.parentNode );
		var pageID = $tr.attr( "pageID" );
		var wiki = $tr.attr( "wiki" );
		
		// convert category to a number if possible
		if ( typeof( category ) === "string" ) {
			var intCategory = parseInt( category );
			if ( !isNaN( intCategory ) ) {
				category = intCategory;
			}
		}
		
		// update category selection menus for all other instances of the page
		$( 'tr[wiki="' + document.domain + '"][pageID="' + pageID + '"] select' ).val( category );
		
		// update settings
		snapshotSettings("change page category");
		
		if ( category == "uncategorized" ) {
			deleteSetting("wikis", document.domain, "pages", pageID, "category")
		} else {
			setSetting("wikis", document.domain, "pages", pageID, "category", category);
		}
		writeLocalStorage();

		// hide the page immediately if auto refresh
		applySettings();
	};
	
	// callback for "hide change"
	var hideRev = function( pageID, revID ) {

		var mode = getSetting( "controls", "displayedCategory" );
		
		// hide the rows unless displaying everything currently
		if ( mode != "all+" ) {
			var $tr = $( 'tr[wiki="' + document.domain + '"][revID="' + revID + '"]' );  // retrieve individual change row
			hideElements($tr);
			suppressHeaders();
		}
		
		// update settings
		snapshotSettings("hide change");
		if ( mode == "hide" ) {
			deleteSetting( "wikis", document.domain, "pages", pageID, "hiddenRevs", revID );  // unhide
		}
		else {
			setSetting( "wikis", document.domain, "pages", pageID, "hiddenRevs", revID, new Date() );  // hide
		}
		writeLocalStorage();
	};
	
	// callback for "patrol"
	var patrolRev = function( pageID, revID ) {

		var mode = getSetting( "controls", "displayedCategory" );
		
		// hide the rows unless displaying everything currently
		if ( mode != "all+" ) {
			var $tr = $( 'tr[wiki="' + document.domain + '"][pageID="' + pageID + '"]' ).filter( function() {  // filter all rows for the page
				var rowRevID = $(this).attr("revID");
				return (rowRevID <= revID);
			});
			hideElements($tr);
			suppressHeaders();
		}
		
		// update settings
		snapshotSettings("patrol action");
		setSetting("wikis", document.domain, "pages", pageID, "patrolled", revID);
		writeLocalStorage();
	};
	
	// callback for "hide user"
	var hideUser = function( user ) {
	
		var mode = getSetting( "controls", "displayedCategory" );

		// hide the rows unless displaying everything currently
		if ( mode != "all+" ) {
			var $tr = $( 'tr[wiki="' + document.domain + '"][wpUser="' + user + '"]' );  // retrieve all changes by user
			hideElements($tr);
			suppressHeaders();
		}

		// update settings
		snapshotSettings("hide user");
		if ( mode == "hide" ) {
			deleteSetting( "wikis", document.domain, "users", user, "hide" );  // unhide
		}
		else {
			setSetting( "wikis", document.domain, "users", user, "hide", new Date() );  // hide
		}
		writeLocalStorage();
	};
	
	// toggle the state of a given class of user interface elements
	var processOptionCheckbox = function( checkbox ) {
		var $checkbox = $(checkbox);
		var $elements = $( "." + $checkbox.attr("controlledClass") );
		if ( checkbox.checked ) {
			if ( $checkbox.hasClass("swlColorPickerControl") ) {
				$elements
				.attr( "onClick", "javascript:return false;")  // disable links so color picker can activate
				.swlActivateColorPicker( setFlag );
			}
			else {
				$elements.show();
			}
		} else {
			if ( $checkbox.hasClass("swlColorPickerControl") ) {
				$elements
				.attr( "onClick", "")  // re-enable links
				.swlDeactivateColorPicker();
			}
			else {
				$elements.hide();
			}
		}
		setSetting( "controls", $checkbox.attr("controlsProperty"), checkbox.checked );
		writeLocalStorage();
	};
	
	// callback from the color picker to flag a user or page
	var setFlag = function( flag ) {
	
		$this = $(this);  // element to be flagged
		var $tr = $this.parents( "tr[wiki]" );
		var wiki = $tr.attr( "wiki" );
		var idLabel;
		var settingPath;
		var $idElement;
		
		if ( $this.hasClass("swlUserLink") ) {
			idLabel = "wpUser";
			$idElement = $this;
			settingPath = "users";
		}
		else {
			idLabel = "pageID";
			$idElement = $tr;
			settingPath = "pages";
		}
		
		var id = $idElement.attr( idLabel );
		
		if ( typeof(id) === "string" ) {
			snapshotSettings("highlight");

			// update the color on all other instances of the element
			$( 'a[wiki="' + wiki + '"][' + idLabel + '="' + id + '"]' ).swlSetColor( flag );

			// update settings
			flag = parseInt( flag );
			if ( !isNaN( flag ) && flag > 0 ) {
				setSetting( "wikis", wiki, settingPath, id, "flag", flag );
			}
			else {
				deleteSetting("wikis", wiki, settingPath, id, "flag");
			}
			writeLocalStorage();
		}
	};
	
	// hide header rows that don't have any displayed changes
	var suppressHeaders = function() {
	
		// process all change list tables (page headers + changes)
		var $tables = $("table.mw-enhanced-rc");
		$tables.each( function( index ) {
		
			var $table = $(this);
			
			// check if this is a header table with a following table
			if ( $table.filter( ":has(.mw-changeslist-expanded)" ).length > 0 &&
			     index + 1 < $tables.length ) {

				// check if the following table has visible changes
				var $visibleRows = $tables.filter( ":eq(" + (index + 1) + ")" )
					.find( "tr" )
					.not( ".swlHidden" );
					
				if ( $visibleRows.length == 0 ) {
					hideElements($table);
				}
			}
		});
	};
	
	// hide a set of jQuery elements and apply our own class 
	// to support header suppression and later unhiding
	var hideElements = function( $elements ) {
		$elements.hide();
		$elements.addClass("swlHidden");
	};

	// reinitialize displayed content using current settings
	var applySettings = function() {
	
		var displayedCategory = getSetting( "controls", "displayedCategory" );
		
		// show all changes, including heading tables
		$( ".swlHidden" ).each( function() {
			var $element = $(this);
			$element.show()
			$element.removeClass("swlHidden");
		});

		if ( displayedCategory != "all+" && displayedCategory != "hide" ) {  // XXX should showing these be a new option?
		
			// hide changes by set users
			$( 'tr[wiki="' + document.domain + '"][wpUser]').each( function() {
				var $tr = $(this);
				if ( getSetting( "wikis", document.domain, "users", $tr.attr("wpUser"), "hide" ) ) {
					hideElements($tr);
				}
			});
		}
		
		// process each change row
		$( 'tr[wiki="' + document.domain + '"][pageID]').each( function() {
			var $tr = $(this);
			var pageID = $tr.attr("pageID");
			var revID = $tr.attr("revID");
			var pageCategory = getSetting( "wikis", document.domain, "pages", pageID, "category" );
			var pageFlag = getSetting( "wikis", document.domain, "pages", pageID, "flag" );
			
			// check if there is a page category menu on the row
			var $select = $tr.find( 'select' );
			if ( $select.length == 1 ) {
			
				// select proper item in the menu
				var newCategoryKey = selectCategoryMenu( $select, pageCategory );
					
				// reset page category if the current category has been deleted
				if ( pageCategory && pageCategory != newCategoryKey ) {
					deleteSetting( "wikis", document.domain, "pages", pageID, "category");
					pageCategory = newCategoryKey;
				}
			}

			// check if change should be hidden
			// XXX should we show changes by hidden users when in "hidden" display mode? Maybe a new option.
			var visible;
			
			if (displayedCategory == "all+") {
				visible = true;
			}
			else if ( revID &&
				(  getSetting( "wikis", document.domain, "pages", pageID, "hiddenRevs", revID ) ||  // specific revision is hidden
				  getSetting( "wikis", document.domain, "pages", pageID, "patrolled" ) >= revID  // revision has been patrolled
				) ) {
				visible = false;
			}
			// check if page is hidden
			else if ( pageCategory == "hide" && displayedCategory != "hide" ) {
				visible = false;
			} 
			else if (displayedCategory == "all") {
				visible = true;
			}
			// check for no category
			else if ( displayedCategory == "uncategorized" ) {
				if (pageCategory) {
					visible = false;
				} else {
					visible = true;
				}
			}
			// check if page is flagged
			else if ( displayedCategory == "flag" && typeof(pageFlag) !== "undefined" ) {
				visible = true;
			}
			// check for selected category
			else if ( pageCategory && displayedCategory == pageCategory ) {
				visible = true;
			} 
			else {
				visible = false;
			}
			
			if ( !visible ) {
				hideElements($tr);
			}
		});
		
		// hide changes to unknown pages if not displaying all pages
		if ( displayedCategory != "all+" && displayedCategory != "all" && displayedCategory != "uncategorized" ) {
			hideElements( $("table.mw-enhanced-rc tr").not( '[pageID]') );
		}
		
		// decorate user links
		$(".mw-userlink").each( function() {
			var $userLink = $(this);
			var user = $userLink.attr( "wpUser" );
			var flag =  getSetting( "wikis", document.domain, "users", user, "flag" );
			if ( typeof( flag ) == "number" ) {
				$userLink.swlSetColor( flag );
			} else {
				$userLink.swlSetColor( 0 );
			}
		});
		
		// decorate page titles
		$( 'a[pageID]').each( function() {
			var $pageTitleLink = $(this);
			var flag = getSetting( "wikis", document.domain, "pages", [ $pageTitleLink.attr("pageID") ], "flag" );
			if ( typeof( flag ) == "number" ) {
				$pageTitleLink.swlSetColor( flag );
			} else {
				$pageTitleLink.swlSetColor( 0 );
			}
		});
		
		suppressHeaders();
	};
	
	// add smart watchlist settings panel below the standard watchlist options panel
	var createSettingsPanel = function() {
	
		// construct panel column 1
		var $column1 = $( "<td>" ).attr("valign", "top")
			.append( 
				$( "<input>", {
					type: "checkbox",
					"class": "swlOptionCheckbox",
					controlledClass: "swlRevisionButton",
					controlsProperty: "showRevisionButtons",
					onClick: "javascript:SmartWatchlist.processOptionCheckbox(this);"
				} )
			)
			.append("Скриване на редакции")
			.append( "<br />" )
			.append( 
				$( "<input>", {
					type: "checkbox",
					"class": "swlOptionCheckbox",
					controlledClass: "swlHideUserButton",
					controlsProperty: "showUserButtons",
					onClick: "javascript:SmartWatchlist.processOptionCheckbox(this);"
				} )
			)
			.append("Скриване на потребители")
			.append( "<br />" )
			.append( 
				$( "<input>", {
					type: "checkbox",
					"class": "swlOptionCheckbox swlColorPickerControl",
					controlledClass: "swlUserLink",
					controlsProperty: "showUserColorPickers",
					onClick: "javascript:SmartWatchlist.processOptionCheckbox(this);"
				} )
			)
			.append("Маркиране на потребители")
			.append( "<br />" )
			.append( 
				$( "<input>", {
					type: "checkbox",
					"class": "swlOptionCheckbox swlColorPickerControl",
					controlledClass: "swlPageTitleLink",
					controlsProperty: "showPageColorPickers",
					onClick: "javascript:SmartWatchlist.processOptionCheckbox(this);"
				} )
			)
			.append("Маркиране на страници")
			.append( "<br />" )
			.append( 
				$( "<input>", {
					type: "checkbox",
					"class": "swlOptionCheckbox",
					controlledClass: "swlPageCategoryMenu",
					controlsProperty: "showPageCategoryButtons",
					onClick: "javascript:SmartWatchlist.processOptionCheckbox(this);"
				} )
			)
			.append("Групиране на страници");
		
		// construct panel column 2
		var $column2 = $( "<div>" )
			.attr("style", "padding-left: 25pt;")
			.append( 
				$( "<div>" ).attr("align", "center")
				.append(
					$("<input />", {
						type: "button",
						onClick: "javascript:SmartWatchlist.clearSettings();",
						title: "Изчистване на всички настройки за страници и потребители и премахване на всички групи",
						value: "Изчистване на настройките"
					} ) 
				)
				.append("&nbsp;&nbsp;")
				.append(
					$("<input />", {
						type: "button",
						onClick: "javascript:SmartWatchlist.setupCategories();",
						title: "Създаване, промяна и изтриване на групите страници",
						value: "Настройване на групите"
					} )
				)
				.append("&nbsp;&nbsp;")
				.append(
					$("<input />", {
						type: "button",
						id: "swlUndoButton",
						onClick: "javascript:SmartWatchlist.undo();",
						title: "Няма нищо за отменяне",
						disabled: "disabled",
						value: "Отмяна"
					} ) 
				)
				.append( "<p>" )
				.append( "Display pages in:&nbsp;" )
				.append( 
					$constructCategoryMenu( "meta" )
						// no attributes other than onChange allowed so the menu can be rebuild in setupCategories()!
						.attr( "onChange", "javascript:SmartWatchlist.changeDisplayedCategory(value);" )
				)
			);

		$sortPanel = $( "<div>" ).attr("align", "right")
			.append( "Sort order:&nbsp;" );
		
		for (var i = 0; i < maxSortLevels; i++) {
			$sortPanel
			.append( $constructSortMenu().attr("selectedIndex", i) )
			.append( "<br />" );
			if (i == 0) {
				$sortPanel.append( "(not yet)&nbsp;&nbsp;" );
			}
		}
		
		// construct panel column 3
		var $column3 = $( "<div>" )
			.attr("style", "padding-left: 25pt;")
			.append( $sortPanel );
			
		// construct main settings panel
		$("#mw-watchlist-options")
			.after( 
				$( "<fieldset>", {
					id: "SmartWatchlistOptions"
				} )
				.append( 
					$( "<legend>", {
						text: "Настройки на подобрения списък за наблюдение"
					} ) 
				)
				.append( 
					$( "<table>" )
					.append( 
						$( "<tr>" )
						.append( $column1 )
						.append( 
							$( "<td>", {
								valign: "top"
							} )
							.append( $column2 )
						)
						.append( 
							$( "<td>", {
								valign: "top"
							} )
							.append( $column3 )
						)
					)
				)
			);
		
		if ( !storage ) {
			$("#SmartWatchlistOptions")
			.append( 
				$( "<p>", {
					text: "Вашият браузър не поддържа запазване на настройките в локално хранилище. " +
					"Скритите и маркирани обекти ще бъдат загубени при презареждане на страницата."
				} )
				.css("color", "red")
			);
		}
	};

	// construct a page category menu
	var $constructCategoryMenu = function( metaOptionString ) {

		var $selector = 
			$( "<select>", {
				"class": "namespaceselector swlCategoryMenu",
				withMeta: metaOptionString  // flag so the menu can be rebuilt in setupCategories()
			} );

		if (metaOptionString == "meta") {
			// for updating the displayed category selection
			$selector.attr( "id", "swlSettingsPanelCategorySelector");
		}
		else {
			// for hiding/showing page category menus
			$selector.addClass( "swlPageCategoryMenu" );
		}

		// create default category, must be first in the menu!!!
		var categories = [
			{ value: "uncategorized", text: "uncategorized" }
		];
		
		
		// add user categories, if any
		var userCategories = getSetting("userCategories");
		if ( typeof(userCategories) === "object" ) {
			for (var i = 0; i < userCategories.length && userCategories[i]; i++) {
				var key = userCategories[i].key;
				if ( typeof(key) !== "number" ) {
					alert("Дефинираните групи в подобрения списък за наблюдение са повредени. За съжаление, трябва да изчистите изцяло настройките на подобрения списък.");
					break;
				}
				else {
					categories.push( { value: userCategories[i].key, text: userCategories[i].name } )
				}
			}
		}
		
		// add special categories to settings menu
		if (metaOptionString == "meta") {
			categories.push(
				{ value: "all", text: "всичко без скрити" },
				{ value: "flag", text: "маркирани" }
			);
		}

		categories.push( { value: "hide", text: "скрити" } );
		
		if (metaOptionString == "meta") {
			categories.push( { value: "all+", text: "всичко" } );
		}

		// construct all <option> elements
		for (var i in categories) {
			$selector.append( $( "<option>", categories[i] ) );
		}
		return $selector;
	};

	// construct a page category menu
	var $constructSortMenu = function() {

		var $selector = 
			$( "<select>", {
				"class": "namespaceselector swlSortMenu"
			} );

		var sortCriteria = [
			{ value: "wiki", text: "Wiki" },
			{ value: "title", text: "Title" },
			{ value: "timeDec", text: "Time (newest first)" },
			{ value: "timeInc", text: "Time (oldest first)" },
			{ value: "risk", text: "Vandalism risk" },
			{ value: "namespace", text: "Namespace" },
			{ value: "flagPage", text: "Highlighted pages" },
			{ value: "flagUser", text: "Highlighted users" }
		];
		
		// construct all <option> elements
		for (var i in sortCriteria) {
			$selector.append( $( "<option>", sortCriteria[i] ) );
		}
		return $selector;
	};

	// save settings for later undo
	var snapshotSettings = function( currentAction, rebuildOption ) {

		if (typeof(rebuildOption) === "undefined") {
			rebuildOption = "no";
		}
		setSetting("rebuildCategoriesOnUndo", rebuildOption);
		
		var settingsClone = $.extend( true, {}, settings );
		lastSettings.push( settingsClone );
		while (lastSettings.length > maxUndo) {
			lastSettings.shift();
		}
		
		if (currentAction) {
			currentAction = "Отмяна на " + currentAction;
		} else {
			currentAction = "Отмяна на последната промяна";
		}
		setSetting("undoAction", currentAction);
		$( "#swlUndoButton" )
			.attr("disabled", "")
			.attr( "title", currentAction );
	};

	// restore previous settings
	var undo = function() {
		if (lastSettings.length > 0) {
		
			var currentControls = settings.controls;
			settings = lastSettings.pop();
			settings.controls = currentControls;  // controls aren't subject to undo
			
			// only rebuild menus when needed because it takes several seconds
			if (getSetting("rebuildCategoriesOnUndo") == "rebuild") {
				rebuildCategoryMenus();  // also updates display and local storage
			}
			else {
				writeLocalStorage();
				applySettings();
			}
			
			var lastAction = getSetting("undoAction");
			if (!lastAction) {
				lastAction = "";
			}
			$( "#swlUndoButton" ).attr( "title", lastAction );
			
			if (lastSettings.length == 0) {
				$( "#swlUndoButton" )
					.attr( "disabled", "disabled" )
					.attr( "title", "Няма нищо за отменяне" );
			}
		}
	};
	
	// for use after a change to the category settings
	var rebuildCategoryMenus = function() {
	
		// rebuild existing category menus
		$( '.swlCategoryMenu' ).each( function() {
			var $newMenu = $constructCategoryMenu( $(this).attr('withMeta') );
			$newMenu.attr( "onChange", $(this).attr("onChange") );  // retain old menu action
			this.parentNode.replaceChild( $newMenu.get(0), this );
		} );
		
		// update menu selections and save settings
		changeDisplayedCategory( 
			selectCategoryMenu( $( "#swlSettingsPanelCategorySelector" ), getSetting("controls", "displayedCategory" ) ) );
			
		initDisplayControls();
	};

	// read from local storage to current in-work settings during initialization
	var readLocalStorage = function() {
		if (storage) {
		
			var storedString = storage.getItem(storageKey);
			if (storedString) {

				try {
					settings = JSON.parse( storedString );
				}
				catch (e) {
					alert( "Подобрен списък за наблюдение: грешки при зареждане на съхранените настройки!" );
					settings = {};
				}
			}
		
			// delete all obsolete local storage keys from prior versions and bugs
			// this can eventually go away
			var obsoleteKeys = [
				"undefinedmarkedUsers",
				"undefinedmarkedPages",
				"undefinedpatrolledRevs",
				"undefinedhiddenRevs",
				"undefinedGUI",
				"SmartWatchlist.flaggedPages",
				"SmartWatchlist.flaggedUsers",
				"SmartWatchlist.hiddenPages",
				"SmartWatchlist.hiddenUsers",
				"SmartWatchlist.markedUsers",
				"SmartWatchlist.markedPages",
				"SmartWatchlist.patrolledRevs",
				"SmartWatchlist.hiddenRevs",
				"SmartWatchlist.GUI",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".markedUsers",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".markedPages",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".patrolledRevs",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".userFlag",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".pageCategory",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".pageFlag",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".patrolledRevision",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".hiddenRevs",
				"SmartWatchlist." + mw.config.get( "wgUserName" ) + ".GUI",
				"length"
			];
			for (var i in obsoleteKeys) {
				if ( typeof( storage.getItem( obsoleteKeys[i]) ) !== "undefined" ) {
					storage.removeItem( obsoleteKeys[i] );
				}
			}
		}
	};
	
	// update local storage to current in-work settings
	var writeLocalStorage = function() {
		if (storage) {
			var storeString = JSON.stringify( settings );
			var size = storeString.length;
			if ( size > maxSettingsSize ) {
				storeString = "";
				alert( "Подобрен списък за наблюдение: новите настройки са прекалено големи, за да бъдат съхранени (" + size + " байта)!" )
				return;
			}
				
			var lastSaveString = storage.getItem(storageKey);

			try {
				storage.setItem( storageKey, storeString );
			}
			catch (e) {
				storeString = "";				
				alert( "Подобрен списък за наблюдение: грешка при съхраняване на новите настройки!" );
				
				// revert to previously saved settings that seemed to work
				storage.setItem( storageKey, lastSaveString );
			}
			maxUndo = Math.floor( maxSettingsSize / size ) + 2;
		}
	};
	
	// erase all saved settings
	var clearSettings = function() {
		snapshotSettings("clear settings", "rebuild");
		var currentControls = settings.controls;
		settings = {};
		settings.controls = currentControls;  // controls aren't subject to clearing
		initSettings();
		rebuildCategoryMenus();  // also updates display and local storage
	};
	
	// lookup a setting path passed as a series of arguments
	// returns undefined if no setting exists
	var getSetting = function() {
		var obj = settings;
		for (var index in arguments) {
			if (typeof( obj ) !== "object") {
				return undefined;  // part of path is missing
			}
			obj = obj[ arguments[ index ] ];
		}
		return obj;
	};
	
	// set the value of a setting path passed as a series of argument strings
	// creates intermediate objects as needed
	// number arguments reference arrays and string arguments reference associative array properties
	// the last argument is the value to be set (can be any type)
	var setSetting = function() {
		if (arguments.length < 2) {
			throw "setSetting: insufficient arguments";
		}
		var obj = settings;
		for (var index = 0; index < arguments.length - 2; index++) {
			var nextObj = obj[ arguments[ index] ];
			if (typeof( nextObj ) !== "object") {
				if ( typeof( arguments[ index + 1 ] ) === "number" ) {
					nextObj = obj[ arguments[ index ] ] = [];
				} else {
					nextObj = obj[ arguments[ index ] ] = {};
				}
			}
			obj = nextObj;
		}
		obj[ arguments[ arguments.length - 2 ] ] = arguments[ arguments.length - 1 ];
	};
	
	// delete a setting path passed as a series of argument strings if the entire path exists
	var deleteSetting = function() {
		if (arguments.length < 1) {
			throw "deleteSetting: insufficient arguments";
		}
		var obj = settings;
		for (var index = 0; index < arguments.length - 1; index++) {
			// check if we hit a snag and still have more arguments to go
			if (typeof( obj ) !== "object") {
				return;
			}
			obj = obj[ arguments[ index ] ];
		}
		if (typeof( obj ) === "object") {
			delete obj[ arguments[ index ] ];
		}
	};

	var initSettings = function() {
	
		// check if home domain already exists
		if ( !getSetting("wikis", document.domain) ) {
			setSetting("wikis", document.domain, "active", true);
			var wikiNumber = 0;
			var wikiList = getSetting("wikiList");
			if (wikiList) {
				wikiNumber = wikiList.length;
			}
			setSetting("wikiList", wikiNumber, {
				domain: document.domain,
				displayName: document.domain
			} );
		}
		
		if ( !settings.nextCategoryKey ) {
			settings.nextCategoryKey = 1;
		}
	};

	// dialog windows
	var setupCategories = null;
	mw.loader.using( ['jquery.ui.dialog', 'jquery.ui.sortable'], function() {

		setupCategories = function () {
		
			// construct a category name row for editing
			var addCategory = function ( key, name ) {
				$editTable.append( 
					$( '<tr>' )
					.append( 
						$( '<td>' ).append( $( '<span>' ).addClass( 'ui-icon ui-icon-arrowthick-2-n-s' ) )
					)
					.append(
						$( '<td>' ).append(
							$( '<input />', {
								type: 'text',
								size: '20',
								categoryKey: key,
								value: name
							} )
						)
					)
				);
			};
		
			// jQuery UI sortable() seems to only like <ul> top-level elements
			var $editTable = $( '<ul>' ).sortable( { axis: 'y' } );
			
			for (var i in settings.userCategories) {
				addCategory( settings.userCategories[i].key,
				             settings.userCategories[i].name );
			}
			if ( !getSetting( 'userCategories', 0 ) ) {
				addCategory( settings.nextCategoryKey++, '' );  // pre-add first category if needed
			}
			
			var $interface = $('<div>')
				.css( {
					'position': 'relative',
					'margin-top': '0.4em'
				} )
				.append( 
					$( '<ul>')
					.append( $( '<li>', { text: "Преименуването на групи запазва включените в тях страници." } ) )
					.append( $( '<li>', { text: "Тегленето на редове променя реда в менютата с групи." } ) )
					.append( $( '<li>', { text: "За да изтриете група, изтрийте името ѝ." } ) )
					.append( $( '<li>', { text: "Страниците в изтрити групи стават отново негрупирани." } ) )
				)
				.append( $( '<br />' ) )
				.append( $editTable )
				.append( $( '<br />' ) )
				.dialog( {
					width: 400,
					autoOpen: false,
					title: 'Настройка на групите',
					modal: true,
					buttons: { 
						'Съхраняване': function() { 
							$(this).dialog('close');
							snapshotSettings('category setup', 'rebuild');
							
							// replace category names in saved settings
							deleteSetting( 'userCategories' );
							var index = 0;
							$editTable.find('input').each( function() {

								var name = $.trim(this.value);
								if (name.length > 0) {  // skip blank categories
								
									// convert category key back into a number
									var key = $(this).attr('categoryKey');
									if ( typeof( key ) === "string" ) {
										var intKey = parseInt( key );
										if ( !isNaN( intKey ) ) {
											setSetting( 'userCategories', index++, {
												key: intKey,
												name: name
											} );
										}
									}
								}
							} );
							rebuildCategoryMenus();
						},
						'Добавяне на група': function() {
							addCategory( settings.nextCategoryKey++, '' );
						},
						'Отказ': function() { 
							$(this).dialog('close');
						}
					}
				} );
			$interface.dialog('open');
		}
	} );
	
	// activate only on the watchlist page
	if ( mw.config.get("wgNamespaceNumber") == -1 && ["Watchlist", "Списък за наблюдение"].includes(mw.config.get("wgTitle")) ) {
		$(document).ready(initialize);
	};
} ) ();