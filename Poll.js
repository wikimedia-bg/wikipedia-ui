/**
	Simple poll manager.
	Uses wiki pages as poll database.
	@uses Mwbot ([[Потребител:Borislav/mwbot.js]])
	@uses Creator
 
	License: Public domain
	Author: Borislav Manolov
*/

function showPolls() {
	var polls = getElementsByClassName(document, "div", "wikipoll");
	for (var i = 0; i < polls.length ; i++) {
		createPoll(polls[i]);
	}
}

var pollMsgs = {
	"comment-label" : "Коментар:",
	"vote-button"   : "Гласуване",
	"no-answer"     : "Не сте избрали отговор!",
	"reslink"       : "[Резултати]",
	"reslink-title" : "Преглед на резултата от гласуването",
	"load-img"      : "http://upload.wikimedia.org/wikipedia/commons/4/42/Loading.gif",
	"load-img-alt"  : "…"
};

function createPoll(pollElem) {
	var pollName = wgDBname + "-poll-" + pollElem.id;
	if ( Cookie.read(pollName) !== null ) {
		// already voted, do not spam user again
		pollElem.style.display = "none";
		return;
	}
	Cookie.create(pollName, 1, 360);

	var page = pollElem.getElementsByTagName("p")[0];
	var list = pollElem.getElementsByTagName("ul")[0];
	page.style.display = "none";
	list.style.display = "none";
	var pageName = page.textContent.trim();
	var items = list.getElementsByTagName("li");
	var data = new Array();
	for (var i = 0; i < items.length; i++) {
		var content = items[i].textContent.trim();
		data[pollName + i] = [i+1, content];
	}

	pollElem.appendChild( Creator.createRadios(pollName, data, "") );
	pollElem.appendChild( createPollComment(pollName) );
	pollElem.appendChild( createPollButton(pollElem, pollName, pageName) );
}

function createPollComment(pollName) {
	var id = pollName + "comment";
	var t = Creator.createTextarea(id);
	var l = Creator.createLabel(id, pollMsgs["comment-label"]);
	return Creator.createElement("div", {}, [l, t]);
}

function createPollButton(pollElem, pollName, pageName) {
	var button = Creator.createButton(pollMsgs["vote-button"]);
	button.onclick = function() {
		var radioValue = getRadioValue(pollName);
		if (radioValue === null) {
			alert(pollMsgs["no-answer"]);
			return;
		}
		function appendVote(bot) {
			var comment = document.getElementById(pollName+"comment").value;
			comment = comment.replace(/\n/g, "<br/>");
			bot.append_page_content("# " + comment + " — — [[Потребител:Borislav|Борислав]] 10:35, 2 август 2008 (UTC)");
		}

		function showResults(bot) {
			var l = Creator.createAnchor(Creator.createInternUrl(pageName),
				pollMsgs["reslink"], pollMsgs["reslink-title"]);
			pollElem.replaceChild(l, button);
		}
		var loadInd = Creator.createImage(pollMsgs["load-img"], pollMsgs["load-img-alt"], "");
		this.appendChild(loadInd);
		this.disabled = true;
		var bot = new Mwbot();
		bot.set_section(radioValue);
		bot.register_hook('do_edit', appendVote);
		bot.register_hook('on_submit', showResults);
		bot.edit(pageName);
	};
	return button;
}

function getRadioValue(name) {
	var radios = document.getElementsByTagName("input");
	for (var i = 0, len = radios.length; i < len; i++) {
		if ( radios[i].name == name && radios[i].checked ) {
			return radios[i].value;
		}
	}
	return null;
}

addOnloadHook(showPolls);