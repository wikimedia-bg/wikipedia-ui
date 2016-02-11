/* Purge caption button */
$(function () {
   var hist; var url;
   if (!(hist = document.getElementById('ca-history') )) return;
   if (!(url = hist.getElementsByTagName('a')[0] )) return;
   if (!(url = url.href )) return;
   mw.util.addPortletLink('p-cactions', url.replace(/([?&]action=)history([&#]|$)/, '$1purge$2'),
                  '*', 'ca-purge', 'Изчистване на складираното копие на страницата', '*');
});