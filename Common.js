/*

проба, колкото да видя, наистина ли взема пред вид този файл

*/

 /** "Technical restrictions" title fix *****************************************
  *
  *  Description:
  *  Maintainers: [[:en:User:Interiot]], [[:en:User:Mets501]]
  */
 
 // For pages that have something like Template:Lowercase, replace the title, but only if it is cut-and-pasteable as a valid wikilink.
 //	(for instance [[iPod]]'s title is updated.  <nowiki>But [[C#]] is not an equivalent wikilink, so [[C Sharp]] doesn't have its main title changed)</nowiki>
 //
 // The function looks for a banner like this: <nowiki>
 // <div id="RealTitleBanner">    <!-- div that gets hidden -->
 //   <span id="RealTitle">title</span>
 // </div>
 // </nowiki>An element with id=DisableRealTitle disables the function.
 var disableRealTitle = 0;		// users can disable this by making this true from their monobook.js
 if (wgIsArticle) {			// don't display the RealTitle when editing, since it is apparently inconsistent (doesn't show when editing sections, doesn't show when not previewing)
     addOnloadHook(function() {
 	try {
 		var realTitleBanner = document.getElementById("RealTitleBanner");
 		if (realTitleBanner && !document.getElementById("DisableRealTitle") && !disableRealTitle) {
 			var realTitle = document.getElementById("RealTitle");
 			if (realTitle) {
 				var realTitleHTML = realTitle.innerHTML;
 				realTitleText = pickUpText(realTitle);
 
 				var isPasteable = 0;
 				//var containsHTML = /</.test(realTitleHTML);	// contains ANY HTML
 				var containsTooMuchHTML = /</.test( realTitleHTML.replace(/<\/?(sub|sup|small|big)>/gi, "") ); // contains HTML that will be ignored when cut-n-pasted as a wikilink
 				// calculate whether the title is pasteable
 				var verifyTitle = realTitleText.replace(/^ +/, "");		// trim left spaces
 				verifyTitle = verifyTitle.charAt(0).toUpperCase() + verifyTitle.substring(1, verifyTitle.length);	// uppercase first character
 
 				// if the namespace prefix is there, remove it on our verification copy.  If it isn't there, add it to the original realValue copy.
 				if (wgNamespaceNumber != 0) {
 					if (wgCanonicalNamespace == verifyTitle.substr(0, wgCanonicalNamespace.length).replace(/ /g, "_") && verifyTitle.charAt(wgCanonicalNamespace.length) == ":") {
 						verifyTitle = verifyTitle.substr(wgCanonicalNamespace.length + 1);
 					} else {
 						realTitleText = wgCanonicalNamespace.replace(/_/g, " ") + ":" + realTitleText;
 						realTitleHTML = wgCanonicalNamespace.replace(/_/g, " ") + ":" + realTitleHTML;
 					}
 				}
 
 				// verify whether wgTitle matches
 				verifyTitle = verifyTitle.replace(/^ +/, "").replace(/ +$/, "");		// trim left and right spaces
 				verifyTitle = verifyTitle.replace(/_/g, " ");		// underscores to spaces
 				verifyTitle = verifyTitle.charAt(0).toUpperCase() + verifyTitle.substring(1, verifyTitle.length);	// uppercase first character
 				isPasteable = (verifyTitle == wgTitle);
 
 				var h1 = document.getElementsByTagName("h1")[0];
 				if (h1 && isPasteable) {
 					h1.innerHTML = containsTooMuchHTML ? realTitleText : realTitleHTML;
 					if (!containsTooMuchHTML)
 						realTitleBanner.style.display = "none";
 				}
 				document.title = realTitleText + " - Wikipedia, the free encyclopedia";
 			}
 		}
 	} catch (e) {
 		/* Something went wrong. */
 	}
     });
 }
 
 
 // similar to innerHTML, but only returns the text portions of the insides, excludes HTML
 function pickUpText(aParentElement) {
   var str = "";
 
   function pickUpTextInternal(aElement) {
     var child = aElement.firstChild;
     while (child) {
       if (child.nodeType == 1)		// ELEMENT_NODE 
         pickUpTextInternal(child);
       else if (child.nodeType == 3)	// TEXT_NODE
         str += child.nodeValue;
 
       child = child.nextSibling;
     }
   }
 
   pickUpTextInternal(aParentElement);
 
   return str;
 }

//<source lang="javascript">

/***** LicenseChecker ********
 * checks whether the selected license on Special:Upload is valid
 * and provides feedback
 *
 * Maintainer: [[User:Dschwen]]
 ****/

