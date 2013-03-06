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
		} else { 
			infoMessage("Loading " + sha);
			editorSha = sha;
			repo.getBlob(sha, function (err, data) {
				if (err) {
					alertMessage(err['message']);
				} else {
					updateEditor(data);
				}
			});
		}
	});
	document.title = _.last(filepath.split('/')) + " | Markx";
}
function commitUrl(username, repository, sha) {
	return 'https://github.com/'+username+'/' + repository + '/commit/' + sha;
}

function pushToGithub(branchname, filepath, commit_msg, text ,callback) {
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
		if (!sha || err) { 
			alertMessage(filepath + "not found");
			return false;
		} else {
			console.log(sha);
			if (sha != editorSha) {
				alertMessage("Can't commit, file has been changed since last pulled. To prevent data loss, the file will be downloaded to local downloads directory.");
				save('md', download);
				return false;
			} else {
				repo.write(branchname, filepath, text, commit_msg, function (err) {
					if (err) {
						alertMessage(err['message']);
						return false;
					} else {
						repo.getSha(branchname, filepath, function(err, sha) {
							if (!sha || err) { 
								alertMessage(filepath + "not found");
								return false;
							} else {
								editorSha = sha; //update the sha
								updateCitations();
								var bibtexContent = getBibtex();
								if (bibtexContent && bibtexContent.length>0 && confirm("Push bibliography file too?")) {
									var bibtexPath = filepath.substr(0, filepath.lastIndexOf('.')) + '.bib';
									repo.write(branchname, bibtexPath, bibtexContent, 'Update bibliography: ' + commit_msg, function (err) {
										if (err) {
											alertMessage("Bibliography commit failed: " + err['message']);
											return false;
										} else {
											infoMessage("Commit was successful, included bibliography file " + sha);
											$('#commit-message').val('');
											if (typeof callback != "undefined") {
												callback();	
											}
										}
									});
								} else {
									infoMessage("Commit was successful " + sha);
									$('#commit-message').val('');
									if (typeof callback != "undefined") {
										callback();	
									}
								}
							}
						});
					}
				});
			}
		}
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

var bibtex = null; // the user's citation library
var citationList = null; // the document citation list

function readBibFile() {
    // http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html#
    // Retrieve the first (and only!) File from the FileList object
    $('#modal-bib-file-input').modal('hide')
    var f = document.getElementById('bibtex-file').files[0];

    if (f) {
    	var r = new FileReader();
	r.onload = function(e) {
 		initBibtex(e.target.result); 
    		infoMessage("BibTeX file loaded with " + bibtex.amount().toString() + " entires");
    	}
    	r.readAsText(f);
    } else { 
    	alert("Failed to load BibTeX file");
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
	text = text.replace("<pre><code>", '<pre class="prettyprint">');
	text = text.replace("\n</code></pre>", '\n</pre>');
	return text;
}


function updatePreview() {
	var markdownString = editor.getValue();
	var htmlSrting = converter.makeHtml(markdownString);
	$('#wmd-preview-second').html(htmlSrting);
	prettyPrint();
	MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}


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
function readSingleFile(evt) {
	// http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html#
    //Retrieve the first (and only!) File from the FileList object
    var file = evt.target.files[0]; 

    if (file) {
    	var reader = new FileReader();
    	reader.onload = function(event) { 
    		var contents = event.target.result;
    		$('#wmd-input-second').val(contents);
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

/* citeproc */
// source: https://gist.github.com/bdarcus/864632
// this is a locale bundle
var locale = {"en-US":"<locale xml:lang=\"en\" xmlns=\"http://purl.org/net/xbiblio/csl\">  <style-options punctuation-in-quote=\"true\"/>  <date form=\"text\">    <date-part name=\"month\" suffix=\" \"/>    <date-part name=\"day\" suffix=\", \"/>    <date-part name=\"year\"/>  </date>  <date form=\"numeric\">    <date-part name=\"year\"/>    <date-part name=\"month\" form=\"numeric\" prefix=\"-\" range-delimiter=\"/\"/>    <date-part name=\"day\" prefix=\"-\" range-delimiter=\"/\"/>  </date>  <terms>    <term name=\"document-number-label\">No.</term>    <term name=\"document-number-authority-suffix\">Doc.</term>    <term name=\"un-sales-number-label\">U.N. Sales No.</term>    <term name=\"collection-number-label\">No.</term>    <term name=\"open-quote\">\u201c</term>    <term name=\"close-quote\">\u201d</term>    <term name=\"open-inner-quote\">\u2018</term>    <term name=\"close-inner-quote\">\u2019</term>    <term name=\"ordinal-01\">st</term>    <term name=\"ordinal-02\">nd</term>    <term name=\"ordinal-03\">rd</term>    <term name=\"ordinal-04\">th</term>    <term name=\"long-ordinal-01\">first</term>    <term name=\"long-ordinal-02\">second</term>    <term name=\"long-ordinal-03\">third</term>    <term name=\"long-ordinal-04\">fourth</term>    <term name=\"long-ordinal-05\">fifth</term>    <term name=\"long-ordinal-06\">sixth</term>    <term name=\"long-ordinal-07\">seventh</term>    <term name=\"long-ordinal-08\">eighth</term>    <term name=\"long-ordinal-09\">ninth</term>    <term name=\"long-ordinal-10\">tenth</term>    <term name=\"at\">at</term>    <term name=\"in\">in</term>    <term name=\"ibid\">ibid</term>    <term name=\"accessed\">accessed</term>    <term name=\"retrieved\">retrieved</term>    <term name=\"from\">from</term>    <term name=\"forthcoming\">forthcoming</term>    <term name=\"references\">      <single>reference</single>      <multiple>references</multiple>    </term>    <term name=\"references\" form=\"short\">      <single>ref</single>      <multiple>refs</multiple>    </term>    <term name=\"no date\">n.d.</term>    <term name=\"and\">and</term>    <term name=\"et-al\">et al.</term>    <term name=\"interview\">interview</term>    <term name=\"letter\">letter</term>    <term name=\"anonymous\">anonymous</term>    <term name=\"anonymous\" form=\"short\">anon.</term>    <term name=\"and others\">and others</term>    <term name=\"in press\">in press</term>    <term name=\"online\">online</term>    <term name=\"cited\">cited</term>    <term name=\"internet\">internet</term>    <term name=\"presented at\">presented at the</term>    <term name=\"ad\">AD</term>    <term name=\"bc\">BC</term>    <term name=\"season-01\">Spring</term>    <term name=\"season-02\">Summer</term>    <term name=\"season-03\">Autumn</term>    <term name=\"season-04\">Winter</term>    <term name=\"with\">with</term>        <!-- CATEGORIES -->    <term name=\"anthropology\">anthropology</term>    <term name=\"astronomy\">astronomy</term>    <term name=\"biology\">biology</term>    <term name=\"botany\">botany</term>    <term name=\"chemistry\">chemistry</term>    <term name=\"engineering\">engineering</term>    <term name=\"generic-base\">generic base</term>    <term name=\"geography\">geography</term>    <term name=\"geology\">geology</term>    <term name=\"history\">history</term>    <term name=\"humanities\">humanities</term>    <term name=\"literature\">literature</term>    <term name=\"math\">math</term>    <term name=\"medicine\">medicine</term>    <term name=\"philosophy\">philosophy</term>    <term name=\"physics\">physics</term>    <term name=\"psychology\">psychology</term>    <term name=\"sociology\">sociology</term>    <term name=\"science\">science</term>    <term name=\"political_science\">political science</term>    <term name=\"social_science\">social science</term>    <term name=\"theology\">theology</term>    <term name=\"zoology\">zoology</term>        <!-- LONG LOCATOR FORMS -->    <term name=\"book\">      <single>book</single>      <multiple>books</multiple>    </term>    <term name=\"chapter\">      <single>chapter</single>      <multiple>chapters</multiple>    </term>    <term name=\"column\">      <single>column</single>      <multiple>columns</multiple>    </term>    <term name=\"figure\">      <single>figure</single>      <multiple>figures</multiple>    </term>    <term name=\"folio\">      <single>folio</single>      <multiple>folios</multiple>    </term>    <term name=\"issue\">      <single>number</single>      <multiple>numbers</multiple>    </term>    <term name=\"line\">      <single>line</single>      <multiple>lines</multiple>    </term>    <term name=\"note\">      <single>note</single>      <multiple>notes</multiple>    </term>    <term name=\"opus\">      <single>opus</single>      <multiple>opera</multiple>    </term>    <term name=\"page\">      <single>page</single>      <multiple>pages</multiple>    </term>    <term name=\"paragraph\">      <single>paragraph</single>      <multiple>paragraph</multiple>    </term>    <term name=\"part\">      <single>part</single>      <multiple>parts</multiple>    </term>    <term name=\"section\">      <single>section</single>      <multiple>sections</multiple>    </term>    <term name=\"volume\">      <single>volume</single>      <multiple>volumes</multiple>    </term>    <term name=\"edition\">      <single>edition</single>      <multiple>editions</multiple>    </term>    <term name=\"verse\">      <single>verse</single>      <multiple>verses</multiple>    </term>    <term name=\"sub verbo\">      <single>sub verbo</single>      <multiple>s.vv</multiple>    </term>        <!-- SHORT LOCATOR FORMS -->    <term name=\"book\" form=\"short\">bk.</term>    <term name=\"chapter\" form=\"short\">chap.</term>    <term name=\"column\" form=\"short\">col.</term>    <term name=\"figure\" form=\"short\">fig.</term>    <term name=\"folio\" form=\"short\">f.</term>    <term name=\"issue\" form=\"short\">no.</term>    <term name=\"opus\" form=\"short\">op.</term>    <term name=\"page\" form=\"short\">      <single>p.</single>      <multiple>pp.</multiple>    </term>    <term name=\"paragraph\" form=\"short\">para.</term>    <term name=\"part\" form=\"short\">pt.</term>    <term name=\"section\" form=\"short\">sec.</term>    <term name=\"sub verbo\" form=\"short\">      <single>s.v.</single>      <multiple>s.vv.</multiple>    </term>    <term name=\"verse\" form=\"short\">      <single>v.</single>      <multiple>vv.</multiple>    </term>    <term name=\"volume\" form=\"short\">    	<single>vol.</single>    	<multiple>vols.</multiple>    </term>    <term name=\"edition\">edition</term>    <term name=\"edition\" form=\"short\">ed.</term>        <!-- SYMBOL LOCATOR FORMS -->    <term name=\"paragraph\" form=\"symbol\">      <single>¶</single>      <multiple>¶¶</multiple>    </term>    <term name=\"section\" form=\"symbol\">      <single>§</single>      <multiple>§§</multiple>    </term>        <!-- LONG ROLE FORMS -->    <term name=\"author\">      <single></single>      <multiple></multiple>    </term>    <term name=\"editor\">      <single>editor</single>      <multiple>editors</multiple>    </term>    <term name=\"translator\">      <single>translator</single>      <multiple>translators</multiple>    </term>        <!-- SHORT ROLE FORMS -->    <term name=\"author\" form=\"short\">      <single></single>      <multiple></multiple>    </term>    <term name=\"editor\" form=\"short\">      <single>ed.</single>      <multiple>eds.</multiple>    </term>    <term name=\"translator\" form=\"short\">      <single>tran.</single>      <multiple>trans.</multiple>    </term>        <!-- VERB ROLE FORMS -->    <term name=\"editor\" form=\"verb\">edited by</term>    <term name=\"translator\" form=\"verb\">translated by</term>    <term name=\"recipient\" form=\"verb\">to</term>    <term name=\"interviewer\" form=\"verb\">interview by</term>        <!-- SHORT VERB ROLE FORMS -->    <term name=\"editor\" form=\"verb-short\">ed.</term>    <term name=\"translator\" form=\"verb-short\">trans.</term>        <!-- LONG MONTH FORMS -->    <term name=\"month-01\">January</term>    <term name=\"month-02\">February</term>    <term name=\"month-03\">March</term>    <term name=\"month-04\">April</term>    <term name=\"month-05\">May</term>    <term name=\"month-06\">June</term>    <term name=\"month-07\">July</term>    <term name=\"month-08\">August</term>    <term name=\"month-09\">September</term>    <term name=\"month-10\">October</term>    <term name=\"month-11\">November</term>    <term name=\"month-12\">December</term>        <!-- SHORT MONTH FORMS -->    <term name=\"month-01\" form=\"short\">Jan.</term>    <term name=\"month-02\" form=\"short\">Feb.</term>    <term name=\"month-03\" form=\"short\">Mar.</term>    <term name=\"month-04\" form=\"short\">Apr.</term>	<term name=\"month-05\" form=\"short\">May</term>    <term name=\"month-06\" form=\"short\">Jun.</term>    <term name=\"month-07\" form=\"short\">Jul.</term>    <term name=\"month-08\" form=\"short\">Aug.</term>    <term name=\"month-09\" form=\"short\">Sep.</term>    <term name=\"month-10\" form=\"short\">Oct.</term>    <term name=\"month-11\" form=\"short\">Nov.</term>    <term name=\"month-12\" form=\"short\">Dec.</term>  </terms></locale>"};

var csl_style  = null;
jQuery.get('/static/csl/plos.csl', function(data) {
    csl_style = data;
});

// This defines the mechanism by which we get hold of the relevant data for
// the locale and the bibliography. 
// 
var sys = {
    retrieveItem: function(id){
        var citation = _.find(bibtex.data, function(bibItem) {return bibItem.cite == id});
        citation['id'] = citation['cite'];
        return citation;
    },

    retrieveLocale: function(lang){
        return locale[lang];
    }
}

// instantiate the citeproc object
var citeproc = new CSL.Engine( sys, csl_style );

function create_citation_object(citationKey) {
	// This is the citation object. Here, we have hard-coded this, so it will only
	// work with the correct HTML. 
	var citation_object = 
	{
		// items that are in a citation that we want to add. 
		"citationItems": [
		    	{
		        		"id": citationKey
			 }
		],
		// properties -- count up from 0
		"properties": { 
			    "noteIndex": 0
		}
	}
	return citation_object;
}

function get_formatted_citation(citation_object){
    // this returns an in-text citation as a string, as well as adding it to
    // the bibliography, which will be generated later. The method returns
    // additional information which we are ignoring in this case. 
    return citeproc.appendCitationCluster( citation_object )[ 0 ][ 1 ];
}

function get_formatted_bib(){
    // make the bibliography, and return it as a string. The method returns
    // additional information which we are ignoring in this case. 
    return citeproc.makeBibliography()[ 1 ];
}
