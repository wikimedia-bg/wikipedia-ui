
if(typeof(MonobookToolbar)!="undefined"){

/************************************* Insérer ici les boutons standards *************************************/
//<nowiki>

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/e/e2/Button_bold.png", "Получер текст", "'''", "'''", "получер текст", "mw-editbutton-bold");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/1/1d/Button_italic.png", "Курсивен текст", "''", "''", "курсивен текст", "mw-editbutton-italic");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/c/c0/Button_link.png", "Вътрешна препратка", "[[", "]]", "вътрешна препратка", "mw-editbutton-link");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/e/ec/Button_extlink.png", "Външна препратка", "[", "]", "http://www.example.com външна препратка", "mw-editbutton-extlink");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/7/78/Button_head_A2.png", "Нов раздел", "== ", " ==", "Име на раздел", "mw-editbutton-headline");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/d/de/Button_image.png", "Картинка", "[[Файл:", "|мини|Описание на картинката]]", "Exemple.jpg", "mw-editbutton-image");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/1/19/Button_media.png", "Медия", "[[Файл:", "|мини|Описание на медийния файл]]", "Exemple.ogg", "mw-editbutton-media");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/5/5b/Math_icon.png", "Математическа формула", "<math>", "</math>", "\\rho=\\sqrt{x_0^2+y_0^2}", "mw-editbutton-math");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/8/82/Nowiki_icon.png", "Игнориране на уики синтаксиса", "<nowiki"+">", "</"+"nowiki>", "", "mw-editbutton-nowiki");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/6/6d/Button_sig.png", "Подпис с дата", "-- ~~"+"~~", "", "", "mw-editbutton-signature");

MonobookToolbar.functions.CreateButton("//upload.wikimedia.org/wikipedia/commons/0/0d/Button_hr.png", "Хоризонтална линия", "--"+"--", "", "", "mw-editbutton-hr");

//</nowiki>
/************************************* Fin des boutons standards *************************************/

}  // Fin test anti-double inclusion
