from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json

# ---------------------------------------------------
# 1) Create app, enable CORS
# ---------------------------------------------------
app = Flask(
    __name__,
    static_folder="../frontend",    # relative to this file
    static_url_path="/"             # serve at root URL
)
CORS(app)  # allow all origins by default

# ---------------------------------------------------
# 2) Save directory
# ---------------------------------------------------
SAVE_DIR = os.path.join(os.path.dirname(__file__), "saves")
os.makedirs(SAVE_DIR, exist_ok=True)

# ---------------------------------------------------
# 3) Routes to serve frontend
# ---------------------------------------------------
# Now http://127.0.0.1:5000/ will serve frontend/index.html
# CSS & JS will be served automatically.
# No more file:// loading or CORS headaches!
@app.route("/")
def index():
    return app.send_static_file("index.html")

# ---------------------------------------------------
# 4) Profile endpoints
# ---------------------------------------------------
@app.route("/save-profile", methods=["POST"])
def save_profile():
    data       = request.get_json()
    name       = data.get("name")
    hero_class = data.get("heroClass")
    stats      = data.get("stats")

    if not name or not hero_class or not stats:
        return jsonify({"status":"error","message":"Missing name, class or stats"}), 400

    # Build full profile object
    profile = {
        "name":      name,
        "heroClass": hero_class,
        "stats":     stats,
        "essence":   0,
        "gold":      0,
        "inventory": [],
        "equipped":  {"weapon": None, "armor": None, "accessory": None}
    }

    filepath = os.path.join(SAVE_DIR, f"{name}.json")
    with open(filepath, "w") as f:
        json.dump(profile, f, indent=2)

    return jsonify({"status":"success","message":"Profile created"})

@app.route("/list-profiles")
def list_profiles():
    profiles = []
    for fn in os.listdir(SAVE_DIR):
        if fn.endswith(".json"):
            with open(os.path.join(SAVE_DIR, fn)) as f:
                profiles.append(json.load(f))
    return jsonify(profiles)

@app.route("/update-profile", methods=["POST"])
def update_profile():
    data    = request.get_json()
    name    = data.get("name")
    updates = data.get("updates", {})

    filepath = os.path.join(SAVE_DIR, f"{name}.json")
    if not os.path.exists(filepath):
        return jsonify({"status":"error","message":"Profile not found"}), 404

    # Load, merge, and save
    with open(filepath) as f:
        profile = json.load(f)

    profile.update(updates)

    with open(filepath, "w") as f:
        json.dump(profile, f, indent=2)

    return jsonify(profile)

# ---------------------------------------------------
# 5) Run
# ---------------------------------------------------
if __name__ == "__main__":
    # Serve on http://127.0.0.1:5000/
    app.run(debug=True)
