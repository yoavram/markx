function alertMessage(message) {
	if (!message || !message.length) {
		message = "Undefined";
	}
	$('#general-alert-message').html("<strong>Error:</strong> " + message);
	$('#general-alert').show();
}

function infoMessage(message) {
	if (!message || !message.length) {
		message = "Undefined";
	}
	$('#general-info-message').html("<strong>Note:</strong> " + message);
	$('#general-info').show();
}

function panelsDisplay() {
	var leftPanel = $('#left-panel')
	var rightPanel = $('#right-panel')
	if (panelsDisplayStatus == 'dual') {
		panelsDisplayStatus = 'left';
		leftPanel.show().removeClass().addClass('span12');
		rightPanel.hide().removeClass();
	} else if (panelsDisplayStatus == 'left') {
		panelsDisplayStatus = 'right';
		leftPanel.hide().removeClass();
		rightPanel.show().removeClass().addClass('span12');
	} else {
		panelsDisplayStatus = 'dual';
		leftPanel.show().removeClass().addClass('span6');
		rightPanel.show().removeClass().addClass('span6');
	}
	return panelsDisplayStatus;
}

/* github */

function signinToGithub() {
	var username = $('#github-username').val();
	var password = $('#github-password').val();
	clearGithubSigninForm();

	if (!username || !username.length) {
		alertMessage("GitHub sign in requires a username");
		return false;
	}
	if (!password || !password.length) {
		alertMessage("GitHub sign in requires a password");
		return false;
	}
	github = new Github({
		username: username,
		password: password,
		auth: "basic"
	});
	password = null; // for security mesaures
	if (!github) {
		alertMessage("Failed contacting GitHub");
		return false;
	}
	$('#user').val(username); // TODO check if this toggles "change" event, maybe move after next line		
	if (!loadUserRepos(username)) {
		return false;
	}
	$('#github-toolbar').show();
	$('#btn-github-signin-show').hide();
	$('#btn-github-signout').show();
}

function signoutOfGithub() {
	github = null;
	user = null;
	repo = null;
	$('#user').val('');
	$('#repo').empty();
	$('#branch').empty();
	$('#path').empty();
	$('#github-toolbar').hide();
	$(this).hide();
	$('#btn-github-signin-show').show();
}

function loadUserRepos(username) {
	user = github.getUser(username);
	repo = null;
	// TODO check if user loaded
	user.userRepos(username, function(err, repos) {
		if (err){
			var code = err['error'];
			if (code == 401) {
				code = String(code) + " Unauthorized";
			} else {
				code = String(code);
			}
			alertMessage(code);
			return false;
		}
		$('#repo').empty();
		jQuery.each(repos, function(index, item) {
			var reponame = $.trim(item['name']);
			var option = '<option value="' + reponame + '">' + reponame + '</option>';
			$('#repo').append(option);					
		});			
	});
	$('#repo').focus();
	return true;
}

function loadRepoBranches(username, reponame) {
	$('#branch').empty();
	$('#path').empty();
	repo = github.getRepo(username, reponame);
	repo.listBranches(function(err, branches) {
		if (err){
			alertMessage(err['message']);
			return false;
		} 
		jQuery.each(branches, function(index, item) {
			var branchname = $.trim(item['name']);
			var option = '<option value="' + branchname + '">' + branchname + '</option>';
			$('#branch').append(option);	
		});			
	});
	$('#branch').focus();
	return true;
}

function loadBranchPaths(branchname) {
	$('#path').empty();
	repo.getTree(branchname + '?recursive=true', function(err, tree) {
		if (err) {
			alertMessage(err['message']);
			return false;
		} 
		jQuery.each(tree, function(index, item){
			var path = $.trim(item['path']);
			var option = '<option value="' + path + '">' + path + '</option>';
			$('#path').append(option);	
		});
	});
	$('#path').focus();
	return true;
}

function clearGithubSigninForm() {
	$('#modal-github-signin').modal('hide');
	$('#github-username').val('');
	$('#github-password').val('');
}

function checkVariablesForGithubFileAction(branchname, filepath) {
	if (repo == null) {
		alertMessage("Please load a repository");
		$('#repo-ok').focus();
		return false;
	}
	
	if (!branchname || !branchname.length) {
		alertMessage("Please choose a branch");
		$('#branch').focus();
		return false;
	}

	if (!filepath || !filepath.length) {
		alertMessage("Please choose a file");
		$('#path').focus();
		return false;
	}
	return true;
}

