mw.libs.api = mw.libs.api || {};
mw.libs.api.fetchAll = function(params) {
	var api = new mw.Api();
	return (function getResults(params, totalResults) {
		params = params || {};
		$.extend(params, {
			action: 'query'
		});
		api.get(params, { async: false }).done(function(response) {
			var key = params.list || params.prop;
			var results = response.query[key] || response.query.pages;
			if ($.isArray(results)) {
				totalResults = totalResults || [];
				$.merge(totalResults, results);
			} else {
				totalResults = totalResults || {};
				$.extend(totalResults, results);
			}
			if (response['query-continue']) {
				getResults($.extend(params, response['query-continue'][key]), totalResults);
			}
		});
		return totalResults;
	})(params);
};

mw.libs.RegExp = mw.libs.RegExp || {};
mw.libs.RegExp.quote = function(string) {
	return string.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
};

mw.libs.reduceArray = function(array, callback, sleepInterval) {
	if (array.length === 0) {
		return;
	}
	callback(array.shift());
	setTimeout(function() {
		mw.libs.reduceArray(array, callback, sleepInterval);
	}, sleepInterval);
};

mw.libs.pageFromQueryResult = function(result) {
	var page = result.query.pages[Object.keys(result.query.pages)[0]];
	return {
		title: page.title,
		content: page.revisions[0]['*'],
		timestamp: page.revisions[0].timestamp
	};
};

mw.libs.ensureTextFieldPrefix = function(textField, prefix) {
	var currentValue = textField.value;
	if (!currentValue.match(new RegExp('^'+prefix))) {
		textField.value = prefix + currentValue;
	}
};

mw.libs.ensureCursorAtTheEnd = function(textField) {
	var v = textField.value;
	textField.value = '';
	textField.value = v;
};

mw.libs.translateErrorCode = function(code, result) {
	switch (code) {
		case 'http':
			return 'HTTP error: ' + result.textStatus;
		case 'ok-but-empty':
			return 'Empty response from the server';
		case 'articleexists':
			return 'Page exists';
		default:
			return 'API error: ' + code;
	}
};

mw.libs.localizedNamespace = function(canonicalNsName) {
	return mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceIds')[canonicalNsName.toLowerCase()]];
};

// workaround for bug https://phabricator.wikimedia.org/T49395
mw.libs.wikiMsg = function() {
	var textMsg = mw.msg.apply(this, arguments);
	var key = '__bug__'+(new Date().getTime());
	mw.messages.set(key, textMsg);
	return mw.message(key).parse();
}

mw.libs.LogMessage = function(text) {
	var my = this;
	var time = new Date().toLocaleTimeString({}, { hour12: false });
	my.$content = $('<div><tt>'+time+'</tt> &nbsp; <span class="load-icon"></span> &nbsp; '+text+'</div>');
	my.$loadIcon = my.$content.find('.load-icon');
	my.prependTo = function(selector) {
		my.$content.prependTo(selector);
		return my;
	};
	my.appendTo = function(selector) {
		my.$content.appendTo(selector);
		return my;
	};
	my.addText = function(text) {
		my.$content.append(text);
		return my;
	};
	my.loading = function() {
		return setClass('loading');
	};
	my.done = function() {
		return setClass('done');
	};
	my.fail = function(failMsg) {
		return setClass('fail').addText(mw.msg('cm-log-error-separator')).addText(failMsg);
	};
	function setClass(className) {
		my.$loadIcon[0].className = className;
		return my;
	}
};

mw.libs.ProgressBar = function(completeLabel) {
	var my = this;
	my.$content = $('<div class="progress-bar"><div class="progress-label"></div></div>').css({
		'position': 'relative'
	});
	var $label = my.$content.find('.progress-label').css({
		'position': 'absolute',
		'left': '50%',
		'top': '4px',
		'font-weight': 'bold'
	});
	var origDocTitle = document.title;
	my.$content.progressbar({
		value: 0,
		change: function() {
			updateLabel(my.$content.progressbar('value') + '%');
		},
		complete: function() {
			updateLabel(completeLabel || '100%');
		}
	});
	function updateLabel(text) {
		$label.text(text);
		document.title = '['+text+'] ' + origDocTitle;
	}
	my.set = function(value) {
		my.$content.progressbar('value', Math.ceil(parseFloat(value)));
		return my;
	};
	my.prependTo = function(selector) {
		my.$content.prependTo(selector);
		return my;
	};
	my.appendTo = function(selector) {
		my.$content.appendTo(selector);
		return my;
	};
};

