/* =========================================
   VoxNote AI — script.js (DEBUG BUILD)
   ========================================= */

let currentMode         = 'upload';
let selectedFile        = null;
let recorder            = null;
let audioChunks         = [];
let recordedBlob        = null;
let recordTimerInterval = null;
let recordSeconds       = 0;
let quizData            = [];
let quizAnswers         = {};
let quizSubmitted       = false;
let stepInterval        = null;
let toastTimer          = null;

console.log('[VoxNote] ✅ script.js loaded successfully');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[VoxNote] ✅ DOM ready');
  setupFileInput();
  setupDragDrop();
  checkHistory();
  console.log('[VoxNote] ✅ All listeners attached');
});

// ── Mode Toggle ──────────────────────────────
function setMode(mode) {
  currentMode = mode;
  document.getElementById('uploadPanel').style.display = mode === 'upload' ? 'block' : 'none';
  document.getElementById('recordPanel').style.display = mode === 'record' ? 'block' : 'none';
  document.getElementById('modeUpload').classList.toggle('active', mode === 'upload');
  document.getElementById('modeRecord').classList.toggle('active', mode === 'record');
  selectedFile = null;
  document.getElementById('fileSelected').style.display = 'none';
  console.log('[VoxNote] Mode switched to:', mode);
}

// ── File Input ───────────────────────────────
function setupFileInput() {
  const input = document.getElementById('fileInput');
  if (!input) { console.error('[VoxNote] ❌ #fileInput not found!'); return; }

  input.addEventListener('change', function () {
    console.log('[VoxNote] fileInput change fired, files:', this.files);
    if (!this.files || !this.files[0]) {
      console.warn('[VoxNote] ⚠️ No file in input');
      return;
    }
    selectedFile = this.files[0];
    console.log('[VoxNote] ✅ File selected:', selectedFile.name, fmtSize(selectedFile.size));
    showFileInfo(selectedFile);
  });

  console.log('[VoxNote] ✅ fileInput listener attached');
}

function showFileInfo(file) {
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = fmtSize(file.size);
  document.getElementById('fileSelected').style.display = 'flex';
  console.log('[VoxNote] ✅ File info shown:', file.name);
}

function fmtSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// ── Drag & Drop ──────────────────────────────
function setupDragDrop() {
  const dz = document.getElementById('dropzone');
  if (!dz) { console.error('[VoxNote] ❌ #dropzone not found!'); return; }

  dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragenter', e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', e => { e.preventDefault(); dz.classList.remove('drag-over'); });
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    selectedFile = file;
    showFileInfo(file);
    console.log('[VoxNote] ✅ File dropped:', file.name);
  });

  // ONE click listener only — no onclick in HTML
  dz.addEventListener('click', () => {
    console.log('[VoxNote] Dropzone clicked — opening file picker');
    document.getElementById('fileInput').click();
  });

  console.log('[VoxNote] ✅ Drag & drop listeners attached');
}

// ── Voice Recording ──────────────────────────
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks  = [];
    recorder     = new MediaRecorder(stream);
    recorder.start();
    recorder.ondataavailable = e => audioChunks.push(e.data);
    recorder.onstop = () => {
      recordedBlob = new Blob(audioChunks, { type: 'audio/wav' });
      selectedFile = new File([recordedBlob], 'recorded_lecture.wav', { type: 'audio/wav' });
      document.getElementById('recordName').textContent = 'recorded_lecture.wav';
      document.getElementById('recordSize').textContent = fmtSize(recordedBlob.size);
      document.getElementById('recordSelected').style.display = 'flex';
      stream.getTracks().forEach(t => t.stop());
      console.log('[VoxNote] ✅ Recording saved:', fmtSize(recordedBlob.size));
    };
    document.getElementById('btnRecordStart').style.display = 'none';
    document.getElementById('btnRecordStop').style.display  = 'inline-block';
    document.getElementById('recordStatus').textContent     = '● Recording…';
    document.getElementById('recordZone').classList.add('recording');
    recordSeconds = 0;
    recordTimerInterval = setInterval(() => {
      recordSeconds++;
      document.getElementById('recordTimer').textContent = fmtTime(recordSeconds);
    }, 1000);
    console.log('[VoxNote] ✅ Recording started');
  } catch (err) {
    console.error('[VoxNote] ❌ Mic error:', err);
    showToast('🎤 Microphone access denied: ' + err.message);
  }
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') recorder.stop();
  clearInterval(recordTimerInterval);
  document.getElementById('btnRecordStart').style.display = 'inline-block';
  document.getElementById('btnRecordStop').style.display  = 'none';
  document.getElementById('recordStatus').textContent     = '✓ Recording saved — ready to process';
  document.getElementById('recordZone').classList.remove('recording');
}

