from flask import Flask, render_template, request, send_file, send_from_directory
from flask_socketio import SocketIO 
from flask_cors import CORS 
import sys, json, os

app = Flask(__name__, static_url_path='/')
app.config['SECRET_KEY'] = 'abc123'
socketio = SocketIO(app)
cors = CORS(app,resources={r"/*":{"origins":"*"}})

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
with open(os.path.join(__location__,'playlist.json')) as json_file:
    playlist = json.load(json_file)

@app.route('/media/<path:path>')
def send_media(path):
    return send_from_directory('media', path)

@app.route('/')
def index():
    return render_template('player.html')

@app.route('/player.js')
def js():
    return send_file('player.js')

@socketio.on('connect')
def connect():
    print('Client Connected: '+ request.sid)

@socketio.on('disconnect')
def disconnect():
    print('Client Disconnected: '+request.sid)

@socketio.on('requestSong')
def requestSong(id):
    print('Next Song Requested');
    filename = playlist[id]['Filename']
    title = playlist[id]['Title']
    artist = playlist[id]['Artist']
    socketio.emit('playNext',filename+","+title+","+artist,broadcast=True,include_self=True)

socketio.run(app, debug=False, host='localhost')
