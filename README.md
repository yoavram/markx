# Markx

*Marx* is a [Markdown] editor with [Pandoc] flavor in your browser.

## Features

1. Zenware
1. Display math - $x^2+y^2=r^2$
1. Markdown flavor of Pandoc
1. Citations using Pandoc/BibText: [@Drake1991]
1. Code highlighting:
<pre class="prettyprint numline:1">
for x in lst:
	print x
</pre>

## Technology

  * [Python] with [Flask]
  * [PageDown] markdown editor
  * [Twitter Bootstrap] with [Glyphicons Free]
  * [Google Code Prettifier]
  * [MathJax]

## Install

1. Clone this repo
2. Install [Python] and [Flask]
3. Add an environment variable named `BIB_FILE` with the path to your BibTeX `.bib` file, or create `config.py` file with the key-value `BIB_FILE = /path/to/bib/file`.
4. Run the editor locally by calling `python server.py` and opening your browser at <http://localhost:5000>.


## TODO

1. Convert code blocks to google prettifier 
1. [TOC] tag
1. Save and Load from local computer
1. Put more stuff on TODO list
1. Replace Python/Flask with JavaScript?
1. Rerun MathJax/Prettifier only when relevant changes occurred?
1. Interface to GitHub?
1. Interface to Mendeley?
1. Python/R interfcace (knitr/Rmd/ipython notebook)?
1. Help/About page

## License

![](http://i.creativecommons.org/l/by-nc-sa/3.0/80x15.png)

[Markdown]: http://daringfireball.net/projects/markdown/
[Pandoc]: http://johnmacfarlane.net/pandoc
[Python]: http://python.org/
[Flask]: http://flask.pocoo.org/
[Twitter Bootstrap]: http://blog.getbootstrap.com/
[Google Code Prettifier]: http://code.google.com/p/google-code-prettify/
[Glyphicons Free]: http://glyphicons.com/
[MathJax]: http://mathjax.org/
[PageDown]: http://code.google.com/p/pagedown/