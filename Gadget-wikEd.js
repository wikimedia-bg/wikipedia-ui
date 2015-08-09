// Imports [[en:User:Cacycle/wikEd.js]]
// wikEd is a full-featured in-browser editor for Wikipedia, see [[en:User:Cacycle/wikEd]]

// disable loading for IE, not needed, but might save a few milliseconds
if (navigator.appName != 'Microsoft Internet Explorer') {
	mw.loader.load('//en.wikipedia.org/w/index.php?title=User:Cacycle/wikEd.js&action=raw&ctype=text/javascript');
}