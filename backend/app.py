# backend/app.py

import os, json
from flask import (
    Flask, request, jsonify,
    send_from_directory
)
from flask_cors import CORS
from flask_login import (
    LoginManager, UserMixin,
    login_user, login_required,
    current_user, logout_user
)

# ─── PATH SETUP ──────────────────────────────────────────────────────────────
BASE      = os.path.dirname(__file__)
FRONTEND = os.path.join(BASE, os.pardir, "frontend")
STATIC   = os.path.join(BASE, "static")

USERS_FILE = os.path.join(BASE, "users.json")
SAVE_DIR   = os.path.join(BASE, "saves")

# ─── FLASK + CORS + LOGIN ────────────────────────────────────────────────────
app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get("SECRET_KEY", "please-change-me")
CORS(app, supports_credentials=True)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# ─── USER MODEL ──────────────────────────────────────────────────────────────
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w") as f:
        json.dump({}, f)

class User(UserMixin):
    def __init__(self, username):
        self.id = username
@app.route("/")
def index():
    return send_from_directory(FRONTEND, "index.html")

# serve frontend/js files under /js/*
@app.route("/js/<path:filename>")
def frontend_js(filename):
    return send_from_directory(os.path.join(FRONTEND, "js"), filename)

# similarly serve frontend/css
@app.route("/css/<path:filename>")
def frontend_css(filename):
    return send_from_directory(os.path.join(FRONTEND, "css"), filename)

@login_manager.user_loader
def load_user(username):
    with open(USERS_FILE) as f:
        users = json.load(f)
    return User(username) if username in users else None

# ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    u, p = data.get("username","").strip(), data.get("password","")
    if not u or not p:
        return jsonify(status="error", msg="username & password required"), 400

    with open(USERS_FILE) as f:
        users = json.load(f)
    if u in users:
        return jsonify(status="error", msg="username taken"), 400

    users[u] = p  # <– in prod, hash your passwords!
    with open(USERS_FILE,"w") as f:
        json.dump(users, f, indent=2)
    return jsonify(status="success")

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    u, p = data.get("username","").strip(), data.get("password","")
    with open(USERS_FILE) as f:
        users = json.load(f)
    if users.get(u) != p:
        return jsonify(status="error", msg="invalid credentials"), 401

    user = User(u)
    login_user(user)
    return jsonify(status="success")

@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify(status="success")

# ─── FRONTEND & STATIC FILES ─────────────────────────────────────────────────
# Serve the SPA entrypoint:
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """
    1) if path starts with js/ or css/, serve from frontend/
    2) otherwise serve index.html
    """
    if path.startswith("js/") or path.startswith("css/"):
        return send_from_directory(FRONTEND, path)
    # fallback: everything else → index.html
    return send_from_directory(FRONTEND, "index.html")

# Serve avatar/portrait assets under /static/assets/…
@app.route("/static/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(STATIC, "assets"), filename)

# ─── PROFILE SAVE/LOAD HELPERS ────────────────────────────────────────────────
def user_dir(username):
    path = os.path.join(SAVE_DIR, username)
    os.makedirs(path, exist_ok=True)
    return path

@app.route("/list-profiles")
@login_required
def list_profiles():
    pdir = user_dir(current_user.id)
    return jsonify(
      [ fn[:-5] for fn in os.listdir(pdir) if fn.endswith(".json") ]
    )

@app.route("/save-profile", methods=["POST"])
@login_required
def save_profile():
    data = request.get_json() or {}
    name = data.get("name","").strip()
    if not name:
        return jsonify(status="error", msg="missing profile name"), 400

    path = os.path.join(user_dir(current_user.id), f"{name}.json")
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    return jsonify(status="success")

@app.route("/get-profile/<name>")
@login_required
def get_profile(name):
    path = os.path.join(user_dir(current_user.id), f"{name}.json")
    if not os.path.exists(path):
        return jsonify(status="error", msg="not found"), 404
    with open(path) as f:
        return jsonify(json.load(f))

@app.route("/update-profile", methods=["POST"])
@login_required
def update_profile():
    data    = request.get_json() or {}
    name    = data.get("name","").strip()
    updates = data.get("updates",{})
    if not name:
        return jsonify(status="error", msg="missing name"), 400

    path = os.path.join(user_dir(current_user.id), f"{name}.json")
    if not os.path.exists(path):
        return jsonify(status="error", msg="profile not found"), 404

    prof = json.load(open(path))
    prof.update(updates)
    with open(path,"w") as f:
        json.dump(prof, f, indent=2)
    return jsonify(prof)

# ─── RUN APP ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    os.makedirs(SAVE_DIR, exist_ok=True)
    app.run(debug=True)
