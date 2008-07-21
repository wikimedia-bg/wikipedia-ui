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
		'monobook': 'pt-userpage',
		'cologneblue': 'langlinks'
	};
	var parent = parents[skin];
	var plus = '+', minus = '&minus;', wait = '…';

	var showContainer = function(content) {
		quickLinks = Creator.createElement('div', {
			'id' : 'myquicklinks',
			'class' : 'toccolours',
			'style' : 'position: absolute; top: 3em; left: 3em; z-index: 1000; overflow: auto; width: 90%; padding: 1em'
		});
		quickLinks.innerHTML = '<div style="float:right">[<a href="'
			+ Creator.createInternUrl(quickPage, 'edit')
			+ '" title="Редактиране на страницата с бързите връзки">'
			+ 'редактиране</a>]</div>';
		quickLinks.innerHTML += content.indexOf('emptypage') != -1
			? '<em>Страницата ви с бързи връзки е празна.</em>'
			: content;
		document.getElementsByTagName('body')[0].appendChild(quickLinks);
		quickLink.innerHTML = minus;
	};

	var showFullContainer = function(bot) {
		showContainer(bot.page_content);
	}

	var showEmptyContainer = function(bot) {
		showContainer('Бързите връзки не можаха да бъдат заредени.');
	}

	return (function() {
		var p = document.getElementById(parent);
		if ( !p ) {
			alert('В текущия документ не съществува елемент с ID „'+p+'“. Контролерът на бързите връзки не може да бъде зареден.');
			return;
		}

		quickLink = Creator.createAnchor('#', plus, 'Показване на бързите връзки');
		quickLink.onclick = function() {
			if ( quickLinks !== null ) {
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
	
		var c = Creator.createElement('span', {}, [' (', quickLink, ')']);
		p.appendChild(c);
	});

})();

addOnloadHook(showQuickLink);