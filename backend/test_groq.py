 groq import Groq
from dotenv import load_dotenv
import os

# Load API key from .env
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def process_transcript(transcript: str):
    prompt = f"""
You are an AI study assistant.

Convert the following lecture transcript into structured learning material.

⚠️ RETURN ONLY VALID JSON. NO extra text.

JSON FORMAT:
{{
  "summary": "Short clean summary",
  "key_points": [
    "Point 1",
    "Point 2",
    "Point 3"
  ],
  "flashcards": [
    {{
      "q": "Question 1",
      "a": "Answer 1"
    }},
    {{
      "q": "Question 2",
      "a": "Answer 2"
    }}
  ],
  "quiz": [
    {{
      "question": "MCQ question",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct option"
    }}
  ]
}}

LECTURE TRANSCRIPT:
{transcript}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content


# -------------------------
# TEST RUN (IMPORTANT)
# -------------------------
if __name__ == "__main__":
    print("RUNNING STAGE 2 TEST...")

    transcript = """
    Web development includes frontend and backend.
    Frontend uses HTML, CSS, JavaScript.
    Backend handles servers and databases.
    """

    result = process_transcript(transcript)

    print(result)
