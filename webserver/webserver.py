from flask import Flask, render_template, request, send_file, send_from_directory
from flask_socketio import SocketIO 
from flask_cors import CORS 
import sys, json, os

app = Flask(__name__, static_url_path='/')
app.config['SECRET_KEY'] = 'abc123'
socketio = SocketIO(app)
cors = CORS(app,resources={r"/*":{"origins":"*"}})
playlist = []
playlist_index = 0
playlist_error = False

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

def loadPlaylist():
    global playlist, playlist_error
    try:
        with open(os.path.join(__location__,'playlist.json')) as json_file:
            playlist = json.load(json_file)
    except:
        playlist_error = True

@app.route('/media/<path:path>')
def send_media(path):
    return send_from_directory('media', path)

@app.route('/')
def index():
    return render_template('player.html')

@app.route('/remote')
def remote():
    return render_template('remote.html')

@app.route('/player.js')
def playerJS():
    return send_file('player.js')

@app.route('/remote.js')
def remoteJS():
    return send_file('remote.js')

@socketio.on('connect')
def connect():
    print('Client Connected: '+ request.sid)

@socketio.on('disconnect')
def disconnect():
    print('Client Disconnected: '+request.sid)

@socketio.on('requestSong')
def requestSong():
    global playlist,playlist_index,playlist_error
    if(playlist_error):
        socketio.emit('error','Playlist failed to load',broadcast=True,include_self=True)
    else:
        if(playlist_index >= len(playlist)) or (playlist_index < 0):
            playlist_index = 0
        filename = playlist[playlist_index]['Filename']
        title = playlist[playlist_index]['Title']
        artist = playlist[playlist_index]['Artist']
        socketio.emit('playNext',filename+","+title+","+artist,broadcast=True,include_self=True)

@socketio.on('pause')
def pauseSong():
    socketio.emit('pause',broadcast=True,include_self=True)

@socketio.on('skip')
def skipSong(direction):
    global playlist,playlist_index,playlist_error
    if(direction == 'forward'):
        playlist_index+=1
    if(direction == 'backward'):
        playlist_index-=1
    print(playlist_index)
    requestSong()


loadPlaylist()
socketio.run(app, debug=False, host='localhost')
