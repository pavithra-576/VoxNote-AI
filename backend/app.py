from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import whisper
import traceback
from werkzeug.utils import secure_filename

from stage2_processor import process_transcript

app = Flask(__name__)

# ── CORS: allow ALL origins (fixes frontend fetch being blocked) ───────────────
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"mp3", "wav", "m4a", "mp4", "ogg", "webm"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 500 * 1024 * 1024   # 500 MB max

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

print("=" * 50)
print("Loading Whisper Model...")
model = whisper.load_model("base")
print("Whisper Loaded Successfully")
print("=" * 50)


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def transcribe_audio(file_path):
    print("\nStarting transcription...")
    start = time.time()

    result = model.transcribe(
        file_path,
        fp16=False,
        language="en"
    )

    elapsed = round(time.time() - start, 2)
    text = result.get("text", "").strip()

    print("\n===== TRANSCRIPT =====")
    print(text[:500] if text else "[EMPTY]")
    print("======================")
    print(f"Transcription done in {elapsed}s")

    return text


# ─── OPTIONS preflight handler (fixes CORS preflight failures) ────────────────
@app.route("/upload", methods=["OPTIONS"])
def upload_preflight():
    response = jsonify({"status": "ok"})
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response, 200


# ─── Health check ─────────────────────────────────────────────────────────────
@app.route("/")
def home():
    return jsonify({
        "status": "running",
        "message": "VoxNote AI Backend is running"
    })


# ─── Diagnostic test (no audio needed) ───────────────────────────────────────
@app.route("/test", methods=["GET"])
def test_groq():
    dummy = (
        "The mitochondria is the powerhouse of the cell. "
        "It produces ATP through cellular respiration. "
        "The process involves glycolysis, the Krebs cycle, "
        "and the electron transport chain."
    )
    analysis = process_transcript(dummy)
    return jsonify({
        "status": "ok",
        "transcript": dummy,
        "analysis": analysis
    })


# ─── Main upload route ────────────────────────────────────────────────────────
@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        print("\n" + "=" * 50)
        print("NEW REQUEST RECEIVED")
        print(f"Content-Type : {request.content_type}")
        print(f"Files in req : {list(request.files.keys())}")
        print("=" * 50)

        # ── 1. Validate file presence ─────────────────────────────────────────
        if "file" not in request.files:
            print("ERROR: 'file' key missing from request.files")
            print("All form keys:", list(request.form.keys()))
            return jsonify({"error": "No file uploaded. Make sure the field name is 'file'."}), 400

        file = request.files["file"]

        if not file or file.filename == "":
            print("ERROR: Empty filename")
            return jsonify({"error": "No file selected"}), 400

        # ── 2. Secure & save ──────────────────────────────────────────────────
        filename = secure_filename(file.filename)
        if not filename:
            filename = f"upload_{int(time.time())}.wav"

        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        size_mb = round(os.path.getsize(filepath) / 1024 / 1024, 2)
        print(f"Saved : {filepath}  ({size_mb} MB)")

        # ── 3. Transcribe ─────────────────────────────────────────────────────
        print("\nSTEP 1: TRANSCRIBING")
        transcript = transcribe_audio(filepath)

        if not transcript:
            return jsonify({
                "error": "No speech detected. Please check the audio file."
            }), 422

        # ── 4. Analyse ────────────────────────────────────────────────────────
        print("\nSTEP 2: AI ANALYSIS")
        analysis = process_transcript(transcript)

        if not analysis:
            return jsonify({
                "error": "AI analysis returned empty. Check GROQ_API_KEY."
            }), 500

        print("\n===== ANALYSIS PREVIEW =====")
        print(str(analysis)[:400])
        print("============================")

        # ── 5. Clean up uploaded file (optional — saves disk space) ──────────
        try:
            os.remove(filepath)
        except Exception:
            pass

        # ── 6. Return ─────────────────────────────────────────────────────────
        return jsonify({
            "filename":   filename,
            "transcript": transcript,
            "analysis":   analysis
        })

    except Exception as e:
        print("\n===== SERVER ERROR =====")
        traceback.print_exc()
        print("========================")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
