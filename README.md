# 🎙️ VoxNote AI
Turn lectures into knowledge — instantly.
VoxNote AI converts any lecture, meeting, or audio recording into structured study notes, smart flashcards, and interactive quizzes using Whisper for transcription and Groq (Llama 3.3 70B) for AI analysis.

## 📸 Preview

<img width="1720" height="877" alt="image" src="https://github.com/user-attachments/assets/811938be-1d81-4f1a-a068-8f1a9f388277" />

## ✨ Features

- 🎤 **Upload or Record** — drag & drop an audio file, or record live from your microphone
- 📝 **Automatic Transcription** — powered by OpenAI Whisper (runs locally, no API cost)
- 📌 **AI Summary** — concise 3-5 sentence overview of the lecture
- 🔑 **Key Points** — auto-extracted important takeaways
- 🧠 **Flip Flashcards** — click to reveal answers, perfect for revision
- ❓ **Interactive Quiz** — answer questions and get an instant score
- 📄 **Export to PDF** — download your notes, flashcards, and quiz as a clean PDF
- 📋 **Copy Summary** — one-click copy to clipboard
- 🕘 **Session History** — automatically saves your last session in the browser
- 🎨 **Modern Dark UI** — glassmorphic design with smooth animations

---

## 🛠 Tech Stack

| Layer        | Technology                          |
|--------------|--------------------------------------|
| Frontend     | HTML, CSS, Vanilla JavaScript        |
| Backend      | Flask (Python)                       |
| Transcription| [OpenAI Whisper](https://github.com/openai/whisper) (local) |
| AI Analysis  | [Groq API](https://groq.com/) — Llama 3.3 70B |
| PDF Export   | [jsPDF](https://github.com/parallax/jsPDF) |

---

## 📂 Project Structure

```
VoxNote-AI/
├── frontend/
│   ├── index.html       # Main UI
│   ├── style.css         # Styling
│   └── script.js          # App logic
├── backend/
│   ├── app.py             # Flask server & routes
│   ├── stage2_processor.py # Groq AI analysis pipeline
│   ├── requirements.txt
│   └── .env               # API keys (not committed)
├── screenshots/
│   └── homepage.png
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- A free [Groq API key](https://console.groq.com/keys)
- `ffmpeg` installed (required by Whisper)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/VoxNote-AI.git
cd VoxNote-AI
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Add your Groq API key

Create a `.env` file inside the `backend/` folder:

```
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run the backend server

```bash
python app.py
```

The Flask server will start at `http://127.0.0.1:5000` — the first run will download the Whisper model (~150 MB for the "base" model).

### 5. Launch the frontend

Open `frontend/index.html` directly in your browser (double-click it), or use VS Code's **Live Server** extension.

> 💡 **Tip:** For best results, open the file directly (`file://...`) rather than through Live Server, to avoid CORS issues in some browsers.

---

## 🎯 Usage

1. Open the app in your browser
2. Choose **Upload File** or **Record Live**
3. Select/record your audio (`.mp3`, `.wav`, `.m4a`, `.mp4`)
4. Click **Process Audio**
5. Explore the **Transcript**, **Summary**, **Key Points**, **Flashcards**, and **Quiz** tabs
6. Export your notes as a **PDF** or copy the summary

---

## 🧪 Testing the Backend

To verify the AI pipeline works without uploading audio:

```
GET http://127.0.0.1:5000/test
```

This runs the Groq analysis on a sample transcript and returns a full JSON response.

---

## ⚙️ Configuration

| Setting | Location | Description |
|---|---|---|
| Whisper model size | `app.py` → `whisper.load_model("base")` | Use `"tiny"`, `"small"`, `"medium"`, or `"large"` for different speed/accuracy tradeoffs |
| Max upload size | `app.py` → `MAX_CONTENT_LENGTH` | Default 500 MB |
| Backend URL | `script.js` → `BACKEND` constant | Change if hosting backend elsewhere |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the `LICENSE` file for details.

---

## 🙏 Acknowledgements

- [OpenAI Whisper](https://github.com/openai/whisper) for transcription
- [Groq](https://groq.com/) for blazing-fast LLM inference
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
