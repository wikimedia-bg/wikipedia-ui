/* Embed an OSM map on div id="osmEmbed" exists
 * This script is loaded by https://toolserver.org/~geohack/, see also [[Vorlage:GeoTemplate]]
 */
var OSM_class_R = /\bOSM:([\d.+-]+)_([\d.+-]+)_([\d.+-]+)_(\w+)/;
function embedOpenStreetMap() {
    clearInterval(osmtimer);
    var osmTarget = document.getElementById('osmEmbed');
    if(osmTarget && OSM_class_R.exec(osmTarget.className)){
        var lat=1.0*RegExp.$1, lon=1.0*RegExp.$2, zoom=RegExp.$3;
        var span = 360.0/(512.0*Math.pow(2,zoom))*720/2;  //WTF?
        iframe = document.createElement('iframe');
        iframe.frameBorder = 0; // IE 6
        iframe.scrolling = 'no';
        iframe.src = "//toolserver.org/~kolossos/openlayers/embed.html?layer="+RegExp.$4+"&bbox=" + 
            (lon-span*Math.cos(lat*.0175))+','+(lat-span/2)+','+(lon+span*Math.cos(lat*.0175))+','+(lat+span/2)+
            "&marker="+lat+','+lon;
        iframe.height = osmTarget.clientHeight+'px';
        iframe.width = osmTarget.clientWidth+'px';
        iframe.style.position = "relative";
        osmTarget.appendChild(iframe);
    }
}
osmtimer = setInterval("if(document.getElementById('osmEmbed'))embedOpenStreetMap()", 200)
setTimeout('clearInterval(osmtimer)', 5000)