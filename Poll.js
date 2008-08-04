/**
	Simple poll manager.
	Uses wiki pages as poll “databases”.
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

function createPoll(pollElem) {
	var pollName = wgDBname + "-poll-" + pollElem.id;
	var page = pollElem.getElementsByTagName("p")[0];
	var pageName = page.textContent.trim();

	if ( Cookie.read(pollName) !== null ) {
		// already voted, do not spam user again
		pollElem.innerHTML = gLang.msg("poll-already-voted");
		pollElem.appendChild( createPollResultsLink(pageName) );
		pollElem.innerHTML += ".";
		return;
	}

	var list = pollElem.getElementsByTagName("ul")[0];
	var items = list.getElementsByTagName("li");
	var data = new Array();
	for (var i = 0; i < items.length; i++) {
		var content = items[i].textContent.trim();
		data[pollName + i] = [i+1, content];
	}

	list.style.display = "none";
	page.style.display = "none";

	pollElem.appendChild( Creator.createRadios(pollName, data, "") );
	pollElem.appendChild( createPollComment(pollName) );
	pollElem.appendChild( createPollButton(pollElem, pollName, pageName) );
}

function createPollComment(pollName) {
	var id = pollName + "comment";
	var t = Creator.createTextarea(id);
	var l = Creator.createLabel(id, gLang.msg("poll-comment-label"));
	return Creator.createElement("div", {}, [l, t]);
}

function createPollButton(pollElem, pollName, pageName) {
	var button = Creator.createButton(gLang.msg("poll-vote-button"));
	button.onclick = function() {
		var radioValue = getRadioValue(pollName);
		if (radioValue === null) {
			alert(gLang.msg("poll-no-answer"));
			return;
		}
		function appendVote(bot) {
			var comment = document.getElementById(pollName+"comment").value;
			comment = comment.replace(/\n/g, "<br/>");
			bot.append_page_content("# " + comment + " — ~~"+"~~");
			Cookie.create(pollName, 1, 360);
		}

		function showResults(bot) {
			var msg = Creator.createElement("span", {}, gLang.msg("poll-resmsg"));
			msg.appendChild(createPollResultsLink(pageName));
			msg.innerHTML += ".";
			pollElem.replaceChild(msg, button);
		}
		var loadInd = Creator.createImage(gLang.msg("poll-load-img"), gLang.msg("poll-load-img-alt"), "");
		this.appendChild(loadInd);
		this.disabled = true;
		var bot = new Mwbot();
		bot.set_section(radioValue);
		bot.register_hook('do_edit', appendVote);
		bot.register_hook('on_submit', showResults);
		bot.edit(pageName + gLang.msg("poll-respagesuff"));
	};
	return button;
}

function createPollResultsLink(pageName) {
	return Creator.createAnchor(Creator.createInternUrl(pageName),
		gLang.msg("poll-reslink"), gLang.msg("poll-reslink-title"));
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