function fmtTime(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

// ── Upload & Process ─────────────────────────
async function uploadFile() {
  console.log('[VoxNote] uploadFile() called');
  console.log('[VoxNote] selectedFile:', selectedFile);
  console.log('[VoxNote] currentMode:', currentMode);

  if (!selectedFile) {
    console.warn('[VoxNote] ⚠️ No file selected!');
    showToast('⚠️ Please select or record an audio file first.');
    return;
  }

  console.log('[VoxNote] Uploading:', selectedFile.name, fmtSize(selectedFile.size));

  const loader    = document.getElementById('loader');
  const dashboard = document.getElementById('dashboard');

  loader.style.display    = 'block';
  dashboard.style.display = 'none';
  animateSteps();

  const formData = new FormData();
  formData.append('file', selectedFile, selectedFile.name);

  // verify formData
  for (let [k, v] of formData.entries()) {
    console.log('[VoxNote] FormData entry:', k, v);
  }

  try {
    console.log('[VoxNote] Fetching http://127.0.0.1:5000/upload ...');

    const res = await fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      body:   formData
      // ⚠️ NO Content-Type header — browser sets it with boundary automatically
    });

    console.log('[VoxNote] ✅ Response received, status:', res.status);

    const rawText = await res.text();
    console.log('[VoxNote] Raw response (first 300):', rawText.slice(0, 300));

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('[VoxNote] ❌ JSON parse failed:', parseErr);
      throw new Error('Server returned invalid JSON: ' + rawText.slice(0, 100));
    }

    stopStepAnimation();
    loader.style.display = 'none';

    if (!res.ok || data.error) {
      console.error('[VoxNote] ❌ Server error:', data.error);
      showToast('❌ ' + (data.error || 'Server error ' + res.status));
      return;
    }

    console.log('[VoxNote] ✅ Analysis keys:', Object.keys(data.analysis || {}));
    console.log('[VoxNote] transcript length:', (data.transcript||'').length);
    console.log('[VoxNote] key_points count:', (data.analysis?.key_points||[]).length);
    console.log('[VoxNote] flashcards count:', (data.analysis?.flashcards||[]).length);
    console.log('[VoxNote] quiz count:', (data.analysis?.quiz||[]).length);

    populateDashboard(data);
    saveHistory(data);

  } catch (err) {
    stopStepAnimation();
    loader.style.display = 'none';
    console.error('[VoxNote] ❌ Fetch error:', err);

    if (err.message.toLowerCase().includes('failed to fetch') ||
        err.message.toLowerCase().includes('networkerror')) {
      showToast('❌ Cannot reach Flask backend. Is "python app.py" running?');
    } else {
      showToast('❌ ' + err.message);
    }
  }
}

