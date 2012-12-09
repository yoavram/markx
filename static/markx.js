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
	$('#bibtex_input').val('');
	$.getJSON('/bibtex', {
		key: citation
	}, function(data) {
		$('#bibtex_input').append(data.result); 
		bibtex_js_draw();
	});
};

function init_markdown_editor() {   
	var converter2 = new Markdown.Converter();

	//converter2.hooks.chain("preConversion",);

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

};