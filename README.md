# Markx

*Markx* is a [Markdown] editor for scientific writing. 

![](https://raw.github.com/yoavram/markx/master/screenshot.png)

It imitates the [Pandoc] flavor of [Markdown] to facilitate conversion to multiple formats and 
to enjoy the numerous [Markdown] extensions in [Pandoc].

It runs in your browser with a limited number of requirements.

It is free (beer and speech).

*Markx* is currently in development but the *master* branch is working localy and can be used on machines with [Python].
We would love to get feedback from anyone using it.

## Features

1. Zenware
1. Realtime preview
1. Display math - $x^2+y^2=r^2$
1. Imitating the [Markdown] flavor of [Pandoc]
1. Citations using [Pandoc]+[BibTeX]: [@Drake1991]
1. Code highlighting:
		
		if __name__ == '__main__':
		    # Bind to PORT if defined, otherwise default to 5000.
		    port = int(os.environ.get('PORT', 5000))
		    app.run(host='0.0.0.0', port=port, debug=app.debug)

## Future Features

1. Export to multiple format
1. Integration with [git]

## Technology
  * Server side (this is what you need to install if you run it on localhost):
    * [Python] with [Flask]
  * Client side (no installation required):
    * [PageDown] - [Stack Overflow]'s [Markdown] editor
    * [Google Code Prettifier] - Code highlighting
    * [MathJax] - Rendering of $LaTeX$ equations
    * [BibTeX-js] - Processing [BibTeX] citations
    * [Twitter Bootstrap] with [Glyphicons Free]


## Install

1. Clone this repo
2. Install [Python] and [Flask] (`pip install Flask`)
3. Add an environment variable named `BIB_FILE` with the path to your BibTeX `.bib` file, or create `config.py` file with the key-value `BIB_FILE = /path/to/bib/file`.
4. Run the editor locally by calling `python server.py` and opening your browser at <http://localhost:5000>.

## TODO

1. `--toc` option
1. Interface to *git*
1. Help/About page
1. Interface to *Mendeley*?
1. *Python*/*R* interfcace (*knitr*/*Rmd*/*ipython notebook*)?
1. Replace *Python*/*Flask* with *node.js*?
1. Put more stuff on TODO list

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
[BibTeX-js]: http://bibtex-js.googlecode.com/
[Stack Overflow]: http://stackoverflow.com/
[git]: http://git-scm.com/
[BibTeX]: http://www.bibtex.org/
