mw.libs.addCreatePageForm = function() {
	var psearch = $('#p-search');
	if (!psearch.length) {
		return;
	}
	var messages = {
		bg: {
			'p-createnew' : 'Нова страница',
			'action-create' : 'Създаване'
		},
		en: {
			'p-createnew' : 'Create New Page',
			'action-create' : 'Create'
		}
	};
	mw.messages.set(messages[mw.config.get('wgUserLanguage')] || messages.en);

	var header = $('<h3>', {text: mw.msg('p-createnew')});
	var form = $('<form>', {
		action: mw.config.get('wgScript'),
		id: 'createform',
		html: '<input type="hidden" name="action" value="edit">'
			+ '<input type="text" name="title" id="createPageInput">'
			+ '<input type="submit" class="searchButton" value="'+mw.msg('action-create')+'">'
	});
	var box = $('<div>', {'class': 'pBody', html: form});
	var portlet = $('<div>', {'class': 'portlet', 'id': 'p-create'}).append(header, box);
	psearch.after(portlet);
};

$(mw.libs.addCreatePageForm);