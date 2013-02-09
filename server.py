# -*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

from flask import Flask, request, render_template, jsonify, Response, send_file
import os
import os.path
import bibi
import subprocess
import requests

DEBUG = os.environ.get('DEBUG', 'True') == 'True'
BIB_FILE = os.environ.get('BIB_FILE', '')
PRETTIFY_STYLESHEETS_FOLDER = '/static/css/prettify/' # server folder
PRETTIFY_STYLESHEETS = [ x[:-4] for x in os.listdir(os.path.join('static'  , 'css' , 'prettify', ''))] # local filesystem folder
DEFAULT_LATEX_PAPER_SIZE = 'a4paper'
FILES_FOLDER = 'files'
if not os.path.exists(FILES_FOLDER):
	os.mkdir(FILES_FOLDER)
CSL_FOLDER = 'static' + os.path.sep + 'csl'
CSL_FILES = [ x for x in os.listdir(CSL_FOLDER) if x.endswith('.csl')]
ABBR_FILES = [ x for x in os.listdir(CSL_FOLDER) if x.endswith('.abbr')]
DEFAULT_TEXT_FILE = "README.md"
with open(DEFAULT_TEXT_FILE,'r') as f:
    DEFAULT_TEXT = f.read()
PANDOC_EXTENSIONS = ['pdf', 'docx', 'epub', 'html']    
DOCVERTER_URL =   'http://c.docverter.com/convert'

app = Flask(__name__)
app.config.from_object(__name__) 
print " * Overriding deafult configuration with config.py file"
app.config.from_pyfile('config.py')
if app.debug:
	print " * Running in debug mode"
bib = bibi.parse_file(app.config['BIB_FILE'])


mimetypes = {'md':'text/x-markdown', 'bib':'text/x-bibtex','html':'text/html','htm':'text/html','pdf':'application/pdf', 'latex':'application/x-latex', 'docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','epub':'application/epub+zip'}
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


def pandoc(filename, extension):
    outname = path_to_file(filename + '.' + extension)
    options = ['pandoc', path_to_file(filename + '.md'), '-o', outname]
    options += ['--ascii', '-s', '--toc']
    options += ['--variable=geometry:' + DEFAULT_LATEX_PAPER_SIZE]
    if os.path.exists(path_to_file(filename + '.bib')):
        options += ['--bibliography=' + path_to_file(filename + '.bib')]
    if 'CSL_FILES' in app.config and len(app.config['CSL_FILES']) > 0:
        csl_file = app.config['CSL_FILES'][0]
        options += ['--csl=' + os.path(CSL_FOLDER, csl_file)]
    if 'ABBR_FILES' in app.config and len(app.config['ABBR_FILES']) > 0:
        abbr_file = app.config['ABBR_FILES'][0]
        options += ['--citation-abbreviations=' + os.path(CSL_FOLDER, abbr_file)]
    try:
        print ' * Sending command to Pandoc for file', filepath
        pandoc_result = subprocess.check_call(options)
        print ' * Command was successful:', pandoc_result
        return True, outname
    except subprocess.CalledProcessError as e:
        print ' * Command failed:', e.returncode
        return False, "pandoc return code " + e.returncode


def docverter(filename, extension):
    print ' * Sending request to Docverter for file', filename
    with open(path_to_file(filename + '.md')) as filestream:
        docverter_response = requests.post(app.config['DOCVERTER_URL'], data={
            'to': extension,
            'from': 'markdown',
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
    bibtex = request.form.get('bibtex', '', type=str).lower()
    extension = request.form.get('extension', 'md', type=str).lower()
    filename = request.form.get('filename', 'markx', type=str)
    converter = request.form.get('converter', 'docverter', type=str)
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
        success, result = converter(filename, extension)
    if success:
        return jsonify(result=result)
    else:
        return jsonify(error=result)


@app.route('/bibtex')
def bibtex():
    keys = [request.args.get('key', '', type=str)]
    string = bibi.to_string(bib, keys)
    return jsonify(result=string)


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