function pullFromGithub(branchname, filepath, text, callback) {
	if (!checkVariablesForGithubFileAction(branchname, filepath)) {
		return false;
	}

	if (text.length) {
		if (!confirm("The contents of the editor panel will be removed, do you want to contine?")) {
			return false;
		}
	}

	repo.read(branchname, filepath, function (err, data) {
		if (err) {
			alertMessage(err['message']);
			return false;
		} else {
			updateEditor(data);
		}
	});
}

function pushToGithub(branchname, filepath, commit_msg, text) {
	if (!checkVariablesForGithubFileAction(branchname, filepath)) {
		return false;
	}

	if (!commit_msg || !commit_msg.length) {
		alertMessage("Please enter a commit message");
		$('#commit-message').focus();
		return false;
	}
	
	if (!text || !text.length) {
		if (!confirm("Editor is empty, continue with commit?")) {
			return false;
		}
	}

	repo.write(branchname, filepath, text, commit_msg, function (err) {
		if (err) {
			alertMessage(err['message']);
			return false;
		} else {
			infoMessage("Commit was successful");
			$('#commit-message').val('');
		}
	});

	var mdIndex = filepath.lastIndexOf('.md');
	if (mdIndex >= 0) {
		updateCitations();
		var bibtexContent = getBibtex();
		var bibtexPath = filepath.substring(0, mdIndex) + '.bib';
		repo.write(branchname, bibtexPath, bibtexContent, commit_msg, function (err) {
			if (err) {
				alertMessage(err['message']);
				return false;
			} else {
				infoMessage("Commit was successful, included BibTeX file");
			}
		});
	}
}

function updateEditor(text) {
	$('textarea#wmd-input-second').val(text);
	updateCitations();
}

function getEditor() {
	return($('textarea#wmd-input-second').val());
}

/* citations */

var bibtex = null; // the user's citation library
var citationList = null; // the document citation list

function readBibFile(evt) {
    // http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html#
    //Retrieve the first (and only!) File from the FileList object
    $('#modal-bib-file-input').modal('hide')
    var f = evt.target.files[0]; 

    if (f) {
    	var r = new FileReader();
    	r.onload = function(e) {     		
 		initBibtex(e.target.result); 
    		infoMessage("BibTeX file loaded with " + bibtex.amount().toString() + " entires");
    	}
    	r.readAsText(f);
    } else { 
    	alert("Failed to load file");
    }
}

function initBibtex(bibtexContent) {
	bibtex = new BibTex();
	bibtex.content = bibtexContent; // the bibtex content as a string
	bibtex.parse();
	updateCitations();
}

function getBibtex() {
	return($('#bibtex_input').val())
}

function updateCitations() {
	// clear citations
	citationList = new BibTex();
	$('#bibtex_input').val('');
	$('#bibtex_display').html('');
	// redo citations
	var regex = /\[?-?@(\w+)\]?/gm; 
	var input = $('#wmd-input-second').val();
	var citationKeys = new Array();
	var match = regex.exec(input);
	while (match != null) {
		var citationKey = match[1];
		citationKeys.push(citationKey);
		match = regex.exec(input);
	}
	citationKeys = _.uniq(citationKeys);
	_.each(citationKeys, addCitation);
	$('#bibtex_input').val(citationList.bibTex());
	$('#bibtex_display').html(citationList.html());
}

function addCitation(citation) {
	var entry = _.find(bibtex.data, function(bibEntry) {
		return bibEntry.cite == citation;
	})
	if (entry) {
		citationList.addEntry(entry);
	}
}


/* markdown */


function processTitleBlockToHTML(text) {
	// This doesn't work because the first lines are wrapped in <p>
	var textSplit = text.split('\n');

	if (textSplit.length > 0) {
		var titleLine = textSplit[0];
		if (titleLine.substring(0,2) == '% ') {
			text = text.replace(titleLine, '<h1 class="title">' + titleLine.substring(2, titleLine.length) + '</h1>');
		}
	}
	if (textSplit.length > 1) {
		var authorLine = textSplit[1];
		if (authorLine.substring(0,2) == '% ') {
			text = text.replace(authorLine, '<h2 class="author">' + authorLine.substring(2, authorLine.length) + '</h2>');
		}
	}
	if (textSplit.length > 2) {
		var dateLine = textSplit[2];
		if (dateLine .substring(0,2) == '% ') {
			text = text.replace(dateLine, '<h3 class="date">' + dateLine.substring(2, dateLine.length) + '</h3>');
		}
	}
	return text;
}


