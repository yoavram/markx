# Markx
## Help
Last update: 26 Feb 2013

[Markx] is a Markdown editor specifically designed for academic and scientific authoring. It highlights several advantages of Markdown (plain-text, multiple format conversion, easy version control) while still supplying the basic features which are a must for academic publications (citations, math rendering, layouts).

### Writing Markdown
[Markdown] is a markup language.

Markdown is very easy to learn and there are many online tutorials, just use Google.

#### Markdown Flavor
You should use **Pandoc-flavored Markdown** as both converters ([Pandoc] and [Docverter] use that). The HTML preview on the right is processed using [PageDown], so there could be some thing it doesn't process like Pandoc does (found something? open an [issue]).

#### Math
You can use $LaTeX$. Just write it between `$`s or `\\(` and `\\)` for inline equations and `$$`s or `\\[` and `\\]` for display mode:

- Inline mode $e=mc^2$
- Display mode: $$\frac{df(x)}{dx}=\lim_{x \to 0}{\frac{f(x+h)-f(x)}{h}}$$

#### Citations
To start working with citations in Markx you need to click the *Load a Bibliography file* from the *Citations* <i class="icon-books"></i> menu. The file should be in [BibTeX] format - if you don't have one than Markx doesn't support your citation format yet, but you might be able to convert a different format to BibTeX using online tools. If you use Mendeley it is easy to set it up to [sync to a BibTeX file](http://blog.mendeley.com/tipstricks/howto-use-mendeley-to-create-citations-using-latex-and-bibtex/). If you do not load a `.bib` file you will not be able to use the citations features of Markx. 

To insert a citation, find the citation key - usually the last name of the first author, with a capital initial, and the year of publication, without spaces. If the `.bib` file has more than one publication with that key they are post-fixed with lowercase letters. Then add the citation key to the editor, wrapped by `[@` and `]`.
For example: `[@Drake1991]`. Markx doesn't currently preview the citation keys in the previewed text, but it does:

1. create a bibliography at the bottom of the preview text
1. allows you to download a `.bib` file corresponding to the citation keys in the Markdown text via the *Download* <i class="icon-download-2"></i> menu
1. send the bibliography to [Pandoc] for conversion ([Docverter] does not support citations)

You must click the *Update Citations* button in the *Citations* <i class="icon-books"></i> menu after adding, removing or changing citation keys, as they will not be updated in real-time (this will be changed in the near future).

### Toolbar
1. Use the *GitHub* <i class="icon-github-2"></i> button to **sign-in to [GitHub]** (see more details below).
1. Use the *Screen* <i class="icon-screen"></i> button to change between **editor**, **preview** and **dual** modes.
1. Use the *Books* <i class="icon-books"></i> menu to **parse citation keys** such as [@Drake1991], to load a bibliography file, to see the loaded bibliography and the references you are citing.
1. Use the *Download* <i class="icon-download-2"></i> menu to **download and convert** the Markdown text to various formats or to download a [Markdown] of the text or a [BibTeX] file of the citations referenced in the text.
1. Click on **P** or **D** to **change the Markdown converter** between [Pandoc] and [Docverter]. 
  - Pandoc: must be installed on local machine when working locally, can't process image URLs, slow conversion to PDF on Windows, requires *pdflatex* to convert to PDF on local machine.
 - Docverter: must be connected to the internet to be used, doesn't process citation keys and bibliography.
1. Click the *Code* <i class="icon-code"></i> button to get change the **code highlighting styles**. Example code above.
1. The grey boxes with the numbers display the **word and character counts**.

### GitHub Integration
**Your [GitHub] username and password are never sent to the Markx server**. They are sent by JavaScript to directly to the GitHub API server using [Github.js]. Your credentials are not saved in cookies and are removed from the browser memory as soon as the sign in is complete. You can also sign out of GitHub by clicking the *sign out* <i class="icon-exit"></i> button. If you would like to check the security of this feature please view the `signinToGithub` function in [markx.js] and open an [issue] if you find any problems.

After you sign in to GitHub you can use the GitHub toolbar to:

1. Click the  *GitHub* <i class="icon-github-2"></i> button - this doesn't do anything right now.
1. Click the *Reload* <i cla=="icon-redo-2"></i> button o reload the repositories.
1. **Choose a repository** that you can pull from and push to (you are owner or collaborator)
1. Click the first *folder* <i class="icon-folder-open"></i> button  to load the **branch list**
1. **Choose a branch** if the selected repository
1. Click the second *folder* <i class="icon-folder-open"></i> button  to **load the files list**
1. **Choose a file** in the selected branch
1. Click the *download* <i class="icon-cloud-download"></i> button to **pull the file** to the editor. The current contents will be deleted without saving them.
1. Click the *upload* <i class="icon-cloud-upload"></i> button to **push the editor contents** to the selected file. This will create a new *commit* on the repository. You must **fill a commit message** before pushing. Commit messages should be ~50 characters and briefly explain the reason for this commit. After the push is finalized you will get a success or failure message. If you have citations, Markx will offer to push a bibliography file as well.
1. Click the *new* <i class="icon-file-4"></i> button to **create and push** a new empty file. If you don't fill the commit message Markx fill create adefault message for you. After the push is finalized you will get a success or failure message and the files list will be updated.
1. Click the *sign out* <i class="icon-exit"></i> button in the general toolbar to **sign out of GitHub**.

### Support
The best way to get support is to open an [issue]. If you can't open issue because you don't have a [GitHub] user, just get one, they are free. 

### Install locally

If the hosted app at <http://markx.herokuapp.com> doesn't work for you (which is possible as it is still rough around the edges) you can install Markx locally:

1. Install Python 2.7.x (may work with other versions of python)
1. If you know about `virtualenv`, you can use the bundled `requirements.txt` file
1. Otherwise, install the requirements globally with `pip install flask requests`
1. Optionally, install [Pandoc]
1. Run Markx with `python server.py`
1. Open your browser at <http://localhost:5000>

### Contribution
We would love for you to contribute to Markx. The project code is hosted in [GitHub][Markx]. Fork the project or open an [issue] so we can talk on how we can collaborate. 

The server side is written in Python with the [Flask] web framework (Ruby and Node equivalents are Sinatra and Express) and [requests] for connecting to [Docverter].
The two Markdown converters are [Pandoc] and [Docverter], which is a cloud-based Pandoc.

The client side is written with HTML+CSS+JS, using the JavaScript libraries:

1. [Twitter Bootstrap] and [jQuery] for the UI
1. [PageDown] as the Markdown real-time HTML converter 
1. [CodeMirror] as the Markdown editor
1. [Github.js] for the GitHub API
1. [Javascript BibTeX Parser] processing citation keys and bibliography files
1. [Google Code Prettifier] for code highlighting
1. [MathJax] for math rendering

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
[Javascript BibTeX Parser]: http://sourceforge.net/projects/jsbibtex/
[Stack Overflow]: http://stackoverflow.com/
[git]: http://git-scm.com/
[BibTeX]: http://www.bibtex.org/
[GitHub]: https://github.com/
[Github.js]: https://github.com/michael/github
[Docverter]: http://www.docverter.com/
[issue]: https://github.com/yoavram/markx/issues
[markx.js]: https://github.com/yoavram/markx/blob/master/static/js/markx.js
[Markx]: https://github.com/yoavram/markx
[requests]: http://python-requests.org/
[CodeMirror]: http://codemirror.net/
	