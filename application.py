import os

from flask import Flask, render_template, request, jsonify, session, redirect
from flask_session import Session
from flask_socketio import SocketIO, emit

from helpers import login_required

app = Flask(__name__)

# session configure
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = 'filesystem'
Session(app)

# socket-io configure
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# replacing DB rn, TODO
USERS = {}
CHANNELS = {}

@app.route("/")
@login_required
def index():

    username = session["username"]

    return render_template("index.html", username=username)

@app.route("/login", methods=["GET", "POST"])
def login():
    """
        Log in user
        TODO: If display name is claimed with password, require a password, else let them in
    """

    # clear any previous user
    session.clear()

    if request.method == 'POST':

        username = request.form.get("username")

        # get display name
        if not username:
            return render_template("login.html")


        # check if username is unique
        if username in USERS:
            return "Username already taken!"

        USERS[username] = username

        session["username"] = username

        return redirect("/")

    return render_template("login.html")

if __name__ == "__main__":
    socketio.run(app, debug=True, use_reloader=True)