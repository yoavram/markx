# -*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

from flask import Flask, request, render_template, jsonify, Response, send_file
import os
import os.path
import bibi
import subprocess

DEBUG = os.environ.get('DEBUG', 'True') == 'True'
BIB_FILE = os.environ.get('BIB_FILE', '')
PRETTIFY_STYLESHEETS = [ x[:-4] for x in os.listdir('static'  + os.path.sep + 'prettify')]
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
PANDOC_EXTENSIONS = ['.pdf', '.docx', '.epub', '.html', '.htm']    

app = Flask(__name__)
app.config.from_object(__name__)  
app.config.from_pyfile('config.py')
if app.debug:
	print " * Running in debug mode"


bib = bibi.parse_file(app.config['BIB_FILE'])

mimetypes = {'md':'text/x-markdown', 'bib':'text/x-bibtex','html':'text/html','htm':'text/html','pdf':'application/pdf', 'latex':'application/x-latex', 'docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','epub':'application/epub+zip'}
def get_mimetype(extension):
	return mimetypes.get(extension, 'application/octet-stream')

def path_to_file(filename):
	return FILES_FOLDER + os.path.sep + filename

def save_text_file(filename, content):
    filepath = path_to_file(filename)
    f = open(filepath, 'w')
    f.write(content)
    f.close()
    return filepath

def pandoc(filename, extension):
    # TODO manage pandoc errors, for example exit status 43 when citations include Snigowski et al. 2000
    options = ['pandoc', path_to_file(filename + '.md'), '-o', path_to_file(filename + extension)]
    options += ['--ascii', '-s', '--toc']
    options += ['--variable=geometry:' + DEFAULT_LATEX_PAPER_SIZE]
    if os.path.exists(path_to_file(filename + '.bib')):
        options += ['--bibliography=' + path_to_file(filename + '.bib')]
    if 'CSL_FILES' in app.config and len(app.config['CSL_FILES']) > 0:
        csl_file = app.config['CSL_FILES'][0]
        options += ['--csl=' + CSL_FOLDER + os.path.sep + csl_file]
    if 'ABBR_FILES' in app.config and len(app.config['ABBR_FILES']) > 0:
        abbr_file = app.config['ABBR_FILES'][0]
        options += ['--citation-abbreviations=' + CSL_FOLDER + os.path.sep + abbr_file]
    print options
    return subprocess.check_call(options)

@app.route('/bibtex')
def bibtex():
    keys = [request.args.get('key', '', type=str)]
    string = bibi.to_string(bib, keys)
    return jsonify(result=string)

@app.route('/save', methods=['POST'])
def save():
    content = request.form.get('content', '', type=unicode)
    filename = request.form.get('filename', 'markx', type=unicode)
    extension = request.form.get('extension', '', type=unicode)
    if extension:
    	extension = '.' + extension
    full_filename = filename + extension
    if extension in app.config['PANDOC_EXTENSIONS']:
    	save_text_file(filename + '.md', content)
    	pandoc(filename, extension)
    else:
    	save_text_file(full_filename, content)
    return jsonify(result=full_filename)


@app.route('/download/<string:filename>')
def download(filename):
	extension = os.path.splitext(filename)[1][1:].strip()
	mimetype = get_mimetype(extension)
	return send_file(path_to_file(filename), mimetype=mimetype, as_attachment=True, attachment_filename=filename)


@app.route('/view/<string:filename>')
def view(filename):
    extension = os.path.splitext(filename)[1][1:].strip()
    mimetype = get_mimetype(extension)
    return send_file(path_to_file(filename), mimetype=mimetype, as_attachment=False)

@app.route("/")
def index():
	return render_template("index.html")
	

if __name__ == '__main__':
	# Bind to PORT if defined, otherwise default to 5000.
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port, debug=app.debug)
