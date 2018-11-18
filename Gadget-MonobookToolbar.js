
if(typeof(MonobookToolbar)=="undefined"){  // Test anti-double inclusion

var MonobookToolbar = {};
window.MonobookToolbar = MonobookToolbar;

MonobookToolbar.buttons = [];

MonobookToolbar.functions = {};

MonobookToolbar.toolbarId = 'monobooktoolbar';

MonobookToolbar.functions.Init = function($){
   var EntryPoint = document.getElementById("advisorSuggestions");
   if(!EntryPoint) EntryPoint = document.getElementById("editform");
   if(!EntryPoint) return;

   var toolbar = document.getElementById(MonobookToolbar.toolbarId);
   if(!toolbar){
      toolbar = document.createElement('div');
      toolbar.id = MonobookToolbar.toolbarId;
      EntryPoint.parentNode.insertBefore(toolbar, EntryPoint);
   }
   MonobookToolbar.functions.InitButtons();
};

MonobookToolbar.functions.InitButtons = function(){
    for(var a=0,l=MonobookToolbar.buttons.length;a<l;a++){
        MonobookToolbar.functions.InsertButton(a);
    }
};

MonobookToolbar.functions.InsertButton = function(index){
    var parent = document.getElementById(MonobookToolbar.toolbarId);
    var item = MonobookToolbar.buttons[index];
    if(!parent || !item) return false;
    if(item.imageId) {
      var oldImage = document.getElementById(item.imageId);
      if (oldImage) {
        oldImage.parentNode.removeChild(oldImage);
      }
    }
    var image = document.createElement("img");
    image.width = 23;
    image.height = 22;
    if (item.imageId) image.id = item.imageId;
    image.src = item.imageFile;
    image.border = 0;
    image.alt = item.speedTip;
    image.className = "mw-toolbar-editbutton";
    image.title = item.speedTip;
    image.onclick = function() {
        MonobookToolbar.functions.insertTags(item.tagOpen, item.tagClose, item.sampleText);
        return false;
    };
    parent.appendChild(image);
    return true;
};

MonobookToolbar.functions.insertTags = function(tagOpen, tagClose, sampleText){
    var txtarea = document.getElementById("wpTextbox1");
    var selText, isSample = false;

    //save textarea scroll position
    var textScroll = txtarea.scrollTop;
    //get current selection
    txtarea.focus();
    var startPos = txtarea.selectionStart;
    var endPos = txtarea.selectionEnd;
    selText = txtarea.value.substring(startPos, endPos);
    //insert tags
    checkSelectedText();
    txtarea.value = txtarea.value.substring(0, startPos) + tagOpen + selText + tagClose + txtarea.value.substring(endPos, txtarea.value.length);
    //set new selection
    if (isSample) {
        txtarea.selectionStart = startPos + tagOpen.length;
        txtarea.selectionEnd = startPos + tagOpen.length + selText.length;
    } else {
        txtarea.selectionStart = startPos + tagOpen.length + selText.length + tagClose.length;
        txtarea.selectionEnd = txtarea.selectionStart;
    }
    //restore textarea scroll position
    txtarea.scrollTop = textScroll;

    function checkSelectedText(){
        if (!selText) {
            selText = sampleText;
            isSample = true;
        } else if (selText.charAt(selText.length - 1) == ' ') { //exclude ending space char
            selText = selText.substring(0, selText.length - 1);
            tagClose += ' ';
        }
    }
};

MonobookToolbar.functions.CreateButton = function(imageFile, speedTip, tagOpen, tagClose, sampleText, imageId){
    var NewIndex = MonobookToolbar.buttons.length;
    MonobookToolbar.buttons[NewIndex] = {
        "imageId": imageId,
        "imageFile": imageFile,
        "speedTip": speedTip,
        "tagOpen": tagOpen,
        "tagClose": tagClose,
        "sampleText": sampleText
    };
    if(document.getElementById(MonobookToolbar.toolbarId)){
        if(imageId){
            MonobookToolbar.functions.InsertButton(NewIndex);
        }
    }
};

$(MonobookToolbar.functions.Init);

}  // Fin test anti-double inclusion