var licenseChecker =
{
 //
 // List of invalid licenses
 //
 invalid : [ "subst:nld", 
             "subst:template 2|cc-by-nc-sa-2.0|flickrreview", 
             "subst:template 2|flickrreview|subst:nld" ],

 //
 // Translations of the warning message
 //
 i18n :
 {
  'de': 'Die ausgew&auml;hlte <b>Lizenz ist nicht akzeptabel f&uuml;r Wikimedia Commons</b>. Dein <b>Upload wird gel&ouml;scht</b> werden!',
  'en': 'The selected licensing is <b>unacceptable on Wikimedia Commons</b> and will lead to the <b>deletion</b> of your upload!'
 },

 licensemenu : null,
 warnbanner  : null,
 message : '',

 // Event handler for the license selector
 check : function()
 {
  with(licenseChecker) {

   for( var n in invalid )
    if( licensemenu.value == invalid[n] )
    {
     warnbanner.innerHTML = message;
     return;
    }

   warnbanner.innerHTML = '';
  }
 },

 install : function()
 {
  if(window.location.href == "http://bg.wikipedia.org/wiki/Special:Upload")
  { 
   with(licenseChecker) {
    warnbanner = document.createElement('DIV');
    warnbanner.className = 'center';
    warnbanner.style.color = 'red';
    warnbanner.style.background = '#eeeeee';

    var uploadtext  = document.getElementById('uploadtext');
    // Check for skins not providing the uploadtext ID
    if( typeof(uploadtext) == 'undefined' ) return;
    uploadtext.appendChild( warnbanner );

    if( typeof(i18n[wgUserLanguage]) == 'string' ) 
     message = i18n[wgUserLanguage];
    else 
     message = i18n.en;

    licensemenu = document.getElementById('wpLicense');
    addEvent( licensemenu , 'change', check );
   } 
  }
 }
}
addOnloadHook( licenseChecker.install );


/***** loadAutoInformationTemplate ********
 * Adds a link to subpages of current page
 *
 *  Maintainers: [[User:Yonidebest]], [[User:Dschwen]]
 *
 *  JSconfig items: bool JSconfig.loadAutoInformationTemplate 
 *                       (true=enabled (default), false=disabled)
 ****/

function loadAutoInformationTemplate()
{
 
 if( !JSconfig.loadAutoInformationTemplate || // honor user configuration
   document.location.href.toString().match("&wpDestFile=")) //Don't show when reuploading
  return;
 
 uploadDescription = document.getElementById('wpUploadDescription');
 var tripleTilda = '~~' + '~';
 var doubleBracket = '{' + '{';
 if(uploadDescription != null && wgUserLanguage != 'fromflickr' && wgUserLanguage != 'fromwikimedia' && wgUserLanguage != 'fromgov'
    && uploadDescription.value == '' ) {
  switch(wgUserLanguage) {
   case "ownwork":
    uploadDescription.value = doubleBracket + 'Information\n|Description=\n|Source=self-made\n|Date=\n|Author= [[User:' + wgUserName + '|' + wgUserName + ']]\n}}\n';
    break;
   /* don't put fromflickr, as people should use flinfo tool */
   /* don't put fromwikimedia, as people should use commons helper tool */
   case "fromgov":
    uploadDescription.value = doubleBracket + 'Information\n|Description=\n|Source=\n|Date=\n|Author=\n}}\n';
    break;
   default:
    uploadDescription.value = doubleBracket + 'Information\n|Description=\n|Source=\n|Date=\n|Author=\n|Permission=\n|other_versions=\n}}\n';
    break;
  }
 }
}
addOnloadHook(loadAutoInformationTemplate);

/*
Automatically adds the {{{author}}} attribute when an image
if uploaded under a {{tl|self}} license. It will show as
''I, [[User:foo|]], the copy[...]''.
*/
function attributeSelf()
{
 if (!JSconfig.attributeSelf) return;
 var licenses = document.getElementById('wpLicense');
 for (var i = 0; i < licenses.childNodes.length; i++)
 {
  var license = licenses.childNodes[i];
  if (license.nodeName.toLowerCase() == 'option') 
  {
   if (license.getAttribute('value').substr(0, 5) == 'self|' || 
       license.getAttribute('value') == 'PD-self' ||
       license.getAttribute('value') == 'GFDL-self')
   {
    license.setAttribute('value', license.getAttribute('value') + "|author=I, [[User:" + wgUserName + '|' + wgUserName + "]]");
   }
  }
 }
}
addOnloadHook(attributeSelf);

//</source>