function processTitleBlockToMarkdown(text) {
	var textSplit = text.split('\n');

	if (textSplit.length > 0) {
		var titleLine = textSplit[0];
		if (titleLine.substring(0,2) == '% ') {
			text = text.replace(titleLine, '# ' + titleLine.substring(2, titleLine.length));
		}
	}
	if (textSplit.length > 1) {
		var authorLine = textSplit[1];
		if (authorLine.substring(0,2) == '% ') {
			text = text.replace(authorLine, '## ' + authorLine.substring(2, authorLine.length));
		}
	}
	if (textSplit.length > 2) {
		var dateLine = textSplit[2];
		if (dateLine .substring(0,2) == '% ') {
			text = text.replace(dateLine, '### ' + dateLine.substring(2, dateLine.length));
		}
	}
	return text;
} 


function processGooglePrettifierPreBlocks(text) {
	text = text.replace("<pre><code>", '<pre class="prettyprint linenums">');
	text = text.replace("\n</code></pre>", '\n</pre>');
	return text;
}


function init_markdown_editor() {   
	var converter2 = new Markdown.Converter();

	//converter2.hooks.chain("postConversion", processTitleBlockToHTML);
	converter2.hooks.chain("preConversion", processTitleBlockToMarkdown);

	converter2.hooks.chain("postConversion", processGooglePrettifierPreBlocks);

	var help = function () { alert("Do you need help?"); }
	var options = {
		helpButton: { handler: help },
		strings: { quoteexample: "whatever you're quoting, put it right here" }
	};
	var editor2 = new Markdown.Editor(converter2, "-second", options);

	editor2.hooks.chain("onPreviewRefresh", function () {
		prettyPrint();
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	});

	editor2.run();
	return editor2;
};

/* files */

function readSingleFile(evt) {
	// http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html#
    //Retrieve the first (and only!) File from the FileList object
    var file = evt.target.files[0]; 

    if (file) {
    	var reader = new FileReader();
    	reader.onload = function(event) { 
    		var contents = event.target.result;
    		$('textarea#wmd-input-second').val(contents);
    		editor.refreshPreview();
    		updateCitations();
    	}
    	reader.readAsText(file);
    } else { 
    	alert("Failed to load file");
    }
}

function getConverter() {
	var converter = ($('#btn-converter').text() == 'D')  ? "docverter" : 'pandoc';
	return(converter);
}

function _save(extension, callback) {
	var filename = $('#path').val();
	if (!filename) {
		filename = "markx";
	}
	filename = filename.substr(0, filename.lastIndexOf('.')) || filename; // remove extension
	var content = getEditor();
	var bibtex = getBibtex();
	var converter = getConverter();
	$.post('/save', {
		content: content,
		filename: filename,
		bibtex: bibtex,
		extension: extension,
		converter: converter
	}, function(data) {
		if ('error' in data){
			alertMessage("Conversion failed: " + data.error)
		} else {
			callback(data.result);
		}
	});
}
var save = _.throttle(_save, 10000) 

function download(filename) {
	var url = '/download/' + filename;
	window.location.assign(url);
}


function view(filename) {
	var url = '/view/' + filename;
	window.open(url, '_newtab');
}


/*
 * http://roshanbh.com.np/2008/10/jquery-plugin-word-counter-textarea.html
 * Textarea Word Count Jquery Plugin 
 * Version 1.0
 * 
 * Copyright (c) 2008 Roshan Bhattarai
 * website : http://roshanbh.com.np
 * 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * 
*/

jQuery.fn.wordCount = function(params){
	var p = {
		counterElement:"display_count"
	};
	var total_words;
	
	if(params) {
		jQuery.extend(p, params);
	}
	
	//for each keypress function on text areas
	this.keypress(function()
	{ 
		total_words=this.value.split(/[\s\.\?]+/).length;
		jQuery('#'+p.counterElement).html(total_words);
	});
	// TODO this is a patch to get the initial word count
	// also need to make sure this runs when loading/uploading new files
	total_words = this.val().split(/[\s\.\?]+/).length;
	jQuery('#'+p.counterElement).html(total_words);
};
