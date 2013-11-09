/**
 * Simple quick links viewer
 *
 * License: Public domain
 * Author: Borislav Manolov
 */
mw.hook('wikipage.content').add(function() {
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
	if ( !parents[mw.user.options.get('skin')] ) {
		return; // unsupported skin
	}
	var p = $("#"+parents[mw.user.options.get('skin')]);
	if ( !p.length ) {
		alert('В текущия документ не съществува елемент с ID „'+p+'“. Контролерът на бързите връзки не може да бъде зареден.');
		return;
	}

	var quickPage = 'Бързи връзки';
	var page = 'User:' + mw.config.get('wgUserName') +'/' + quickPage;
	var plus = '+', minus = '&minus;', wait = '…';
	var container = null;
	var loaded = false;
	var link = $('<a>', {
		href: mw.util.wikiGetlink(page),
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

	$('<span style="z-index: 11"/>').append(' (', link, ')').appendTo(p);
	$(document.body).on("click", function() {
		// hide container by clicking anywhere in the document
		if (container) container.hide();
	});
});