mw.libs.CategoryMaster = function() {
	var my = this;
	var api = new mw.Api();

	my.categoryPrefix = mw.libs.localizedNamespace('category') + ':';
	my.editThrottleSecs = 3;

	my.preparePlayField = function() {
		if ($('#cmContainer').length) {
			return;
		}
		var $container = generateContainer().hide()
			.append(generateForm())
			.appendTo('body')
			.fadeIn();
		$('.cm-cat-field').on('keyup', function() {
			mw.libs.ensureTextFieldPrefix(this, my.categoryPrefix);
		}).on('focus', function() {
			mw.libs.ensureCursorAtTheEnd(this);
		});
		$('#cmMoveForm').on('submit', function() {
			my.progressbar = new mw.libs.ProgressBar(mw.msg('cm-progress-done')).appendTo($container);
			my.logWindow = generateLogWindow().appendTo($container);
			my.moveCategory(this.oldCategory.value, this.newCategory.value, this.reason.value);
			return false;
		});
		$('#cmOldCategory').on('change', function() {
			validateInputAndShowInfotip(this, 'successbox', 'errorbox', function(page) {
				return page.missing === '' ? false : true;
			});
		});
		$('#cmNewCategory').on('change', function() {
			validateInputAndShowInfotip(this, 'warningbox', 'successbox', function(page) {
				return true;
			});
		});
		if (mw.config.get('wgCanonicalNamespace') == 'Category') {
			var $oldCatInput = $('#cmOldCategory').val(mw.config.get('wgPageName')).trigger('change');
			markInputAsValid($oldCatInput[0]);
		}
	};

	function validateInputAndShowInfotip(inputField, classByFound, classByNotFound, validator) {
		if (inputField.value.match(/:$/)) { // invalid category name
			markInputAsInvalid(inputField);
			updateFormSubmit(inputField.form);
			return;
		}
		$(inputField).siblings('.cm-infotip').remove();
		var $info = $('<div class="cm-infotip"></div>').hide().insertAfter(inputField);
		fetchCategoryInfo(inputField.value, function(result) {
			var pageId = Object.keys(result.query.pages)[0];
			if (pageId == '-1') {
				$info.addClass(classByNotFound).html(mw.libs.wikiMsg('cm-form-infotip-nonexistant', inputField.value)).fadeIn();
			} else {
				var info = result.query.pages[pageId].categoryinfo;
				$info.addClass(classByFound).html(createCatFoundInfotip(inputField.value, info)).fadeIn();
			}
			if (validator(result.query.pages[pageId])) {
				markInputAsValid(inputField);
			} else {
				markInputAsInvalid(inputField);
			}
			updateFormSubmit(inputField.form);
		});
	}

	function createCatFoundInfotip(categoryName, info) {
		var details = [];
		if (info.subcats) details.push(mw.msg('cm-form-infotip-subcats', info.subcats));
		if (info.pages) details.push(mw.msg('cm-form-infotip-pages', info.pages));
		if (info.files) details.push(mw.msg('cm-form-infotip-files', info.files));
		if (details.length === 0) {
			return mw.libs.wikiMsg('cm-form-infotip-empty', categoryName);
		}
		return mw.libs.wikiMsg('cm-form-infotip', categoryName, details.join(', '));
	}

	function generateForm() {
		return $('<form class="mw-ui-vform" id="cmMoveForm" style="width:100%"/>')
			.append('<div class="mw-ui-vform-field">' + mw.msg('cm-form-intro') + '</div>')
			.append('<div class="mw-ui-vform-field warningbox">' + mw.msg('cm-form-intro-warning') + '</div>')
			.append( $('<div class="mw-ui-vform-field"/>')
				.append('<label for="cmOldCategory">'+mw.msg('cm-form-old-cat')+'</label>')
				.append('<input name="oldCategory" id="cmOldCategory" class="mw-ui-input cm-cat-field" value="'+my.categoryPrefix+'" data-invalid="1">')
			)
			.append( $('<div class="mw-ui-vform-field"/>')
				.append('<label for="cmNewCategory">'+mw.msg('cm-form-new-cat')+'</label>')
				.append('<input name="newCategory" id="cmNewCategory" class="mw-ui-input cm-cat-field" value="'+my.categoryPrefix+'" data-invalid="1">')
			)
			.append( $('<div class="mw-ui-vform-field"/>')
				.append('<label for="cmReason">'+mw.msg('cm-form-reason')+'</label>')
				.append('<input name="reason" id="cmReason" class="mw-ui-input">')
			)
			.append( $('<div class="mw-ui-vform-field"/>')
				.append('<input type="submit" class="mw-ui-button mw-ui-constructive" value="'+mw.msg('cm-form-submit')+'" disabled>')
			)
	}

	function markInputAsValid(inputField) {
		$(inputField).removeAttr('data-invalid');
	}
	function markInputAsInvalid(inputField) {
		$(inputField).attr('data-invalid', 1);
	}
	function updateFormSubmit(form) {
		if ($(form).find('[data-invalid]').length === 0) {
			$(form).find(':submit').removeAttr('disabled');
		} else {
			$(form).find(':submit').attr('disabled', true);
		}
	}

	function generateContainer() {
		return $('<div id="cmContainer"/>').css({
			'position': 'fixed',
			'top': '5%',
			'left': '10%',
			'width': '80%',
			'height': '90%',
			'box-sizing': 'border-box',
			'box-shadow': '0 0 30px #808080',
			'padding': '1em',
			'background-color': 'white',
			'overflow': 'auto',
			'font-size': '9pt',
			'z-index': 1000
		}).append(generateCloseHandle());
	}

	function generateCloseHandle() {
		return $('<a href="#">×</a>').css({
			'position': 'absolute',
			'top': '0.5em',
			'right': '0.5em'
		}).on('click', function() {
			$(this).parent().fadeOut(function() {
				$(this).remove();
			});
			return false;
		}).attr('title', mw.msg('cm-close-window'));
	}

	function generateLogWindow() {
		return $('<div id="cmLog"></div>').css({
			'max-height': '20em',
			'overflow': 'auto',
			'padding': '0.6em 0',
			'line-height': '1.5em'
		});
	}

	function fetchCategoryInfo(category, onResult) {
		api.get({
			action: 'query',
			titles: category,
			prop: 'categoryinfo'
		}).done(function(result) {
			onResult(result);
		});
	}

	my.moveCategory = function(oldCategory, newCategory, reason) {
		oldCategory = oldCategory.replace(/_/g, ' ');
		newCategory = newCategory.replace(/_/g, ' ');
		var msg = my.addLogMessage(mw.libs.wikiMsg('cm-notify-cat', oldCategory, newCategory));
		api.postWithToken('move', {
			action: 'move',
			from: oldCategory,
			to: newCategory,
			reason: mw.msg('cm-move-reason', reason || ''),
			movetalk: true,
			noredirect: true
		}).done(function(response) {
			msg.done();
		}).fail(function(code, result) {
			msg.fail(mw.libs.translateErrorCode(code, result));
		}).always(function() {
			my.fetchCategoryMembersAndMoveThem(oldCategory, newCategory);
		});
	};

	var nbPagesToMove;
	my.fetchCategoryMembersAndMoveThem = function(oldCategory, newCategory) {
		var pages = mw.libs.api.fetchAll({
			list: 'categorymembers',
			cmtitle: oldCategory,
			cmlimit: 500
		});
		nbPagesToMove = pages.length;
		mw.libs.reduceArray(pages, function(page) {
			api.get({
				action: 'query',
				prop: 'revisions',
				rvprop: 'timestamp|content',
				titles: page.title
			}).done(function(result) {
				replaceCategoryInPage(mw.libs.pageFromQueryResult(result), oldCategory, newCategory);
			});
		}, my.editThrottleSecs*1000);
	};

	function replaceCategoryInContent(content, oldCategory, newCategory) {
		var oldCategoryTitle = oldCategory.replace(new RegExp('^'+my.categoryPrefix), '');
		oldCategoryTitle = mw.libs.RegExp.quote(oldCategoryTitle);
		var search = new RegExp('\\[\\[ *('+my.categoryPrefix+'|Category:) *'+oldCategoryTitle+' *([\\]|])', 'gi');
		var replacement = '[['+newCategory+'$2';
		return content.replace(search, replacement);
	}

	var curPageIndex = 0;
	function replaceCategoryInPage(page, oldCategory, newCategory) {
		curPageIndex++;
		var msg = my.addLogMessage(mw.libs.wikiMsg('cm-notify-page', curPageIndex, page.title, newCategory)).loading();

		api.postWithToken('edit', {
			action: 'edit',
			title: page.title,
			summary: mw.msg('cm-summary', oldCategory, newCategory),
			text: replaceCategoryInContent(page.content, oldCategory, newCategory),
			minor: true,
			bot: true,
			watchlist: 'nochange',
			basetimestamp: page.timestamp
		}).done(function(result, jqXHR) {
			msg.done();
			my.progressbar.set(curPageIndex / nbPagesToMove * 100);
		}).fail(function(code, result) {
			msg.fail(mw.libs.translateErrorCode(code, result));
		});
	}

	my.addLogMessage = function(text) {
		return new mw.libs.LogMessage(text).prependTo(my.logWindow);
	};

};

