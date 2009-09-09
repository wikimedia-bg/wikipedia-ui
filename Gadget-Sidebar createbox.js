/**
	Add a start new page input box to the sidebar.
	Author: Borislav Manolov
	License: Public domain
*/
gLang.addMessages({
	"p-createnew" : "Нова страница",
	"action-create" : "Създаване"
}, "bg");
gLang.addMessages({
	"p-createnew" : "Create New Page",
	"action-create" : "Create"
}, "en");

addOnloadHook(function(){
	var psearch = document.getElementById("p-search");
	if ( ! psearch || skin != "monobook" ) {
		return;
	}

	var header = Creator.createElement('h5', {}, gLang.msg("p-createnew"));
	var form = Creator.createElement('form', {
		action : wgScript, id: "createform"
	}, Creator.createElement("div", {}, [
		Creator.createHiddenField("action", "edit"),
		Creator.createElement("input", {type: "text", name: "title", id: "createPageInput"}),
		Creator.createElement("input", {type: "submit", "class": "searchButton", value: gLang.msg("action-create")})
	]));
	var box = Creator.createElement('div', {'class' : 'pBody'}, form);
	var portlet = Creator.createElement( 'div',
		{'class' : 'portlet', 'id' : 'p-create'}, [header, box] );
	psearch.parentNode.insertBefore(portlet, psearch.nextSibling);

	os_enableSuggestionsOn("createPageInput", "createform");
});