from flask import Flask, request, render_template, jsonify
import os
import bibi

# add environment variables using 'heroku config:add VARIABLE_NAME=variable_name'
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
GOOGLE_ANALYTICS = os.environ.get('GOOGLE_ANALYTICS', '')
BIB_FILE = os.environ.get('BIB_FILE', '')

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

@app.route("/")
def index():
	return render_template("index.html")
	

if __name__ == '__main__':
	# Bind to PORT if defined, otherwise default to 5000.
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port, debug=app.debug)
