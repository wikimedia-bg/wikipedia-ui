gLang.addMessages({
	"p-createnew" : "Нова страница",
	"action-create" : "Създаване"
}, "bg");
gLang.addMessages({
	"p-createnew" : "Create New Page",
	"action-create" : "Create"
}, "en");

$(document).ready(function(){
	var psearch = $("#p-search");
	if (!psearch.length) {
		return;
	}

	var header = $('<h3>', {text: gLang.msg("p-createnew")});
	var form = $('<form>', {
		action: wgScript,
		id: "createform",
		html: '<input type="hidden" name="action" value="edit">'
			+ '<input type="text" name="title" id="createPageInput">'
			+ '<input type="submit" class="searchButton" value="'+gLang.msg("action-create")+'">'
	});
	var box = $('<div>', {'class': 'pBody', html: form});
	var portlet = $('<div>', {'class': 'portlet', 'id': 'p-create'}).append(header, box);
	psearch.after(portlet);
});