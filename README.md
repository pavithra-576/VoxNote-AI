# 🎙 VoxNote AI

> Turn lectures into knowledge — instantly.

VoxNote AI converts any lecture, meeting, or audio recording into structured study notes, smart flashcards, and interactive quizzes using **Whisper** for transcription and **Groq (Llama 3.3 70B)** for AI analysis.

---

## 📸 Preview
   <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VoxNote AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="ambient ambient-1"></div>
<div class="ambient ambient-2"></div>
<div class="ambient ambient-3"></div>

<div class="wrapper">

  <nav>
    <div class="logo">
      <div class="logo-icon">🎙</div>
      VoxNote AI
    </div>
    <div class="nav-right">
      <div class="confidence-badge" id="confidenceBadge" style="display:none">
        <span class="conf-dot"></span>
        AI Confidence: <strong id="confValue">96%</strong>
      </div>
      <div class="nav-pill">AI-Powered Learning</div>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-badge">Powered by AI</div>
    <h1>Turn lectures into<br><em>knowledge</em></h1>
    <p>Upload or record any audio and watch it transform into structured notes, smart flashcards, and interactive quizzes — instantly.</p>

    <div class="upload-zone">
      <div class="mode-toggle">
        <button class="mode-btn active" id="modeUpload" onclick="setMode('upload')">📁 Upload File</button>
        <button class="mode-btn" id="modeRecord" onclick="setMode('record')">🎤 Record Live</button>
      </div>

      <div id="uploadPanel">
        <div class="dropzone" id="dropzone">
          <div class="drop-icon">🔊</div>
          <h3>Drop your audio file here</h3>
          <p>or click to browse</p>
          <div class="file-formats">
            <span class="fmt-tag">.mp3</span>
            <span class="fmt-tag">.wav</span>
            <span class="fmt-tag">.m4a</span>
            <span class="fmt-tag">.mp4</span>
          </div>
        </div>
        <input type="file" id="fileInput" accept=".mp3,.wav,.m4a,.mp4,.ogg,.webm">
        <div class="file-selected" id="fileSelected">
          <span>🎵</span>
          <span class="file-name" id="fileName"></span>
          <span id="fileSize"></span>
        </div>
      </div>

      <div id="recordPanel" style="display:none">
        <div class="record-zone" id="recordZone">
          <div class="record-visualizer">
            <div class="viz-bar"></div><div class="viz-bar"></div><div class="viz-bar"></div>
            <div class="viz-bar"></div><div class="viz-bar"></div><div class="viz-bar"></div>
            <div class="viz-bar"></div><div class="viz-bar"></div><div class="viz-bar"></div>
          </div>
          <div class="record-status" id="recordStatus">Ready to record</div>
          <div class="record-timer" id="recordTimer">00:00</div>
          <div class="record-btns">
            <button class="btn-record-start" id="btnRecordStart" onclick="startRecording()">● Start Recording</button>
            <button class="btn-record-stop" id="btnRecordStop" onclick="stopRecording()" style="display:none">■ Stop</button>
          </div>
        </div>
        <div class="file-selected" id="recordSelected" style="display:none">
          <span>🎙</span>
          <span class="file-name" id="recordName"></span>
          <span id="recordSize"></span>
        </div>
      </div>

      <button class="btn-process" onclick="uploadFile()">
        <span>✦ Process Audio</span>
      </button>
    </div>
  </section>

  <div class="loader-wrap" id="loader">
    <div class="loader-visual">
      <div class="loader-ring"></div>
      <div class="loader-ring"></div>
      <div class="loader-ring"></div>
      <div class="loader-center"></div>
    </div>
    <p>Transcribing &amp; analyzing your audio</p>
    <div class="loader-steps">
      <div class="loader-step active" id="step1"><div class="loader-step-dot"></div> Transcribing</div>
      <div class="loader-step" id="step2"><div class="loader-step-dot"></div> Summarizing</div>
      <div class="loader-step" id="step3"><div class="loader-step-dot"></div> Generating</div>
    </div>
  </div>

  <section id="dashboard">
    <div class="section-label">Your Results</div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Key Points</div>
        <div class="stat-value" id="statPoints">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Flashcards</div>
        <div class="stat-value" id="statCards">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Quiz Score</div>
        <div class="stat-value" id="statScore">—</div>
      </div>
    </div>

    <div class="action-bar">
      <button class="btn-action" onclick="downloadPDF()">📄 Export PDF</button>
      <button class="btn-action" onclick="copySummary()">📋 Copy Notes</button>
      <button class="btn-action" id="btnHistory" onclick="loadHistory()" style="display:none">🕘 Last Session</button>
    </div>

    <div class="tab-nav">
      <button class="tab-btn active" onclick="switchTab('transcript', this)">📝 Transcript</button>
      <button class="tab-btn" onclick="switchTab('summary', this)">📌 Summary</button>
      <button class="tab-btn" onclick="switchTab('keypoints', this)">🔑 Key Points</button>
      <button class="tab-btn" onclick="switchTab('flashcards', this)">🧠 Flashcards</button>
      <button class="tab-btn" onclick="switchTab('quiz', this)">❓ Quiz</button>
    </div>

    <div id="tab-transcript" class="tab-panel active">
      <div class="transcript-box" id="transcript">Transcript will appear here after processing.</div>
    </div>
    <div id="tab-summary" class="tab-panel">
      <div class="summary-box" id="summary"></div>
    </div>
    <div id="tab-keypoints" class="tab-panel">
      <ul class="key-points-list" id="keyPoints"></ul>
    </div>
    <div id="tab-flashcards" class="tab-panel">
      <p class="hint-text">💡 Click any card to flip and reveal the answer</p>
      <div class="flashcards-grid" id="flashcards"></div>
    </div>
    <div id="tab-quiz" class="tab-panel">
      <div class="quiz-scoreboard" id="scoreBoard" style="display:none">
        <span class="score-label">Final Score</span>
        <span class="score-num" id="scoreDisplay">0 / 0</span>
        <span class="score-emoji" id="scoreEmoji">🎉</span>
      </div>
      <div class="quiz-list" id="quiz"></div>
      <button class="btn-submit-quiz" id="btnSubmitQuiz" onclick="submitQuiz()" style="display:none">
        ✦ Submit Quiz
      </button>
    </div>
  </section>

</div>

<div class="toast" id="toast"></div>
<script src="script.js"></script>
</body>
</html>
<!-- 
To add more screenshots, upload them to a "screenshots" folder in your repo
and reference them like this:

![Dashboard](screenshots/dashboard.png)
![Flashcards](screenshots/flashcards.png)
![Quiz](screenshots/quiz.png)
-->

---

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
│   └── .env               
├── README.md
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

---

## 🗺 Roadmap

- [x] Whisper transcription
- [x] Groq-powered summary, key points, flashcards & quiz
- [x] Drag & drop upload
- [x] Live voice recording
- [x] Flip flashcards
- [x] Quiz scoring system
- [x] PDF export
- [x] Copy notes & session history
- [ ] User accounts & cloud history
- [ ] Multi-language support
- [ ] Export to Anki / Notion

---

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
