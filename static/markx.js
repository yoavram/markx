function groupCitations() {
	var citations = new Array();
	var regex = /\[?-?@(\w+)\]?/gm; 
	var input = $('#wmd-preview-second').text();
	var match = regex.exec(input);
	while (match != null) {
		citations.push(match[1]);
		match = regex.exec(input);
	}
	return(citations);
};

function get_bibtext(citation) {
	$.getJSON('/bibtex', {
		key: citation
	}, function(data) {
		$('#bibtex_input').append(data.result); 
		bibtex_js_draw();
	});
};

function updateCitations() {
	$('#bibtex_input').text('');
	$('#bibtex_display').html('');
	var citations = groupCitations();
	citations.sort();
	for (c in citations) {
		get_bibtext(citations[c]);
	}
}

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

function init_markdown_editor() {   
	var converter2 = new Markdown.Converter();

	//converter2.hooks.chain("postConversion", processTitleBlockToHTML);
	converter2.hooks.chain("preConversion", processTitleBlockToMarkdown);

	converter2.hooks.chain("postConversion", function(text) {
		text = text.replace("<pre><code>", '<pre class="prettyprint linenums">');
		text = text.replace("\n</code></pre>", '\n</pre>');
		return text;
	});

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

function readSingleFile(evt) {
	// http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html#
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
    	var r = new FileReader();
    	r.onload = function(e) { 
    		var contents = e.target.result;
    		$('textarea#wmd-input-second').val(contents);
    		editor.refreshPreview();
    		updateCitations();
    	}
    	r.readAsText(f);
    } else { 
    	alert("Failed to load file");
    }
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

function check_for_filename(callback) {
	var filename = $('#filename').val();
	if (filename) {
		$('#general-alert').hide();
		callback(filename);
	} else {
		$('#general-alert').show();
		$('#general-alert-message').html("<strong>Please choose a filename</strong>");
		$('#filename').focus();
	}
}

function save(content, filename, extension, callback) {
	$.post('/save', {
		content: content,
		extension: extension,
		filename: filename
	}, function(data) {
		callback(data.result);
	});
}

function download(filename) {
	var url = '/download/' + filename;
	window.location.assign(url)
}

function save_text(content, extension, callback) {
	check_for_filename(function(filename) {
		save(content, filename, extension, callback);
	});
}

function save_markdown(callack) {
	save_text($('textarea#wmd-input-second').val(), 'md', callack);
}

function save_bibtext(callack) {
	save_text($('textarea#bibtex_input').val(), 'bib', callack);
}

function save_output(extension, callack) {
	save_text($('textarea#bibtex_input').val(), 'bib', function() {
		save_text($('textarea#wmd-input-second').val(), extension, callack);
	});
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
};
