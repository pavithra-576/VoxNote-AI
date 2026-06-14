# 🎙️ VoxNote AI
Turn lectures into knowledge — instantly.
VoxNote AI converts any lecture, meeting, or audio recording into structured study notes, smart flashcards, and interactive quizzes using Whisper for transcription and Groq (Llama 3.3 70B) for AI analysis.

<img width="1720" height="877" alt="image" src="https://github.com/user-attachments/assets/811938be-1d81-4f1a-a068-8f1a9f388277" />

**✨ Features**

🎤 Upload or Record — drag & drop an audio file, or record live from your microphone
📝 Automatic Transcription — powered by OpenAI Whisper (runs locally, no API cost)
📌 AI Summary — concise 3-5 sentence overview of the lecture
🔑 Key Points — auto-extracted important takeaways
🧠 Flip Flashcards — click to reveal answers, perfect for revision
❓ Interactive Quiz — answer questions and get an instant score
📄 Export to PDF — download your notes, flashcards, and quiz as a clean PDF
📋 Copy Summary — one-click copy to clipboard
🕘 Session History — automatically saves your last session in the browser
🎨 Modern Dark UI — glassmorphic design with smooth animations



🛠 Tech Stack

LayerTechnologyFrontendHTML, CSS, Vanilla JavaScriptBackendFlask (Python)TranscriptionOpenAI Whisper (local)AI AnalysisGroq API — Llama 3.3 70BPDF ExportjsPDF


📂 Project Structure

VoxNote-AI/
├── frontend/
│   ├── index.html       # Main UI
│   ├── style.css         # Styling
│   └── script.js          # App logic
├── backend/
│   ├── app.py             # Flask server & routes
│   ├── stage2_processor.py # Groq AI analysis pipeline
│   ├── requirements.txt
│   └── .env               
├── screenshots/
└── README.md


🚀 Getting Started

Prerequisites


Python 3.10+
A free Groq API key
ffmpeg installed (required by Whisper)


1. Clone the repository

bashgit clone https://github.com/yourusername/VoxNote-AI.git
cd VoxNote-AI

2. Set up the backend

bashcd backend
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

3. Add your Groq API key

Create a .env file inside the backend/ folder:

GROQ_API_KEY=your_groq_api_key_here

4. Run the backend server

bashpython app.py

The Flask server will start at http://127.0.0.1:5000 — the first run will download the Whisper model (~150 MB for the "base" model).

5. Launch the frontend

Open frontend/index.html directly in your browser (double-click it), or use VS Code's Live Server extension.


💡 Tip: For best results, open the file directly (file://...) rather than through Live Server, to avoid CORS issues in some browsers.




🎯 Usage


Open the app in your browser
Choose Upload File or Record Live
Select/record your audio (.mp3, .wav, .m4a, .mp4)
Click Process Audio
Explore the Transcript, Summary, Key Points, Flashcards, and Quiz tabs
Export your notes as a PDF or copy the summary



🧪 Testing the Backend

To verify the AI pipeline works without uploading audio:

GET http://127.0.0.1:5000/test

This runs the Groq analysis on a sample transcript and returns a full JSON response.


⚙️ Configuration

SettingLocationDescriptionWhisper model sizeapp.py → whisper.load_model("base")Use "tiny", "small", "medium", or "large" for different speed/accuracy tradeoffsMax upload sizeapp.py → MAX_CONTENT_LENGTHDefault 500 MBBackend URLscript.js → BACKEND constantChange if hosting backend elsewhere


🗺 Roadmap


 Whisper transcription
 Groq-powered summary, key points, flashcards & quiz
 Drag & drop upload
 Live voice recording
 Flip flashcards
 Quiz scoring system
 PDF export
 Copy notes & session history
 User accounts & cloud history
 Multi-language support
 Export to Anki / Notion

🤝 Contributing

Contributions, issues, and feature requests are welcome!
Fork the project
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

🙏 Acknowledgements
OpenAI Whisper for transcription
Groq for blazing-fast LLM inference
jsPDF for PDF generation

