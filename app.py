from __future__ import annotations

from pathlib import Path

from flask import Flask, jsonify, redirect, request, send_from_directory
from werkzeug.exceptions import NotFound

from expert_system import evaluate_student, list_rules


ROOT = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT / "public"

app = Flask(__name__, static_folder=str(PUBLIC_DIR), static_url_path="")


@app.get("/")
def index():
    return redirect("/index.html", code=302)


@app.get("/<path:path>")
def public_file(path: str):
    return send_from_directory(PUBLIC_DIR, path)


@app.post("/api/evaluate")
def evaluate():
    facts = request.get_json(silent=True) or {}
    return jsonify(evaluate_student(facts))


@app.get("/api/rules")
def rules():
    return jsonify({"rules": list_rules()})


@app.errorhandler(404)
def fallback(error: NotFound):
    path = request.path.strip("/")
    if not path:
        return redirect("/index.html", code=302)

    candidate = PUBLIC_DIR / path
    if candidate.is_file():
        return send_from_directory(PUBLIC_DIR, path)

    return error
