from groq import Groq
from dotenv import load_dotenv
import os
import json
import traceback

load_dotenv()

# ── Validate API key ──────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise EnvironmentError(
        "GROQ_API_KEY not found. "
        "Create a .env file with: GROQ_API_KEY=your_key_here"
    )

client = Groq(api_key=GROQ_API_KEY)

# ─── Fallback response ────────────────────────────────────────────────────────
def _error_response(reason: str) -> dict:
    return {
        "summary": f"Analysis failed: {reason}",
        "key_points": [
            "Could not process the transcript.",
            "Check your GROQ_API_KEY in the .env file.",
            "Check backend terminal for detailed error logs.",
            "Verify the audio file contains clear English speech.",
            "Try again with a shorter audio clip."
        ],
        "flashcards": [
            {"q": "Why did the analysis fail?", "a": reason}
        ],
        "quiz": [
            {
                "question": "What should you check if analysis fails?",
                "options": [
                    "GROQ_API_KEY in .env",
                    "Backend terminal logs",
                    "Audio file quality",
                    "All of the above"
                ],
                "answer": "All of the above"
            }
        ]
    }


# ─── JSON cleaner ─────────────────────────────────────────────────────────────
def _clean_json_string(raw: str) -> str:
    """
    Strip any markdown fences, leading/trailing text,
    and extract only the {...} object.
    """
    # Remove ```json ... ``` or ``` ... ```
    if "```" in raw:
        lines = raw.splitlines()
        raw = "\n".join(
            line for line in lines
            if not line.strip().startswith("```")
        ).strip()

    # Find outermost { ... }
    start = raw.find("{")
    end   = raw.rfind("}") + 1

    if start == -1 or end == 0:
        return ""

    return raw[start:end]


# ─── Main processor ───────────────────────────────────────────────────────────
def process_transcript(transcript: str) -> dict:

    if not transcript or not transcript.strip():
        return _error_response("Empty transcript received.")

    prompt = f"""You are an AI Study Assistant. Analyze the lecture transcript and return ONLY a raw JSON object.

IMPORTANT RULES:
- Return ONLY the JSON object — no markdown, no code fences, no explanation
- Generate exactly 5 key_points, 5 flashcards, and 5 quiz questions
- Each quiz question must have exactly 4 options
- The answer field must exactly match one of the 4 options (copy it exactly)

Required JSON structure:
{{
    "summary": "3-5 sentence summary of the lecture.",
    "key_points": [
        "Key point 1",
        "Key point 2",
        "Key point 3",
        "Key point 4",
        "Key point 5"
    ],
    "flashcards": [
        {{"q": "Question 1?", "a": "Answer 1."}},
        {{"q": "Question 2?", "a": "Answer 2."}},
        {{"q": "Question 3?", "a": "Answer 3."}},
        {{"q": "Question 4?", "a": "Answer 4."}},
        {{"q": "Question 5?", "a": "Answer 5."}}
    ],
    "quiz": [
        {{
            "question": "Quiz question 1?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A"
        }},
        {{
            "question": "Quiz question 2?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option B"
        }},
        {{
            "question": "Quiz question 3?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option C"
        }},
        {{
            "question": "Quiz question 4?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option D"
        }},
        {{
            "question": "Quiz question 5?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A"
        }}
    ]
}}

Transcript:
{transcript}"""

    try:
        print("Calling Groq API...")

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a JSON-only API. "
                        "Output a single raw JSON object only. "
                        "No markdown, no code blocks, no explanation."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=2048
        )

        raw = response.choices[0].message.content.strip()

        print("\n===== RAW GROQ OUTPUT (first 600 chars) =====")
        print(raw[:600])
        print("=============================================\n")

        # ── Clean and extract JSON ────────────────────────────────────────────
        json_str = _clean_json_string(raw)

        if not json_str:
            print("ERROR: Could not extract JSON from Groq response.")
            print("Full raw output:\n", raw)
            return _error_response("Groq returned no JSON object.")

        result = json.loads(json_str)

        # ── Validate & patch missing keys ─────────────────────────────────────
        required = {"summary", "key_points", "flashcards", "quiz"}
        for key in required:
            if key not in result:
                print(f"WARNING: Missing key '{key}' — patching with empty value")
                result[key] = "No data." if key == "summary" else []

        # ── Validate quiz answers match options ───────────────────────────────
        for i, q in enumerate(result.get("quiz", [])):
            options = q.get("options", [])
            answer  = q.get("answer", "")
            if answer not in options and options:
                print(f"WARNING: Quiz Q{i+1} answer '{answer}' not in options — fixing to first option")
                result["quiz"][i]["answer"] = options[0]

        print("Analysis complete. Keys:", list(result.keys()))
        return result

    except json.JSONDecodeError as je:
        print(f"\nJSON PARSE ERROR: {je}")
        print("String that failed to parse:\n", json_str if 'json_str' in locals() else raw)
        return _error_response(f"JSON parse error: {je}")

    except Exception as e:
        print(f"\nGROQ ERROR: {e}")
        traceback.print_exc()
        return _error_response(str(e))
