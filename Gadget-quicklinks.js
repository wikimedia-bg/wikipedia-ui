/**
	Simple quick links viewer
	@uses Mwbot ([[Потребител:Borislav/mwbot.js]])
	@uses Creator

	License: Public domain
	Author: Borislav Manolov
*/

importScript('Потребител:Borislav/mwbot.js');

var showQuickLink = (function() {
	var quickPage = 'Бързи връзки';
	var page = 'User:' + wgUserName +'/' + quickPage;
	var parents = {
		// skin : parent element ID
		'standard' : 'searchform',
		'nostalgia' : 'specialpages',
		'cologneblue': 'langlinks',
		'monobook': 'pt-userpage',
		'myskin' : 'pt-userpage',
		'chick' : 'siteSub',
		'simple' : 'pt-userpage',
		'modern' : 'pt-userpage'
	};
	var plus = '+', minus = '&minus;', wait = '…';
	var link, container = null;
	var loaded = false;

	function showContainer(content) {
		if ( container === null ) {
			container = createContainer();
			document.getElementsByTagName('body')[0].appendChild(container.e);
		}
		container.set('<div class="editsection" style="float:right">[<a href="'
			+ Creator.createInternUrl(page, 'edit')
			+ '" title="Редактиране на страницата с бързите връзки">'
			+ 'редактиране</a>]</div>');
		container.add( content.indexOf('emptypage') != -1
			? '<em>Страницата ви с бързи връзки е празна.</em>'
			: content);
		link.innerHTML = minus;
	}

	function createContainer() {
		var c = {
			e : Creator.createElement('div', {
				'id' : 'myquicklinks',
				'class' : 'messagebox',
				'style' : 'position: absolute; top: 3em; left: 3em; z-index: 10; overflow: auto; width: 90%; padding: 1em'
			}),
			show : function() {
				this.e.style.display = '';
				link.innerHTML = minus;
			},
			hide : function() {
				this.e.style.display = 'none';
				link.innerHTML = plus;
			},
			toggle : function() {
				this.isHidden() ? this.show() : this.hide();
				this.isJustToggled = true;
			},
			isJustToggled : false,
			set : function(content) {
				this.e.innerHTML = content;
			},
			add : function(content) {
				this.e.innerHTML += content;
			},
			isHidden : function() {
				return this.e.style.display == 'none';
			}
		};
		c.e.onclick = function(event) { event.stopPropagation(); };
		return c;
	}

	function showFullContainer(bot) {
		showContainer(bot.page_content);
		loaded = true;
	}

	function showEmptyContainer(bot) {
		showContainer('Бързите връзки не можаха да бъдат заредени.');
	}


	return (function() {
		if ( typeof parents[skin] == "undefined" ) {
			return; // unsupported skin
		}
		var p = document.getElementById(parents[skin]);
		if ( !p ) {
			alert('В текущия документ не съществува елемент с ID „'+p+'“. Контролерът на бързите връзки не може да бъде зареден.');
			return;
		}
		link = Creator.createAnchor( Creator.createInternUrl(page),
			plus, 'Показване на бързите връзки');
		link.onclick = function(event) {
			event.stopPropagation();
			if ( loaded ) {
				container.toggle();
				return false;
			}
			link.innerHTML = wait;
			var bot = new Mwbot();
			bot.register_hook('on_fetch', showFullContainer);
			bot.register_hook('on_fetch_fail', showEmptyContainer);
			bot.fetchHtml(page);
			return false;
		};

		var c = Creator.createElement('span',
			{'style' : 'z-index: 11'},
			[' (', link, ')']);
		p.appendChild(c);
		document.getElementsByTagName("body")[0].onclick = function() {
			// hide container by clicking anywhere in the document
			if (container) container.hide();
		};
	});

})();

addOnloadHook(showQuickLink);