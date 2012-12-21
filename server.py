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
PRETTIFY_STYLESHEETS = [ x[:-4] for x in os.listdir('static/prettify')]
DEFAULT_LATEX_PAPER_SIZE = 'a4paper'
FILES_FOLDER = 'files'
if not os.path.exists(FILES_FOLDER):
	os.mkdir(FILES_FOLDER)

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
    options = ['pandoc', path_to_file(filename + '.md'), '-o', path_to_file(filename + extension), '--ascii', '-s', '--variable=geometry:' + DEFAULT_LATEX_PAPER_SIZE]
    if os.path.exists(path_to_file(filename + '.bib')):
        options += ['--bibliography=' + path_to_file(filename + '.bib')]
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
    if extension == '.pdf' or extension == '.docx' or extension == '.epub':
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


@app.route("/")
def index():
	return render_template("index.html")
	

if __name__ == '__main__':
	# Bind to PORT if defined, otherwise default to 5000.
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port, debug=app.debug)
