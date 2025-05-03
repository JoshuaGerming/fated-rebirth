from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)


SAVE_DIR = "../saves"

@app.route("/save-profile", methods=["POST"])
def save_profile():
    data = request.get_json()
    name = data.get("name")
    hero_class = data.get("heroClass")

    if not name or not hero_class:
        return jsonify({"status": "error", "message": "Missing name or class"}), 400

    os.makedirs(SAVE_DIR, exist_ok=True)
    filepath = os.path.join(SAVE_DIR, f"{name}.json")

    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

    return jsonify({"status": "success", "message": "Profile saved"}), 200

@app.route("/list-profiles", methods=["GET"])
def list_profiles():
    os.makedirs(SAVE_DIR, exist_ok=True)
    files = [f for f in os.listdir(SAVE_DIR) if f.endswith(".json")]
    
    profiles = []
    for filename in files:
        filepath = os.path.join(SAVE_DIR, filename)
        with open(filepath, "r") as f:
            try:
                data = json.load(f)
                profiles.append(data)
            except Exception as e:
                print(f"Error reading {filename}: {e}")
    
    return jsonify(profiles)


if __name__ == "__main__":
    app.run(debug=True)

    