mw.libs.CategoryMaster.dependencies = ['mediawiki.ui', 'mediawiki.ui.input', 'mediawiki.jqueryMsg', 'jquery.ui.progressbar'];

mw.libs.CategoryMaster.messages = {
	'cm-portlet-link': 'Преместване на категория',
	'cm-form-intro': 'Оттук можете да преместите съществуваща категория, като заедно с това и <em>прекатегоризирате</em> всички страници и подкатегории, които се намират в нея.',
	'cm-form-intro-warning': 'Бъдете внимателни и не злоупотребявайте с този инструмент!',
	'cm-form-old-cat': 'Текуща категория',
	'cm-form-new-cat': 'Нова категория',
	'cm-form-reason': 'Причина за преместването',
	'cm-form-submit': 'Преместване',
	'cm-form-infotip': '[[$1]] съдържа $2.',
	'cm-form-infotip-subcats': '<b>$1</b> подкатегории',
	'cm-form-infotip-files': '<b>$1</b> файла',
	'cm-form-infotip-pages': '<b>$1</b> страници',
	'cm-form-infotip-nonexistant': '[[$1]] не съществува.',
	'cm-form-infotip-empty': '[[$1]] съществува, но не съдържа страници.',
	'cm-summary': '[[У:КМ|КМ]]: [[$1]] → [[$2]]',
	'cm-move-reason': '$1 (чрез [[У:КМ|КМ]])',
	'cm-notify-cat': '[[$1]] се премества като [[$2]]',
	'cm-notify-page': '($1) [[$2]] → [[$3]]',
	'cm-progress-done': 'Готово',
	'cm-log-error-separator': ' — ',
	'cm-close-window': 'Затваряне'
};

mw.libs.CategoryMaster.register = function() {
	mw.messages.set(mw.libs.CategoryMaster.messages);
	if (mw.config.get('wgCanonicalNamespace') == 'Category') {
		$('#ca-move').addClass('cm-link').show();
	}
	mw.loader.using(['mediawiki.util'], function() {
		var l = mw.util.addPortletLink('p-tb', '#', mw.msg('cm-portlet-link'), 't-cm-movecat');
		$(l).addClass('cm-link');
	});
	$(document.body).on('click', '.cm-link', function() {
		mw.loader.using(mw.libs.CategoryMaster.dependencies, function() {
			new mw.libs.CategoryMaster().preparePlayField();
		});
		return false;
	});
};

$(function() {
	mw.libs.CategoryMaster.register();
});