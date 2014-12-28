/**
 * Simple quick links viewer
 *
 * License: Public domain
 * Author: Borislav Manolov
 */
$(function() {
	var parents = {
		// skin : parent element ID
		'standard' : 'searchform',
		'nostalgia' : 'specialpages',
		'cologneblue': 'langlinks',
		'monobook': 'pt-userpage',
		'myskin' : 'pt-userpage',
		'chick' : 'siteSub',
		'simple' : 'pt-userpage',
		'modern' : 'pt-userpage',
		'vector' : 'pt-userpage'
	};
	var skin = mw.user.options.get('skin');
	if ( !parents[skin] ) {
		return; // unsupported skin
	}
	var parent = $("#"+parents[skin]);
	if (parent.length === 0 && skin == 'vector') {
		parent = $('#p-personal ul:first');
	}
	if (parent.length === 0) {
		return;
	}

	var quickPage = 'Бързи връзки';
	var page = 'User:' + mw.config.get('wgUserName') +'/' + quickPage;
	var plus = '+', minus = '&minus;', wait = '…';
	var container = null;
	var loaded = false;
	var link = $('<a>', {
		href: mw.util.getUrl(page),
		text: plus,
		title: 'Показване на бързите връзки'
	});

	function showContainer(content) {
		if ( container === null ) {
			container = createContainer();
			$(document.body).append(container.e);
		}
		container.set('<div class="editsection" style="float:right">[<a href="'
			+ mw.config.get('wgScript') + '?' + $.param({ action: 'edit', title: page })
			+ '" title="Редактиране на страницата с бързите връзки">'
			+ 'редактиране</a>]</div>');
		container.add( content.indexOf('emptypage') != -1
			? '<em>Страницата ви с бързи връзки е празна.</em>'
			: content);
		link.html(minus);
	}

	function createContainer() {
		return {
			e : $('<div id="myquicklinks" class="messagebox" style="position: absolute; top: 3em; left: 5%; z-index: 10; overflow: auto; width: 90%; padding: 1em"/>')
				.on('click', function(event) { 
					event.stopPropagation();
				}),
			show : function() {
				this.e.show();
				link.html(minus);
			},
			hide : function() {
				this.e.hide();
				link.html(plus);
			},
			toggle : function() {
				this.e.is(':visible') ? this.hide() : this.show();
			},
			set : function(content) {
				this.e.html(content);
			},
			add : function(content) {
				this.e.html(this.e.html() + content);
			}
		};
	}

	link.on("click", function(event) {
		event.stopPropagation();
		if ( loaded ) {
			container.toggle();
			return false;
		}
		link.html(wait);
		$.get(mw.config.get('wgScript'), {"title": page.replace(/ /g, "_"), "action": "render"}, function(content){
			showContainer(content);
			loaded = true;
		});
		return false;
	});

	var $item = $('<li id="pt-quicklinks"></li>').append(link);
	if (parent.is('li')) {
		$item.insertAfter(parent);
	} else if (parent.is('ul')) { // vector with compact user menu
		$item.prependTo(parent);
		mw.util.addCSS('\
			#pt-quicklinks {\
				line-height: 2em !important;\
			}\
			#pt-quicklinks > a {\
				color: #888;\
				display: block;\
				font-size: 1.8em;\
				font-weight: bold;\
				text-decoration: none;\
			}\
		');
	}
	$(document.body).on("click", function() {
		// hide container by clicking anywhere in the document
		if (container) container.hide();
	});
});