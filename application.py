import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, disconnect

from collections import deque

app = Flask(__name__)

# socket-io configure
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# replacing DB rn, TODO
USERS = {}
CHANNELS = {}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on('connect')
def connection():
    print("new user connected")

@socketio.on('userdata')
def user_data(data):
    if data['username'] in USERS:
        disconnect()
    else:
        USERS[data['username']] = request.sid

@socketio.on('new channel')
def new_channel(data):
    if data['name'] in CHANNELS:
        return False
    else:
        CHANNELS[data['name']] = deque(maxlen=100)
        emit('new channel', data['name'], broadcast=True)

@socketio.on('new msg')
def new_msg(data):
    
    if 'channel' in data:
        CHANNELS[data['channel']].append(data['message'])
        emit('new msg', data, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True, use_reloader=True)