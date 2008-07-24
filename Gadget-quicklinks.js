/**
	Simple quick links viewer
	@uses Mwbot ([[Потребител:Borislav/mwbot.js]])
	@uses Creator

	License: GNU GPL 2 or later / GNU FDL
	Author: Borislav Manolov
*/

importScript('Потребител:Borislav/mwbot.js');

var showQuickLink = (function() {
	var quickPage = 'Потребител:' + wgUserName +'/Бързи връзки';
	var quickLink = null;
	var quickLinks = null;
	var editLink = null;
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
	var loaded = false;

	var showContainer = function(content) {
		if ( quickLinks === null ) {
			quickLinks = Creator.createElement('div', {
				'id' : 'myquicklinks',
				'class' : 'messagebox',
				'style' : 'position: absolute; top: 3em; left: 3em; z-index: 10; overflow: auto; width: 90%; padding: 1em'
			});
			document.getElementsByTagName('body')[0].appendChild(quickLinks);
		}
		quickLinks.innerHTML = '<div class="editsection" style="float:right">[<a href="'
			+ Creator.createInternUrl(quickPage, 'edit')
			+ '" title="Редактиране на страницата с бързите връзки">'
			+ 'редактиране</a>]</div>';
		quickLinks.innerHTML += content.indexOf('emptypage') != -1
			? '<em>Страницата ви с бързи връзки е празна.</em>'
			: content;
		quickLink.innerHTML = minus;
	};

	var showFullContainer = function(bot) {
		showContainer(bot.page_content);
		loaded = true;
	}

	var showEmptyContainer = function(bot) {
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

		quickLink = Creator.createAnchor( Creator.createInternUrl(quickPage),
			plus, 'Показване на бързите връзки');
		quickLink.onclick = function() {
			if ( loaded ) {
				if ( quickLinks.style.display == 'none' ) {
					quickLinks.style.display = '';
					quickLink.innerHTML = minus;
				} else {
					quickLinks.style.display = 'none';
					quickLink.innerHTML = plus;
				}
				return false;
			}
			quickLink.innerHTML = wait;
			var bot = new Mwbot();
			bot.register_hook('on_fetch', showFullContainer);
			bot.register_hook('on_fetch_fail', showEmptyContainer);
			bot.fetchHtml(quickPage);
			return false;
		};

		var c = Creator.createElement('span',
			{'style' : 'z-index: 11'},
			[' (', quickLink, ')']);
		p.appendChild(c);
	});

})();

addOnloadHook(showQuickLink);