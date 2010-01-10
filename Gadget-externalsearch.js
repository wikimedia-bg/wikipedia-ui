importOuterScript("MediaWiki:Gadget-externalsearch.js", "en");
if (wgCanonicalNamespace == "Special" && wgCanonicalSpecialPageName == "Search") {
	jQuery(function(){
		if (window.SpecialSearchEnhanced) {
			SpecialSearchEnhanced();
		}
	});
}