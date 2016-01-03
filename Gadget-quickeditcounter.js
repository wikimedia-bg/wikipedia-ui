// Преработена версия от https://www.wikidata.org/wiki/MediaWiki:Gadget-quickeditcounter.js
window.qecGadget = {
	init: function () {
		if (mw.config.get('wgNamespaceNumber') !== 2 && mw.config.get('wgNamespaceNumber') !== 3 ) return;
		if (mw.util.getParamValue('printable') === 'yes') return;

		this.username = mw.config.get('wgTitle').replace(/\/.*$/, '');
		var that = this;
		
		var api = new mw.Api();
		api.get({
			action: 'query',
			list: 'users',
			usprop: 'editcount|gender',
			ususers: this.username,
			requestid: new Date().getTime()
		}).done(function (result) {
			if (result) {
				jQuery(document).ready(function () {
					that.showResults(result);
				});
			}
		});
	},

	showResults: function (data) {
		data = data.query.users[0];
		if (!data || data.name !== this.username || data.invalid || data.editcount === undefined) return;

		var firstHeading;
		var headers = document.getElementsByTagName('h1');

		for (var i = 0; i < headers.length; i++) {
			var header = headers[i];
			if (header.className === 'firstHeading' || header.id === 'firstHeading' || header.className === 'pagetitle') {
				firstHeading = header; 
				break;
			}
		}

		if (!firstHeading) firstHeading = document.getElementById('section-0');
		if (!firstHeading) return;

		var url = '//tools.wmflabs.org/xtools-ec/?' + $.param({
			user: this.username,
			project: mw.config.get('wgServerName')
		} );

		function format(num){
		    var n = num.toString(), p = n.indexOf('.');
		    return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function($0, i){
		        return p<0 || i<p ? ($0+' ') : $0;
		   });
		}

		var html = data.gender === 'female' ?  'Потребителката е направила' : 'Потребителят е направил';
		html += ' <a href="' + url + '">' + format(data.editcount) + '</a> редакции.';

		var div = document.createElement('div');
		div.style.cssText = 'font-size:0.5em;line-height:1em';
		div.className = 'plainlinks';
		div.innerHTML = html;

		if (mw.config.get('skin') === 'modern') {
			div.style.marginLeft = '10px';
			div.style.display = 'inline-block';
		}

		firstHeading.appendChild(div);
	}
};

qecGadget.init();