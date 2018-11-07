
if(typeof(MonobookToolbar)!="undefined"){

/************************************* Insérer ici les boutons standards *************************************/
//<nowiki>

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/e/e2/Button_bold.png", "Texte en gras", "'''", "'''", "texte en gras", "mw-editbutton-bold");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/1/1d/Button_italic.png", "Texte en italique", "''", "''", "texte en italique", "mw-editbutton-italic");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/f/fd/Button_underline.png", "Texte souligné", "<u>", "</u>", "texte souligné", "mw-editbutton-underline");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/3/30/Btn_toolbar_rayer.png", "Texte barré", "<s>", "</s>", "texte barré", "mw-editbutton-strike");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/6/6a/Button_sup_letter.png", "Texte en exposant", "<sup>", "</sup>", "texte en exposant", "mw-editbutton-sup");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/a/aa/Button_sub_letter.png", "Texte en indice", "<sub>", "</sub>", "texte en indice", "mw-editbutton-sub");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/8/89/Button_bigger.png", "Texte en grand", "<big>", "</big>", "texte en grand", "mw-editbutton-big");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/0/0d/Button_smaller.png", "Texte en petit", "<small>", "</small>", "texte en petit", "mw-editbutton-small");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/7/78/Button_head_A2.png", "Chapitre de niveau 2", "== ", " ==", "Nom du chapitre", "mw-editbutton-headline");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/4/4f/Button_head_A3.png", "Chapitre de niveau 3", "=== ", " ===", "Nom du chapitre", "mw-editbutton-headline3");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/1/14/Button_head_A4.png", "Chapitre de niveau 4", "==== ", " ====", "Nom du chapitre", "mw-editbutton-headline4");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/8/8c/Button_head_A5.png", "Chapitre de niveau 5", "===== ", " =====", "Nom du chapitre", "mw-editbutton-headline5");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/c/c0/Button_link.png", "Lien interne", "[[", "]]", "titre de la page", "mw-editbutton-link");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/e/ec/Button_extlink.png", "Lien externe", "[", "]", "http://www.example.com titre du lien", "mw-editbutton-extlink");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/b/b4/Button_category03.png", "Catégorie", '[[Catégorie:', "]]", 'nom de la catégorie', "mw-editbutton-category");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/3/3b/Button_template_alt.png", "Modèle", '{{', "}}", 'modèle ou page à inclure', "mw-editbutton-template");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/1/1b/Button_hide_wiki_tag.png", "Commentaire caché", "<!-- ", " -->", "commentaire caché", "mw-editbutton-comment");

MonobookToolbar.functions.CreateButton('//upload.wikimedia.org/wikipedia/commons/8/88/Btn_toolbar_enum.png', "Énumération", "\n# élément 1\n# élément 2\n# élément 3", "", "", "mw-editbutton-enum");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/1/11/Btn_toolbar_liste.png", "Liste", '\n* élément A\n* élément B\n* élément C', "", "", "mw-editbutton-liste");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/d/de/Button_image.png", "Image", "[[Fichier:", "|thumb|Description de l'image.]]", "Exemple.jpg", "mw-editbutton-image");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/1/19/Button_media.png", "Média", "[[Fichier:", "|thumb|Description du média.]]", "Exemple.ogg", "mw-editbutton-media");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/9/9e/Btn_toolbar_gallery.png", "Galerie d'images", "\n<gallery>\nExemple.jpg|[[Tournesol]]\nExemple1.jpg|[[La Joconde]]\nExemple2.jpg|Un [[hamster]]\n</gallery>\n{{message galerie}}", "", "", "mw-editbutton-gallery");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/5/5b/Math_icon.png", "Expression mathématique (format LaTeX)", "<math>", "</math>", "\\rho=\\sqrt{x_0^2+y_0^2}", "mw-editbutton-math");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/8/82/Nowiki_icon.png", "Ignorer le format wiki", "<nowiki"+">", "</"+"nowiki>", "", "mw-editbutton-nowiki");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/6/6d/Button_sig.png", "Signature datée", "-- ~~"+"~~", "", "", "mw-editbutton-signature");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/0/0d/Button_hr.png", "Ligne horizontale", "--"+"--", "", "", "mw-editbutton-hr");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/c/c8/Button_redirect.png", "Redirection", "#REDIRECT[[", "]]", "nom de la destination", "mw-editbutton-redirect");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/0/04/Button_array.png", "Tableau", "{| class=\"wikitable\"\n|", "\n|}", "-\n! titre 1\n! titre 2\n! titre 3\n|-\n| rangée 1, case 1\n| rangée 1, case 2\n| rangée 1, case 3\n|-\n| rangée 2, case 1\n| rangée 2, case 2\n| rangée 2, case 3", "mw-editbutton-table");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/1/13/Button_enter.png", "Saut de ligne", "<br/>", "", "", "mw-editbutton-br");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/c/c4/Button_ref.png", "Référence", "<ref>", "</ref>", "référence, citation ou lien", "mw-editbutton-ref");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/6/64/Buttonrefvs8.png", "Index des références", '== Notes et références ==\n{{Références}}', "", "", "mw-editbutton-references");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/b/bb/Seealso.png", "Section Annexes", '== Notes et références ==\n{{Références}}\n\n== Annexes ==\n=== Articles connexes ===\n* [[À remplacer]]\n\n=== Liens externes ===\n*\n\n=== Bibliographie ===\n* [[À remplacer]]\n\n', "", "", "mw-editbutton-voiraussi");


//</nowiki>
/************************************* Fin des boutons standards *************************************/

}  // Fin test anti-double inclusion
