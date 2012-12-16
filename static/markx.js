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
	for (c in citations) {
		get_bibtext(citations[c]);
	}
}

function init_markdown_editor() {   
	var converter2 = new Markdown.Converter();

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

function download(content, extension) {
	$.post('/save', {
		content: content,
		extension: extension
	}, function(data) {
		var url = '/download/' + data.result;
		window.location.assign(url);
	});
}

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