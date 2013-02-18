# Markx
### Markdown editor for scientific writing. Batteries included.

## Why Markx?
Markdown has recently become popular among academics as a way to produce scientific documents. 
When paired with document conversion engines such as pandoc, it provides an easy and powerful way to write.
Being a simple plain-text markup language, Markdown is easy to learn, and can be handled by version control systems.
We decided to build Markx as to make markdown writing a collaborative effort that could be hosted as web service.
For additional discussion, see these blog posts:

* [Markdown and the future of collaborative academic writing](http://inundata.org/2012/06/01/markdown-and-the-future-of-collaborative-manuscript-writing/)
* [Thoughts on a preprint server](http://inundata.org/2012/12/06/pre-print-servers/)
* [How to ditch Word](http://inundata.org/2012/12/04/how-to-ditch-word/)  

![](https://raw.github.com/yoavram/markx/master/screenshot.png)

## Features

1. Free as in free speech - promotes open science, pre-publication review, collaboration.
1. Free as in free beer - uses open-source, free software and released under [CC-NC-BY 3.0](http://creativecommons.org/licenses/by-nc-sa/3.0/).
1. Easy to learn - [Markdown] is not LaTex, for better and worse.
1. Integration with [GitHub] - free hosted version control, ideal for backup, versioning and collaboration.
1. [Pandoc] integration - multiple Markdown extensions, multiple output formats.
1. Real-time Markdown preview - [WYSIWYM](http://en.wikipedia.org/wiki/WYSIWYM) / [WYSIWYG](http://en.wikipedia.org/wiki/WYSIWYG).
1. Display math with LaTeX formatting - $x^2+y^2=r^2$.
1. Citations - [BibTeX]: [@Drake1991]
1. Code highlighting:
		
		if __name__ == '__main__':
		    # Bind to PORT if defined, otherwise default to 5000.
		    port = int(os.environ.get('PORT', 5000))
		    app.run(host='0.0.0.0', port=port, debug=app.debug)
1. Local host option with a limited number of dependencies - for offline editing on the train and in the airplane
1. Remote host option at <http://markx.herokuapp.com/> - no installation required
1. By scientists, for scientists

## Development Status

Markx is currently in development but can be used locally (see Installation instructions below) or remotely at <http://markx.herokuapp.com>.

It is still experimental, so **take care of your data!**

We would love to get feedback from anyone using it - Please [open an issue](https://github.com/yoavram/markx/issues) with any bug or suggestion. 
If you can't open an issue please contact Yoav on [twitter](http://www.twitter.com/yoavram) (you can use the `#markx` hashtag).

## Technology
  * Server side (this is what you need to install if you run it on localhost):
    * [Python] with [Flask] and [requests]
    * [Pandoc] - optional, for conversion to PDF, DOCX etc.
  * Client side (no installation required):
    * [PageDown] - [Stack Overflow]'s [Markdown] editor
    * [Google Code Prettifier] - Code highlighting
    * [MathJax] - Rendering of $LaTeX$ equations
    * [BibTeX-js] - Processing [BibTeX] citations
    * [Twitter Bootstrap] with [Glyphicons Free]
    * [Github.js] - integration with [GitHub]
  * 3rd Party services:
    * [GitHub] - version control hosting
    * [Docverter] - online conversion of Markdown to multiple formats (currently, citations are not supported)
    * [LaTeX-Online] - online compilation of LaTeX to PDF

## Install locally

1. Clone [this repository](https://github.com/yoavram/markx/)
1. Install [Python] - developed with version 2.7 
1. Install [Flask] and [requests]: `pip install Flask requests`
1. Run Markx by calling `python server.py` and pointing your browser at <http://localhost:5000>.
1. Load a BibTeX file with your citation library by choosing `Load a Bibliography File` from the `Bibliography` menu

More help can be found in the [help file](https://github.com/yoavram/markx/blob/master/HELP.md).

## License

[![](http://i.creativecommons.org/l/by-nc-sa/3.0/80x15.png)](http://creativecommons.org/licenses/by-nc-sa/3.0/)

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
[requests]: http://python-requests.org/
[LaTeX-Online]: https://github.com/aslushnikov/latex-online