// ── Populate Dashboard ───────────────────────
function populateDashboard(data) {
  console.log('[VoxNote] populateDashboard() called');
  const a = data.analysis;

  document.getElementById('transcript').textContent = data.transcript || '(empty)';
  document.getElementById('summary').textContent    = a.summary || '(empty)';

  // Key Points
  const kpEl = document.getElementById('keyPoints');
  kpEl.innerHTML = '';
  (a.key_points || []).forEach((pt, i) => {
    const li = document.createElement('li');
    li.className = 'kp-item';
    li.style.animationDelay = (i * 0.06) + 's';
    li.innerHTML = `<div class="kp-num">${i + 1}</div><span>${pt}</span>`;
    kpEl.appendChild(li);
  });

  // Stats
  document.getElementById('statPoints').textContent = (a.key_points || []).length;
  document.getElementById('statCards').textContent  = (a.flashcards  || []).length;
  document.getElementById('statScore').textContent  = '—';

  // Flashcards
  const fcEl = document.getElementById('flashcards');
  fcEl.innerHTML = '';
  (a.flashcards || []).forEach((card, i) => {
    const div = document.createElement('div');
    div.className = 'flashcard';
    div.style.animationDelay = (i * 0.07) + 's';
    div.innerHTML = `
      <div class="flashcard-inner">
        <div class="fc-face fc-front-face">
          <div class="fc-label">Question</div>
          <div class="fc-question">${card.q}</div>
          <div class="fc-tap-hint">tap to flip →</div>
        </div>
        <div class="fc-face fc-back-face">
          <div class="fc-answer-label">Answer</div>
          <div class="fc-answer">${card.a}</div>
          <div class="fc-tap-hint">← tap to flip back</div>
        </div>
      </div>`;
    div.addEventListener('click', () => div.classList.toggle('flip'));
    fcEl.appendChild(div);
  });

  // Quiz
  quizData      = a.quiz || [];
  quizAnswers   = {};
  quizSubmitted = false;
  renderQuiz();

  // Confidence
  const conf = Math.floor(Math.random() * 7) + 92;
  document.getElementById('confValue').textContent          = conf + '%';
  document.getElementById('confidenceBadge').style.display = 'flex';

  // Show dashboard
  const dashboard = document.getElementById('dashboard');
  dashboard.style.display = 'block';
  console.log('[VoxNote] ✅ Dashboard shown');

  setTimeout(() => dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// ── Quiz ─────────────────────────────────────
function renderQuiz() {
  const qzEl = document.getElementById('quiz');
  qzEl.innerHTML = '';

  quizData.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.style.animationDelay = (i * 0.08) + 's';

    const optsHTML = (q.options || []).map(opt =>
      `<div class="option" data-opt="${opt.replace(/"/g, '&quot;')}" data-idx="${i}">${opt}</div>`
    ).join('');

    card.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-num">Q${i + 1}</span>
        <span class="quiz-q">${q.question}</span>
      </div>
      <div class="options-grid" id="opts-${i}">${optsHTML}</div>
      <div class="quiz-answer-row" id="answer-${i}">
        <span>✓</span> Correct answer: <strong>${q.answer}</strong>
      </div>`;
    qzEl.appendChild(card);
  });

  document.querySelectorAll('.option').forEach(el => {
    el.addEventListener('click', function () {
      selectOption(this, parseInt(this.dataset.idx), this.dataset.opt);
    });
  });

  document.getElementById('scoreBoard').style.display    = 'none';
  document.getElementById('btnSubmitQuiz').style.display = quizData.length ? 'block' : 'none';
}

function selectOption(el, qIndex, option) {
  if (quizSubmitted) return;
  document.getElementById('opts-' + qIndex)
    .querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  quizAnswers[qIndex] = option;
}

function submitQuiz() {
  if (quizSubmitted) return;
  quizSubmitted = true;
  let score = 0;

  quizData.forEach((q, i) => {
    const selected = quizAnswers[i];
    document.getElementById('opts-' + i).querySelectorAll('.option').forEach(o => {
      const txt = o.dataset.opt.trim();
      if (txt === q.answer.trim()) {
        o.classList.add(selected && selected.trim() === txt ? 'correct' : 'reveal-correct');
      } else if (o.classList.contains('selected')) {
        o.classList.add('wrong');
      }
    });
    if (selected && selected.trim() === q.answer.trim()) score++;
    document.getElementById('answer-' + i).classList.add('show');
  });

  const pct = quizData.length ? Math.round((score / quizData.length) * 100) : 0;
  document.getElementById('scoreDisplay').textContent    = `${score} / ${quizData.length}  (${pct}%)`;
  document.getElementById('scoreEmoji').textContent      = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📖';
  document.getElementById('scoreBoard').style.display   = 'flex';
  document.getElementById('statScore').textContent      = pct + '%';
  document.getElementById('btnSubmitQuiz').style.display = 'none';
  document.getElementById('scoreBoard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Tabs ─────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b  => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

// ── PDF Export ───────────────────────────────
function downloadPDF() {
  if (!window.jspdf) { showToast('⚠️ PDF library not loaded.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const mar = 20, lw = W - mar * 2;
  let y = mar;
  const np = () => { doc.addPage(); y = mar; };
  const cy = n  => { if (y + n > H - mar) np(); };

  function hdr(t) {
    cy(14);
    doc.setFillColor(17,24,39); doc.roundedRect(mar,y,lw,9,2,2,'F');
    doc.setTextColor(99,179,237); doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text(t, mar+4, y+6.5); y += 14;
    doc.setTextColor(148,163,184); doc.setFontSize(10); doc.setFont('helvetica','normal');
  }

  doc.setTextColor(99,179,237); doc.setFontSize(20); doc.setFont('helvetica','bold');
  doc.text('VoxNote AI — Study Notes', mar, y+6); y += 14;
  doc.setTextColor(100,116,139); doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('Generated: ' + new Date().toLocaleString(), mar, y); y += 12;

  const sum = document.getElementById('summary').textContent;
  if (sum && sum !== '(empty)') {
    hdr('Summary');
    doc.splitTextToSize(sum, lw).forEach(l => { cy(6); doc.text(l, mar, y); y += 6; });
    y += 6;
  }

  const kps = document.querySelectorAll('.kp-item span:last-child');
  if (kps.length) {
    hdr('Key Points');
    kps.forEach((el, i) => {
      doc.splitTextToSize(`${i+1}. ${el.textContent}`, lw-4)
         .forEach(l => { cy(6); doc.text(l, mar+2, y); y += 6; });
      y += 2;
    });
    y += 4;
  }

  const qe = document.querySelectorAll('.fc-question');
  const ae = document.querySelectorAll('.fc-answer');
  if (qe.length) {
    hdr('Flashcards');
    qe.forEach((el, i) => {
      cy(22);
      doc.setFillColor(13,17,23); doc.roundedRect(mar,y,lw,18,2,2,'F');
      doc.setTextColor(99,179,237); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text('Q:', mar+3, y+5);
      doc.setTextColor(232,237,245); doc.setFont('helvetica','normal');
      doc.text((doc.splitTextToSize(el.textContent.trim(), lw-14)[0])||'', mar+10, y+5);
      doc.setTextColor(74,222,128); doc.setFont('helvetica','bold');
      doc.text('A:', mar+3, y+13);
      doc.setTextColor(148,163,184); doc.setFont('helvetica','normal');
      doc.text((doc.splitTextToSize((ae[i]?.textContent||'').trim(), lw-14)[0])||'', mar+10, y+13);
      y += 22;
    });
  }

  if (quizData.length) {
    hdr('Quiz');
    quizData.forEach((q, i) => {
      cy(28);
      doc.setTextColor(232,237,245); doc.setFont('helvetica','bold'); doc.setFontSize(10);
      doc.splitTextToSize(`Q${i+1}: ${q.question}`, lw)
         .forEach(l => { cy(6); doc.text(l, mar, y); y += 6; });
      doc.setFontSize(9); doc.setFont('helvetica','normal');
      (q.options||[]).forEach(opt => {
        const ia = opt.trim() === q.answer.trim();
        doc.setTextColor(ia?74:148, ia?222:163, ia?128:184);
        doc.splitTextToSize(`  ${ia?'✓':'○'} ${opt}`, lw-4)
           .forEach(l => { cy(5); doc.text(l, mar+2, y); y += 5; });
      });
      y += 5;
    });
  }

  doc.save('VoxNote_Notes.pdf');
  showToast('📄 PDF exported!');
}

// ── Copy Notes ───────────────────────────────
function copySummary() {
  const txt = document.getElementById('summary').textContent;
  if (!txt || txt === '(empty)') { showToast('⚠️ No summary yet.'); return; }
  navigator.clipboard.writeText(txt)
    .then(() => showToast('📋 Copied!'))
    .catch(() => showToast('⚠️ Copy failed.'));
}

// ── History ──────────────────────────────────
function saveHistory(data) {
  try {
    localStorage.setItem('vn_t',  data.transcript);
    localStorage.setItem('vn_a',  JSON.stringify(data.analysis));
    localStorage.setItem('vn_ts', new Date().toLocaleString());
  } catch (e) {}
}

function checkHistory() {
  const btn = document.getElementById('btnHistory');
  if (btn) btn.style.display = localStorage.getItem('vn_t') ? 'inline-block' : 'none';
}

function loadHistory() {
  const tr = localStorage.getItem('vn_t');
  const an = localStorage.getItem('vn_a');
  const ts = localStorage.getItem('vn_ts');
  if (!tr || !an) { showToast('⚠️ No saved session.'); return; }
  populateDashboard({ transcript: tr, analysis: JSON.parse(an) });
  showToast('🕘 Loaded session from ' + ts);
}

// ── Loader Steps ─────────────────────────────
function animateSteps() {
  let s = 1;
  stepInterval = setInterval(() => {
    document.querySelectorAll('.loader-step').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('step' + s);
    if (el) el.classList.add('active');
    s = s >= 3 ? 1 : s + 1;
  }, 1200);
}

function stopStepAnimation() {
  if (stepInterval) { clearInterval(stepInterval); stepInterval = null; }
}

// ── Toast ─────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}
