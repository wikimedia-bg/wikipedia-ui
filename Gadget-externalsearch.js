importOuterScript("MediaWiki:Gadget-externalsearch.js", "en");
if (wgCanonicalNamespace == "Special" && wgCanonicalSpecialPageName == "Search") {
	addOnloadHook(SpecialSearchEnhanced);
}