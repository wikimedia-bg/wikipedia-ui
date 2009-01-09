addOnloadHook(function(){
	var cats = document.getElementById("catlinks");
	if ( !cats ) return;
	document.getElementById("contentSub").appendChild( cats.cloneNode(true) );
});