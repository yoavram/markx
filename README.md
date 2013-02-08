# Markx

*Markx* is a [Markdown] editor for scientific writing.

# Why Markx?
Markdown has recently become popular among academics as a way to produce scientific documents. 
When paired with document conversion engines such as pandoc, it provides an easy and powerful way to write.
Being a simple plain-text markup language, Markdown is easy to learn, and can be handled by version control systems.
We decided to build Markx as to make markdown writing a collaborative effort that could be hosted as web service.
For additional discussion, see these blog posts:

* [Markdown and the future of collaborative academic writing](http://inundata.org/2012/06/01/markdown-and-the-future-of-collaborative-manuscript-writing/)
* [Thoughts on a preprint server](http://inundata.org/2012/12/06/pre-print-servers/)
* [How to ditch Word](http://inundata.org/2012/12/04/how-to-ditch-word/)  

![](https://raw.github.com/yoavram/markx/master/screenshot.png)

It imitates the [Pandoc] flavor of [Markdown] to facilitate conversion to multiple formats and to benefit from the numerous [Markdown] extensions in [Pandoc].

It runs in your browser with a limited number of requirements.

It integrates with [GitHub] to allow you to seemlessly version, share and collaborate on your documents.

It is free (beer and speech).

*Markx* is currently in development but the *master* branch is working nicely and can be downloaded and used.
We would love to get feedback from anyone using it!

## Features

1. Zenware
1. Realtime preview
1. Integration with [GitHub]
1. Display math - $x^2+y^2=r^2$
1. Imitating the [Markdown] flavor of [Pandoc]
1. Citations using [Pandoc]+[BibTeX]: [@Drake1991]
1. Code highlighting:
		
		if __name__ == '__main__':
		    # Bind to PORT if defined, otherwise default to 5000.
		    port = int(os.environ.get('PORT', 5000))
		    app.run(host='0.0.0.0', port=port, debug=app.debug)

## Technology
  * Server side (this is what you need to install if you run it on localhost):
    * [Python] with [Flask]
    * [Pandoc] - optional, for conversion to PDF, DOCX etc. **Feature plans is to integrate with [Docverter] to remove this dependecy**.
  * Client side (no installation required):
    * [PageDown] - [Stack Overflow]'s [Markdown] editor
    * [Google Code Prettifier] - Code highlighting
    * [MathJax] - Rendering of $LaTeX$ equations
    * [BibTeX-js] - Processing [BibTeX] citations
    * [Twitter Bootstrap] with [Glyphicons Free]
    * [Github.js] - integration with [GitHub]


## Install

1. Clone this repo
1. Install [Python] 
1. Install [Flask]: `pip install Flask`
1. Optional: Add an environment variable named `BIB_FILE` with the path to your BibTeX `.bib` file, or create `config.py` file with the key-value `BIB_FILE = /path/to/bib/file`. Please note that the path should be absolute and should not start with a `~`.
1. Run the editor locally by calling `python server.py` and opening your browser at <http://localhost:5000>.

## License

![](http://i.creativecommons.org/l/by-nc-sa/3.0/80x15.png)

[Markdown]: http://daringfireball.net/projects/markdown/
[Pandoc]: http://johnmacfarlane.net/pandoc
[Python]: http://python.org/
[Flask]: http://flask.pocoo.org/
[Twitter Bootstrap]: http://blog.getbootstrap.com/
[Google Code Prettifier]: http://code.google.com/p/google-code-prettify/
[Icomoon Free]: http://keyamoon.com/icomoon/
[MathJax]: http://mathjax.org/
[PageDown]: http://code.google.com/p/pagedown/
[BibTeX-js]: http://bibtex-js.googlecode.com/
[Stack Overflow]: http://stackoverflow.com/
[git]: http://git-scm.com/
[BibTeX]: http://www.bibtex.org/
[GitHub]: https://github.com/
[Github.js]: https://github.com/michael/github
[Docverter]: http://www.docverter.com/
