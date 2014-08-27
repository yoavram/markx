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
		leftPanel.show().removeClass().addClass('offset1 span8');
		rightPanel.hide().removeClass();
	} else if (panelsDisplayStatus == 'left') {
		panelsDisplayStatus = 'right';
		leftPanel.hide().removeClass();
		rightPanel.show().removeClass().addClass('offset1 span8');
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
	user.repos(function(err, repos) {
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
		repos = _.sortBy(repos, function(item) { return $.trim(item['name'].toLowerCase())})
		_.each(repos, function(item, index) {
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
		branches = _.sortBy(branches, function(item) { return $.trim(item['name'].toLowerCase())})
		_.each(branches, function(item, index) {
			var branchname = $.trim(item['name']);
			var option = '<option value="' + branchname + '">' + branchname + '</option>';
			$('#branch').append(option);	
		});			
	});
	$('#branch').focus();
	return true;
}

function loadBranchPaths(branchname, callback) {
	$('#path').empty();
	repo.getTree(branchname + '?recursive=true', function(err, tree) {
		if (err) {
			alertMessage(err['message']);
			return false;
		} 
		tree = _.sortBy(tree, function(item) { return $.trim(item['path'].toLowerCase())})
		_.each(tree, function(item, index){
			var path = $.trim(item['path']);
			var option = '<option value="' + path + '">' + path + '</option>';
			$('#path').append(option);
			if (typeof callback != "undefined") {
				callback();	
			}
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

function pullBibFromGithub(branchname, filepath) {
	if (!checkVariablesForGithubFileAction(branchname, filepath)) {
		return false;
	}
	if (_.reduce( _.tail(filepath, -4), function(memo, char) { return memo+char }, '') != '.bib') {
		alertMessage("Cannot pull " + filepath + " to the references library, only <code>.bib</code> files are allowed.");
		return false;
	}
	repo.read(branchname, filepath, function(err, data) {
		if (err) {
			alertMessage(err['message']);
			return false;
		} 
		parseBibtex(data);		
	});	
}

function pullFromGithub(branchname, filepath, text) {
	if (!checkVariablesForGithubFileAction(branchname, filepath)) {
		return false;
	}

	if (text.length) {
		if (!confirm("The contents of the editor panel will be removed, do you want to contine?")) {
			return false;
		}
	}
	repo.getSha(branchname, filepath, function(err, sha) {
		if (!sha || err) { 
			alertMessage(filepath + "not found");
			return false;
		} 
		infoMessage("Loading " + sha);
		editorSha = sha;
		repo.getBlob(sha, function (err, data) {
			if (err) {
				alertMessage(err['message']);
				return false;
			} 
			updateEditor(data);			
		});	
	});
	document.title = _.last(filepath.split('/')) + " | Markx";
}
function commitUrl(username, repository, sha) {
	return 'https://github.com/'+username+'/' + repository + '/commit/' + sha;
}

function pushToGithub(branchname, filepath, commit_msg, text , callback, newFile) {
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

	repo.getSha(branchname, filepath, function(err, sha) {
		if ( (_.isUndefined(newFile) && !sha) || err) { 
			alertMessage(filepath + "not found");
			return false;
		} 
		console.log(sha);
		if (_.isUndefined(newFile) && (sha != editorSha)) {
			alertMessage("Can't commit, file has been changed since last pulled. To prevent data loss, the file will be downloaded to local downloads directory.");
			save('md', download);
			return false;
		}
	
		repo.write(branchname, filepath, text, commit_msg, function (err) {
			if (err) {
				alertMessage(err['message']);
				return false;
			} 
			repo.getSha(branchname, filepath, function(err, sha) {
				if (!sha || err) { 
					alertMessage(filepath + " not found");
					return false;
				} 
				editorSha = sha; //update the sha
				updateCitations();
				var bibtexContent = getBibtex();
				if (bibtexContent && bibtexContent.length>0 && confirm("Push bibliography file too?")) {
					var bibtexPath = filepath.substr(0, filepath.lastIndexOf('.')) + '.bib';
					repo.write(branchname, bibtexPath, bibtexContent, 'Update bibliography: ' + commit_msg, function (err) {
						if (err) {
							alertMessage("Bibliography commit failed: " + err['message']);
							return false;
						} 
						infoMessage("Commit was successful, included bibliography file " + sha);
						$('#commit-message').val('');
						if (typeof callback != "undefined") {
							callback();	
						}
					});					
				} else {
					infoMessage("Commit was successful " + sha);
					$('#commit-message').val('');
					if (!_.isUndefined(callback)) {
						callback();
					}
				}
			});
		});
	});
}
					
function updateEditor(text) {
	editor.setValue(text);
	updateCitations();
}

function getEditor() {
	return editor.getValue();
}

/* citations */

var bibtex = new BibTex(); // the user's citation library
var citationList = new BibTex(); // the document citation list

function readBibFile() {
    // http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html#
    // Retrieve the first (and only!) File from the FileList object
    $('#modal-bib-file-input').modal('hide')
    var f = document.getElementById('bibtex-file').files[0];

    if (f) {
    	var r = new FileReader();
	r.onload = function(e) {
 		parseBibtex(e.target.result); 
    	}
    	r.readAsText(f);
    } else { 
    	alert("Failed to load BibTeX file");
    }
}

function parseBibtex(bibtexContent) {
	var countBefore = bibtex.amount();
	bibtex.content = bibtexContent; // the bibtex content as a string
	bibtex.parse();
	var countAfter = bibtex.amount();
	infoMessage("Added " + (countAfter - countBefore).toString() + " new references.");
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
	var input = getEditor();
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

function viewCitations(bibObject) {
	if (!bibObject || !bibObject.amount()) {
		alertMessage("No citations to view!");
	} else {
		$('#div-bib-view').html(bibObject.html());
		$('#modal-bib-view').modal('show');
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
	var textSplit = text.split('\n', 3);

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


function updateWordCount(text) {
	total = text.split(/[\s\.\?]+/).length;
	$('#word-counter').html(total);
	return text;
}


function updateCharCount(text) {
	var total = 0;
	if (match = text.match(/[a-zA-Z0-9]/g)) {
		var total = match.length;
	}
	$('#char-counter').html(total);
	return text;
}


function processGooglePrettifierPreBlocks(text) {
	text = text.replace(new RegExp("<pre><code>", "g"), '<pre class="prettyprint">');
	text = text.replace(new RegExp("\n</code></pre>", "g"), '\n</pre>');
	return text;
}


function _updatePreview() {
	var markdownString = editor.getValue();
	var htmlSrting = converter.makeHtml(markdownString);
	$('#wmd-preview-second').html(htmlSrting);
	prettyPrint();
	updateMath();
}
var updatePreview = _.throttle(_updatePreview, 100);
var updateMath = _.debounce(function() {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	}, 1500);

function addPreCoversionHook(converter, hook) {
	converter.hooks.chain("preConversion", hook);
}

function addPostCoversionHook(converter, hook) {
	converter.hooks.chain("postConversion", hook);
}

function initMarkdownConverter() {
	var pageDownSanitizingConverter = Markdown.getSanitizingConverter();
	addPreCoversionHook(pageDownSanitizingConverter, processTitleBlockToMarkdown);
	addPostCoversionHook(pageDownSanitizingConverter, processGooglePrettifierPreBlocks);
	addPreCoversionHook(pageDownSanitizingConverter, updateWordCount);
	addPreCoversionHook(pageDownSanitizingConverter, updateCharCount);
    	return pageDownSanitizingConverter;
}

function initMarkdownEditor() {
	var codeMirrorEditor = CodeMirror.fromTextArea($('#wmd-input-second')[0], {
		lineNumbers: true,
		lineNumberFormatter: function(number) {if (number % 5 == 0) {return(number);} else {return('');}},
		lineWrapping : true,
		autofocus: true,
		mode: 'markdown',
		theme: 'elegant'
	});
	codeMirrorEditor.on('change', updatePreview);

	return codeMirrorEditor;
}


/* files */
function readMdFile() {
    // http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html#
    // Retrieve the first (and only!) File from the FileList object
    $('#modal-md-file-input').modal('hide')
    if (getEditor().length) {
	if (!confirm("The contents of the editor panel will be removed, do you want to contine?")) {
		return false;
	}
}
    var f = document.getElementById('md-file').files[0];

    if (f) {
    	var r = new FileReader();
	r.onload = function(e) {
 		updateEditor(e.target.result); 
    	}
    	r.readAsText(f);
    } else { 
    	alert("Failed to load Markdown file");
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

