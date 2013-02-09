# Markx

*Markx* is a [Markdown] editor for scientific writing.

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

## Help

### Writing Markdown
[Markdown] is a markup language.

Markdown is very easy to learn and there are many tutorials, just use Google.
You should use *Pandoc-flavored Markdown* as both converters ([Pandoc] and [Docverter] use that). The HTML preview on the right is processed using [PageDown], so there could be some thing it doesn't process like Pandoc does (found something? open an [issue]).

For equations you can use [LaTeX] - just write it between `$`s or `\\(` and `\\)` for inline equations and `$$`s or `\\[` and `\\]` for display mode:

- Inline mode $e=mc^2$
- Display mode: $$\frac{df(x)}{dt}=lim_{x \to 0}{\frac{f(x+h)-f(x)}{h}}$$

### Toolbar
1. Use the <i class="icon-github-2"></i> button to **sign-in to [GitHub]** (see more details below).
1. Use the <i class="icon-screen"></i> button to change between **editor**, **preview** and **dual** modes.
1. Use the <i class="icon-books"></i> button to **parse citation keys** such as [@Drake1991].
1. Use the <i class="icon-download-2"></i> button to **download and convert** the Markdown text to various format or to download a *BibTeX* file of the citations referenced in the text.
1. Click on **P** or **D** to **change the Markdown converter** between [Pandoc] and [Docverter]. 
  - Pandoc: must be installed on local machine, can't process image URLs, slow conversion to PDF on Windows, requires *pdflatex* to convert to PDF.
 - Docverter: must be connected to the internet to be used, doesn't process citation keys and bibliography.
1. Click the <i class="icon-code"></i> button to get change the **code highlighting styles**. Example code above.
1. The grey box withe the numbers displays the text **word count**.

### GitHub Integration
Your [GitHub] username and password are **never sent to the Markx server**. They are sent by JavaScript to directly to the GitHub API server. Your credentials are not saved in cookies and are removed from the browser memory as soon as the sign in is complete. If you would like to check the security of this feature please view the `signinToGithub` function in [markx.js] and open an [issue] if you find any problems.

After you sign in to GitHub you can use the GitHub toolbar to:

1. Click the  <i class="icon-github-2"></i> button - this doesn't do anything right now.
1. Change the username - doesn't do anything yet.
1. Choose a repository that belongs to the specified user.
1. Click the first <i class="icon-folder-open"></i> to load the branch list
1. Choose a branch if the selected repository
1. Click the second<i class="icon-folder-open"></i> to load the files list (currently only loads a single level, no subfolders)
1. Choose a file in the selected branch
1. Click <i class="icon-cloud-download"></i> button to **pull the file** to the editor. The current contents will be deleted without saving them.
1. Click <i class="icon-cloud-upload"></i> button to **push the editor contents** to the selected file. This will create a new *commit* on the repository. You must **fill a commit message** before pushing. Commit messages should be ~50 characters and briefly explain the reason for this commit.

There is currently no support for creation of new files. You can do that on GitHub or using `git`. There is also no way to commit the `.bib` citations file to GitHub via Markx. These features will be added in the future.

### Editor Toolbar
The buttons above the editor window are part of the [PageDown] markdown editor. They allow quick shortcuts to common Markdown markups.

## References
The references header is **your** job, [Pandoc] will only create a citation list, without a header. However, it will always put it at the end of the output file (at least via Markx) so you can just put a *References* header at the end of your file.

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
[issue]: https://github.com/yoavram/markx/issues
[markx.js]: https://github.com/yoavram/markx/blob/master/static/js/markx.js
	