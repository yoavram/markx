# -*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

from flask import Flask, request, render_template, jsonify, Response, send_file
import os
import os.path
import subprocess
import requests
import distutils.spawn

DEBUG = os.environ.get('DEBUG', 'True') == 'True'
GOOGLE_ANALYTICS = os.environ.get('GOOGLE_ANALYTICS', '')
PRETTIFY_STYLESHEETS_FOLDER = '/static/css/prettify/' # server folder
PRETTIFY_STYLESHEETS = [ x[:-4] for x in os.listdir(os.path.join('static'  , 'css' , 'prettify', ''))] # local filesystem folder
DEFAULT_LATEX_PAPER_SIZE = 'a4paper'
FILES_FOLDER = 'files'
if not os.path.exists(FILES_FOLDER):
    os.mkdir(FILES_FOLDER)
CSL_FOLDER = 'static' + os.path.sep + 'csl'
CSL_FILES = [ x for x in os.listdir(CSL_FOLDER) if x.endswith('.csl')]
ABBR_FILES = [ x for x in os.listdir(CSL_FOLDER) if x.endswith('.abbr')]
DEFAULT_TEXT_FILE = "HELP.md"
with open(DEFAULT_TEXT_FILE,'r') as f:
    DEFAULT_TEXT = f.read()
PANDOC_EXTENSIONS = ['pdf', 'odt', 'docx', 'epub', 'html']    
DOCVERTER_URL =   'http://c.docverter.com/convert'
PDFLATEX_EXISTS = distutils.spawn.find_executable("pdflatex") != None

app = Flask(__name__)
app.config.from_object(__name__) 
print " * Overriding default configuration with config.py file"
app.config.from_pyfile('config.py', silent=True)
if app.debug:
    print " * Running in debug mode"


mimetypes = {'md':'text/x-markdown', 'bib':'text/x-bibtex','html':'text/html','htm':'text/html','pdf':'application/pdf', 'latex':'application/x-latex', 'docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','epub':'application/epub+zip','odt':'application/vnd.oasis.opendocument.txt'}
def get_mimetype(extension):
    return mimetypes.get(extension, 'application/octet-stream')


def path_to_file(filename):
    return FILES_FOLDER + os.path.sep + filename


def just_the_filename(path):
    return os.path.splitext(os.path.basename(path))[0]


def save_text_file(filename, content):
    filepath = path_to_file(filename)
    with open(filepath, 'w') as f:
        f.write(content)
    return filepath


def pandoc(filename, extension, bibpath):
    outname = path_to_file(filename + '.' + extension)
    options = ['pandoc', path_to_file(filename + '.md'), '-o', outname]
    options += ['--from', 'markdown+tex_math_double_backslash'] # --to inferred from outname 
    options += ['--standalone'] #--toc
    options += ['--variable=geometry:' + DEFAULT_LATEX_PAPER_SIZE]
    options += ['--mathjax']
    if os.path.exists(bibpath):
        options += ['--bibliography=' + bibpath]
    if 'CSL_FILES' in app.config and len(app.config['CSL_FILES']) > 0:
        csl_file = app.config['CSL_FILES'][0]
        options += ['--csl=' + os.path.join(CSL_FOLDER, csl_file)]
    if 'ABBR_FILES' in app.config and len(app.config['ABBR_FILES']) > 0:
        abbr_file = app.config['ABBR_FILES'][0]
        options += ['--citation-abbreviations=' + os.path.join(CSL_FOLDER, abbr_file)]
    print ' * Sending command to Pandoc for file', filename, 'with options', options
    p = subprocess.Popen(options, stdout=subprocess.PIPE)
    stdoutdata, stderrdata = p.communicate()
    if stderrdata:
        print ' * Command failed:', stderrdata
        return False, "Pandoc failed: " + stderrdata
    else:
        print ' * Command was successful:', stdoutdata
        return True, filename + '.' + extension


def docverter(filename, extension, bibpath):
    print ' * Sending request to Docverter for file', filename
    with open(path_to_file(filename + '.md')) as filestream:
        docverter_response = requests.post(app.config['DOCVERTER_URL'], data={
            'to': extension,
            'from': 'markdown',
            'variable': 'geometry:' + app.config['DEFAULT_LATEX_PAPER_SIZE']
            },
                files={
                'input_files[]': filestream 
            })
    if docverter_response.ok:
        print ' * Request was successful:', docverter_response.status_code
        outname = filename + '.' + extension
        with open(path_to_file(outname), 'wb') as fout:
            fout.write(docverter_response.content)
        return True, outname
    else:
        print ' * Request failed:', docverter_response.status_code
        return False, docverter_response.status_code


@app.route('/save', methods=["POST"])
def save():
    content = request.form.get('content', '', type=unicode)
    bibtex = request.form.get('bibtex', '', type=str)
    extension = request.form.get('extension', 'md', type=str).lower()
    filename = request.form.get('filename', 'markx', type=str)
    converter = request.form.get('converter', 'pandoc', type=str)
    if converter == 'docverter':
        converter = docverter
    elif converter == 'pandoc':
         converter = pandoc
    else:
        return jsonify(error="Converter named %s not found" % converter)
    filename = just_the_filename(filename)
    filepath = save_text_file(filename + '.md', content)
    bibpath = save_text_file(filename + '.bib', bibtex)
    if extension == 'md':
        success, result = True, filename + '.md'
    elif extension == 'bib':
        success, result = True, filename + '.bib'
    else:
        success, result = converter(filename, extension, bibpath)
    if success:
        return jsonify(result=result)
    else:
        return jsonify(error=result)


@app.route('/download/<string:filename>')
def download(filename):
    extension = os.path.splitext(filename)[1][1:].strip()
    mimetype = get_mimetype(extension)
    return send_file(path_to_file(filename), mimetype=mimetype, as_attachment=True, attachment_filename=filename,  cache_timeout=0)


@app.route('/view/<string:filename>')
def view(filename):
    extension = os.path.splitext(filename)[1][1:].strip()
    mimetype = get_mimetype(extension)
    return send_file(path_to_file(filename), mimetype=mimetype, as_attachment=False, cache_timeout=0)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))            
    app.run(host='0.0.0.0', port=port, debug=app.debug)

