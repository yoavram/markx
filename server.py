from flask import Flask, request, render_template
import os

# add environment variables using 'heroku config:add VARIABLE_NAME=variable_name'
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
GOOGLE_ANALYTICS = os.environ.get('GOOGLE_ANALYTICS', '')

app = Flask(__name__)
app.config.from_object(__name__)  
if app.debug:
	print " * Running in debug mode"


@app.route("/")
def index():
	return render_template("index.html")
	

if __name__ == '__main__':
	# Bind to PORT if defined, otherwise default to 5000.
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port, debug=app.debug)
