from flask import Flask, render_template, send_from_directory

app = Flask(__name__, static_folder='web-app', template_folder='web-app')

@app.route('/')
def login():
    return send_from_directory('web-app', 'login.html')

@app.route('/index.html')
def index():
    return send_from_directory('web-app', 'index.html')

# Serve static files
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('web-app', path)

if __name__ == '__main__':
    app.run(debug=True)