from flask import Flask, request, render_template, jsonify, Response, send_file
import os
import bibi

DEBUG = os.environ.get('DEBUG', 'True') == 'True'
BIB_FILE = os.environ.get('BIB_FILE', '')
PRETTIFY_STYLESHEETS = [ x[:-4] for x in os.listdir('static/prettify')]


app = Flask(__name__)
app.config.from_object(__name__)  
app.config.from_pyfile('config.py')
if app.debug:
	print " * Running in debug mode"


bib = bibi.parse_file(app.config['BIB_FILE'])


@app.route('/bibtex')
def bibtex():
    keys = [request.args.get('key', '', type=str)]
    string = bibi.to_string(bib, keys)
    return jsonify(result=string)


@app.route('/save')
def save():
    content = request.args.get('content', '', type=unicode)
    extension = request.args.get('extension', '', type=unicode)
    fname = 'tmp.' + extension
    f = open(fname, 'w')
    f.write(content)
    f.close()
    return jsonify(result=fname)


@app.route('/download/<string:filename>')
def download(filename):
	if filename.endswith('md'):
		mimetype = 'text/x-markdown'
	elif filename.endswith('bib'):
		mimetype = 'text/x-bibtex'
	else:
		mimetype = 'application/octet-stream'
	return send_file(filename, mimetype=mimetype, as_attachment=True, attachment_filename=filename)


@app.route("/")
def index():
	return render_template("index.html")
	

if __name__ == '__main__':
	# Bind to PORT if defined, otherwise default to 5000.
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port, debug=app.debug)
