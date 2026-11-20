// =========================================================================
// GOETHE-ZERTIFIKAT B1 — ASOSIY ILOVA LOGIKASI & TELEGRAM WEBAPP INTEGRATSIYASI
// =========================================================================

let state = {
  mainView: "exams",
  selectedEinheit: 1,
  activeModule: "lesen",
  lesenPart: 1,
  horenPart: 1,
  sprechenPart: 1,
  sprechenCandidate: "A",

  timers: {
    lesen: 65 * 60,
    horen: 40 * 60,
    schreiben: 60 * 60,
    sprechen: 15 * 60
  },
  timerInterval: null,

  answers: {
    lesen: {},
    horen: {},
    schreiben: { S1: "", S2: "", S3: "" },
    sprechen: {
      T1_notes: "",
      T2_notes: "",
      T3_notes: "",
      checklist: {
        t1_all_points: false,
        t1_interaction: false,
        t2_structure: false,
        t2_pros_cons: false,
        t3_feedback: false
      },
      recordedBlobs: {}
    }
  },

  audioPlayCounts: {},
  showTranscripts: {},

  vocabFilterEinheit: "all",
  vocabFilterTopic: "all",
  vocabMode: "list",
  flashcardIdx: 0,
  flashcardFlipped: false,
  quizIdx: 0,
  quizScore: 0,
  quizAnswered: null,

  redemittelCat: "schreiben_email",

  isRecording: false,
  recordingPart: null,
  mediaRecorder: null,
  audioChunks: [],
  recognizedText: {}
};

// Telegram Mini App obyektini sozlash
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg) {
  tg.ready();
  tg.expand();
}

function showToast(msg, icon = "ℹ️") {
  const box = document.getElementById("toast-box");
  document.getElementById("toast-msg").textContent = msg;
  document.getElementById("toast-icon").textContent = icon;
  box.classList.remove("hidden");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    box.classList.add("hidden");
  }, 3500);
}

// =========================================================================
// TELEFON VA TELEGRAM MINI APP UCHUN RENDER SERVER ORQALI NEMISCHA AUDIO (TTS)
// =========================================================================
window._currentAudioPlayer = null;

function speakGerman(text, rate = 0.95, pitch = 1.0) {
  stopSpeaking();

  // Uzun matnni 180 belgidan oshmaydigan bo'laklarga ajratamiz
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > 180) {
      if (current.trim()) chunks.push(current.trim());
      current = s;
    } else {
      current += " " + s;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  let index = 0;

  function playNextChunk() {
    if (index >= chunks.length) return;
    const chunk = chunks[index];
    index++;

    const encoded = encodeURIComponent(chunk);
    const ttsUrl = `https://goethe-b1-app1.onrender.com/api/tts?q=${encoded}`;

    const audio = new Audio(ttsUrl);
    audio.playbackRate = rate;
    window._currentAudioPlayer = audio;

    audio.onended = () => {
      playNextChunk();
    };

    audio.onerror = () => {
      fallbackBrowserTTS(chunk, rate, pitch, playNextChunk);
    };

    audio.play().catch(() => {
      fallbackBrowserTTS(chunk, rate, pitch, playNextChunk);
    });
  }

  playNextChunk();
}

function fallbackBrowserTTS(text, rate, pitch, onEndCallback) {
  if (!("speechSynthesis" in window)) {
    showToast("Ovoz yuklanmadi. Render server uyg'onishini 30 soniya kutib qayta bosing.", "⏳");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find(v => v.lang.includes("de-DE")) || voices.find(v => v.lang.startsWith("de"));
  if (deVoice) utterance.voice = deVoice;

  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (window._currentAudioPlayer) {
    try {
      window._currentAudioPlayer.pause();
      window._currentAudioPlayer.currentTime = 0;
    } catch (e) {}
    window._currentAudioPlayer = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function countWords(str) {
  if (!str || !str.trim()) return 0;
  return str.trim().split(/\s+/).length;
}

function startModuleTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (state.mainView !== "exam-session") {
      clearInterval(state.timerInterval);
      return;
    }
    const mod = state.activeModule;
    if (state.timers[mod] > 0) {
      state.timers[mod]--;
      const timerEl = document.getElementById("live-timer-display");
      if (timerEl) {
        timerEl.textContent = formatTime(state.timers[mod]);
        if (state.timers[mod] < 120) {
          timerEl.classList.add("text-red-600", "animate-pulse");
        }
      }
    } else {
      clearInterval(state.timerInterval);
      showToast(`${mod.toUpperCase()} bo'limi uchun ajratilgan vaqt tugadi!`, "⏰");
    }
  }, 1000);
}

function switchMainView(view) {
  stopSpeaking();
  state.mainView = view;

  ["exams", "vocab", "redemittel"].forEach(id => {
    const btn = document.getElementById(`nav-${id}`);
    if (!btn) return;
    if (id === view || (view.startsWith("exam") && id === "exams")) {
      btn.className = "tab-active flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap";
    } else {
      btn.className = "bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap";
    }
  });

  renderApp();
}

function startExam(einheitId) {
  if (!EXAM_DATA[einheitId]) {
    showToast(`Einheit ${einheitId} uchun hozircha Einheit 1 simulyatori ochiladi!`, "📘");
    einheitId = 1;
  }
  state.selectedEinheit = einheitId;
  state.activeModule = "lesen";
  state.lesenPart = 1;
  state.horenPart = 1;
  state.sprechenPart = 1;
  state.timers = {
    lesen: 65 * 60,
    horen: 40 * 60,
    schreiben: 60 * 60,
    sprechen: 15 * 60
  };
  state.answers = {
    lesen: {},
    horen: {},
    schreiben: { S1: "", S2: "", S3: "" },
    sprechen: {
      T1_notes: "",
      T2_notes: "",
      T3_notes: "",
      checklist: {
        t1_all_points: false,
        t1_interaction: false,
        t2_structure: false,
        t2_pros_cons: false,
        t3_feedback: false
      },
      recordedBlobs: {}
    }
  };
  state.audioPlayCounts = {};
  state.showTranscripts = {};
  state.mainView = "exam-session";
  renderApp();
  startModuleTimer();
  showToast("Imtihon boshlandi! Rasmiy taymer ishga tushdi.", "🎯");
}

function switchExamModule(mod) {
  stopSpeaking();
  state.activeModule = mod;
  renderApp();
  startModuleTimer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function calculateExamResults() {
  const exam = EXAM_DATA[state.selectedEinheit];

  // 1. LESEN
  let lesenCorrect = 0;
  const lesenDetails = [];
  exam.modules.lesen.parts.forEach(p => {
    if (p.questions) {
      p.questions.forEach(q => {
        const userAns = state.answers.lesen[q.id] || "—";
        const isOk = userAns === q.correct;
        if (isOk) lesenCorrect++;
        lesenDetails.push({ num: q.num, text: q.text, userAns, correct: q.correct, isOk, explanation: q.explanation });
      });
    }
    if (p.subtexts) {
      p.subtexts.forEach(st => {
        st.questions.forEach(q => {
          const userAns = state.answers.lesen[q.id] || "—";
          const isOk = userAns === q.correct;
          if (isOk) lesenCorrect++;
          lesenDetails.push({ num: q.num, text: q.text, userAns, correct: q.correct, isOk, explanation: q.explanation });
        });
      });
    }
  });
  const lesenPercent = Math.round((lesenCorrect / 30) * 100);

  // 2. HÖREN
  let horenCorrect = 0;
  const horenDetails = [];
  exam.modules.horen.parts.forEach(p => {
    p.tracks.forEach(tr => {
      tr.questions.forEach(q => {
        const userAns = state.answers.horen[q.id] || "—";
        const isOk = userAns === q.correct;
        if (isOk) horenCorrect++;
        horenDetails.push({ num: q.num, text: q.text, userAns, correct: q.correct, isOk, explanation: q.explanation });
      });
    });
  });
  const horenPercent = Math.round((horenCorrect / 30) * 100);

  // 3. SCHREIBEN
  const weights = { S1: 40, S2: 40, S3: 20 };
  let schreibenPoints = 0;
  const schreibenDetails = [];

  exam.modules.schreiben.tasks.forEach(task => {
    const txt = (state.answers.schreiben[task.id] || "").trim();
    const wc = countWords(txt);
    const lower = txt.toLowerCase();
    const maxPt = weights[task.id];

    if (wc < 10) {
      schreibenDetails.push({ num: task.num, title: task.title, words: wc, target: task.targetWords, score: 0, max: maxPt, feedback: "Matn juda qisqa yoki yozilmagan." });
      return;
    }

    const ratio = Math.min(1, wc / (task.targetWords * 0.8));
    let pt = ratio * (maxPt * 0.5);

    let hits = 0;
    task.keywords.forEach(kw => {
      if (lower.includes(kw)) hits++;
    });
    const kwRatio = Math.min(1, hits / Math.max(3, Math.floor(task.keywords.length * 0.45)));
    pt += kwRatio * (maxPt * 0.5);

    const roundedPt = Math.round(pt);
    schreibenPoints += roundedPt;
    schreibenDetails.push({
      num: task.num,
      title: task.title,
      words: wc,
      target: task.targetWords,
      score: roundedPt,
      max: maxPt,
      feedback: wc >= task.targetWords * 0.75 ? "So'zlar soni va mazmun talabga mos." : "So'zlar soni biroz kam."
    });
  });
  const schreibenPercent = Math.min(100, Math.round(schreibenPoints));

  // 4. SPRECHEN
  const cl = state.answers.sprechen.checklist;
  const checkedCount = Object.values(cl).filter(Boolean).length;
  const notesLen = (state.answers.sprechen.T1_notes + state.answers.sprechen.T2_notes + state.answers.sprechen.T3_notes).trim().length;
  const hasRec = Object.keys(state.answers.sprechen.recordedBlobs).length > 0 || Object.keys(state.recognizedText).length > 0;

  let sprechenPercent = checkedCount * 16;
  if (notesLen > 30) sprechenPercent += 10;
  if (hasRec) sprechenPercent += 10;
  sprechenPercent = Math.min(100, sprechenPercent);

  const modulesSummary = [
    { key: "lesen", name: "Lesen (O'qish)", score: lesenPercent, raw: `${lesenCorrect}/30 to'g'ri`, passed: lesenPercent >= 60 },
    { key: "horen", name: "Hören (Tinglash)", score: horenPercent, raw: `${horenCorrect}/30 to'g'ri`, passed: horenPercent >= 60 },
    { key: "schreiben", name: "Schreiben (Yozish)", score: schreibenPercent, raw: `${schreibenPercent}/100 ball`, passed: schreibenPercent >= 60 },
    { key: "sprechen", name: "Sprechen (Gapirish)", score: sprechenPercent, raw: `${sprechenPercent}/100 ball`, passed: sprechenPercent >= 60 }
  ];

  const failedModules = modulesSummary.filter(m => !m.passed);
  const allPassed = failedModules.length === 0;

  return { modulesSummary, failedModules, allPassed, lesenDetails, horenDetails, schreibenDetails };
}

function finishFullExam() {
  clearInterval(state.timerInterval);
  stopSpeaking();
  const res = calculateExamResults();

  if (tg) {
    try {
      tg.sendData(JSON.stringify({
        type: "exam_result",
        einheit: state.selectedEinheit,
        allPassed: res.allPassed,
        scores: res.modulesSummary.map(m => ({ name: m.name, score: m.score, passed: m.passed }))
      }));
    } catch (e) {}
  }

  state.mainView = "exam-result";
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function toggleMicRecording(partKey) {
  if (state.isRecording) {
    state.isRecording = false;
    state.recordingPart = null;
    if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
      state.mediaRecorder.stop();
    }
    if (window._speechRec) {
      try { window._speechRec.stop(); } catch (e) {}
    }
    renderApp();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioChunks = [];
    const recorder = new MediaRecorder(stream);
    state.mediaRecorder = recorder;
    state.isRecording = true;
    state.recordingPart = partKey;

    recorder.ondataavailable = e => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(state.audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      state.answers.sprechen.recordedBlobs[partKey] = url;
      stream.getTracks().forEach(t => t.stop());
      renderApp();
      showToast("Ovozli javobingiz saqlandi!", "🎙️");
    };

    recorder.start();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = "de-DE";
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = event => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        state.recognizedText[partKey] = transcript.trim();
        const el = document.getElementById(`rec-text-${partKey}`);
        if (el) el.textContent = transcript.trim();
      };
      rec.start();
      window._speechRec = rec;
    }

    renderApp();
  } catch (err) {
    showToast("Mikrofonga ruxsat berilmadi.", "⚠️");
  }
}

function renderApp() {
  const root = document.getElementById("app-root");
  if (state.mainView === "exams") root.innerHTML = renderExamMenu();
  else if (state.mainView === "exam-session") root.innerHTML = renderExamSession();
  else if (state.mainView === "exam-result") root.innerHTML = renderExamResult();
  else if (state.mainView === "vocab") root.innerHTML = renderVocabView();
  else if (state.mainView === "redemittel") root.innerHTML = renderRedemittelView();
}

function renderExamMenu() {
  return `
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <span class="inline-block px-3 py-1 bg-white/15 rounded-full text-xs font-semibold uppercase">
              Goethe-Institut B1 Format • Module B1 Testbuch
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold">Goethe-Zertifikat B1 Imtihon Markazi</h2>
            <p class="text-teal-100 text-sm sm:text-base">
              Barcha 4 modul (<strong>Lesen, Hören, Schreiben, Sprechen</strong>) kitobdagi rasmiy vaqt me'yorlari asosida ishlaydi.
              O'tish uchun har bir bo'limdan kamida <strong>60%</strong> ball to'plash shart.
            </p>
          </div>
          <button onclick="startExam(1)" class="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0">
            <span>🚀</span> 1-Imtihonni boshlash (Einheit 1)
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div class="bg-white/10 rounded-xl p-3"><div class="text-xs text-teal-200">1. Lesen</div><div class="text-lg font-bold">65 daqiqa</div></div>
          <div class="bg-white/10 rounded-xl p-3"><div class="text-xs text-teal-200">2. Hören</div><div class="text-lg font-bold">ca. 40 daqiqa</div></div>
          <div class="bg-white/10 rounded-xl p-3"><div class="text-xs text-teal-200">3. Schreiben</div><div class="text-lg font-bold">60 daqiqa</div></div>
          <div class="bg-white/10 rounded-xl p-3"><div class="text-xs text-teal-200">4. Sprechen</div><div class="text-lg font-bold">ca. 15 daqiqa</div></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${EINHEITEN_META.map(item => `
          <div class="bg-white rounded-2xl border ${item.id === 1 ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'} p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${item.id === 1 ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}">${item.pages}</span>
                ${item.id === 1 ? `<span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">To'liq faol</span>` : ``}
              </div>
              <h4 class="text-base font-bold text-slate-900 mb-1">${item.title}</h4>
              <p class="text-xs text-slate-500 mb-4"><strong>Mavzular:</strong> ${item.topics}</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button onclick="openVocabForUnit(${item.id})" class="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">📚 Lug'at</button>
              <button onclick="startExam(${item.id})" class="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl">▶ Imtihon</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderExamSession() {
  const exam = EXAM_DATA[state.selectedEinheit];
  const mod = state.activeModule;
  return `
    <div class="space-y-5">
      <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div class="text-xs font-semibold text-teal-700 uppercase">● Jonli Imtihon Rejimi • O'tish chegarasi: 60%</div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">${exam.name}</h2>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <div class="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-3">
              <span class="text-lg">⏱️</span>
              <div>
                <div class="text-[10px] uppercase text-slate-400">Qolgan vaqt (${mod.toUpperCase()})</div>
                <div id="live-timer-display" class="text-xl font-mono font-extrabold text-emerald-400">${formatTime(state.timers[mod])}</div>
              </div>
            </div>
            <button onclick="finishFullExam()" class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow">
              ✅ Imtihonni yakunlash
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-100">
          ${[
            { id: "lesen", label: "1. Lesen", time: "65 Min" },
            { id: "horen", label: "2. Hören", time: "40 Min" },
            { id: "schreiben", label: "3. Schreiben", time: "60 Min" },
            { id: "sprechen", label: "4. Sprechen", time: "15 Min" }
          ].map(m => `
            <button onclick="switchExamModule('${m.id}')" class="p-3 rounded-xl border text-left transition ${
              mod === m.id ? "bg-teal-700 text-white border-teal-700" : "bg-slate-50 text-slate-700 border-slate-200"
            }">
              <div class="font-bold text-sm">${m.label}</div>
              <div class="text-xs ${mod === m.id ? "text-teal-100" : "text-slate-500"}">${m.time} (${formatTime(state.timers[m.id])})</div>
            </button>
          `).join("")}
        </div>
      </div>

      <div>
        ${mod === "lesen" ? renderLesenModule(exam.modules.lesen) : ""}
        ${mod === "horen" ? renderHorenModule(exam.modules.horen) : ""}
        ${mod === "schreiben" ? renderSchreibenModule(exam.modules.schreiben) : ""}
        ${mod === "sprechen" ? renderSprechenModule(exam.modules.sprechen) : ""}
      </div>
    </div>
  `;
}

function renderLesenModule(lesen) {
  const part = lesen.parts.find(p => p.partNum === state.lesenPart) || lesen.parts[0];
  return `
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200">
        <div class="flex flex-wrap gap-2">
          ${lesen.parts.map(p => `
            <button onclick="state.lesenPart=${p.partNum}; renderApp();" class="px-3.5 py-2 rounded-xl text-xs font-bold ${
              state.lesenPart === p.partNum ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
            }">Teil ${p.partNum}</button>
          `).join("")}
        </div>
        <div class="text-xs font-semibold text-slate-600">${part.title}</div>
      </div>

      <div class="bg-teal-50 border border-teal-200 text-teal-900 p-4 rounded-2xl text-sm">
        <strong>Topshiriq:</strong> ${part.instruction}
      </div>

      ${part.partNum === 1 || part.partNum === 5 ? `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h4 class="text-sm font-bold text-teal-800 mb-3 pb-2 border-b">${part.sourceTitle}</h4>
            <div class="text-sm text-slate-800 leading-7 whitespace-pre-line">${part.text}</div>
          </div>
          <div class="lg:col-span-5 space-y-3">
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
              <strong>Beispiel:</strong> ${part.example.q} → <strong>${part.example.ans}</strong>
            </div>
            ${part.questions.map(q => renderSingleQuestionCard(q, "lesen")).join("")}
          </div>
        </div>
      ` : ""}

      ${part.partNum === 2 ? `
        <div class="space-y-6">
          ${part.subtexts.map(st => `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-white p-5 rounded-2xl border border-slate-200">
              <div class="lg:col-span-7">
                <h4 class="text-sm font-bold text-teal-800 mb-3 pb-2 border-b">${st.sourceTitle}</h4>
                <div class="text-sm text-slate-800 leading-7 whitespace-pre-line">${st.text}</div>
              </div>
              <div class="lg:col-span-5 space-y-3">
                ${st.example ? `<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs"><strong>Beispiel:</strong> ${st.example.q} → <strong>${st.example.ans}</strong></div>` : ""}
                ${st.questions.map(q => renderSingleQuestionCard(q, "lesen")).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      ${part.partNum === 3 ? `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div class="lg:col-span-5 space-y-3">
            ${part.questions.map(q => {
              const val = state.answers.lesen[q.id] || "";
              return `
                <div class="bg-white p-4 rounded-xl border border-slate-200">
                  <div class="text-sm font-medium mb-2"><strong>${q.num}.</strong> ${q.text}</div>
                  <select onchange="state.answers.lesen['${q.id}']=this.value; renderApp();" class="px-3 py-1.5 rounded-lg border text-sm font-bold bg-slate-50">
                    <option value="">-- Tanlang --</option>
                    ${["a","b","c","d","e","f","g","h","i","j","0"].map(opt => `<option value="${opt}" ${val === opt ? "selected" : ""}>${opt === "0" ? "0 (Yo'q)" : "Anzeige " + opt}</option>`).join("")}
                  </select>
                </div>
              `;
            }).join("")}
          </div>
          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${part.ads.map(ad => `
              <div class="bg-white p-4 rounded-xl border border-slate-200">
                <div class="font-bold text-sm text-teal-800 mb-1">[${ad.id.toUpperCase()}] ${ad.title}</div>
                <p class="text-xs text-slate-600">${ad.text}</p>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      ${part.partNum === 4 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${part.questions.map(q => {
            const val = state.answers.lesen[q.id];
            return `
              <div class="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span class="px-2.5 py-0.5 bg-teal-100 text-teal-800 font-bold rounded-md text-xs">Aufgabe ${q.num} • ${q.person}</span>
                  <p class="text-sm text-slate-700 mt-2 mb-4">„${q.text}“</p>
                </div>
                <div class="flex items-center gap-2 pt-3 border-t">
                  <span class="text-xs text-slate-500 mr-auto">Für Schuluniformen?</span>
                  ${["JA", "NEIN"].map(opt => `
                    <button onclick="state.answers.lesen['${q.id}']='${opt}'; renderApp();" class="px-4 py-1.5 rounded-lg text-xs font-bold border ${
                      val === opt ? "bg-teal-700 text-white" : "bg-slate-50 text-slate-700"
                    }">${opt}</button>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderSingleQuestionCard(q, moduleKey) {
  const val = state.answers[moduleKey][q.id];
  if (q.type === "rf" || !q.options) {
    return `
      <div class="bg-white p-4 rounded-xl border border-slate-200">
        <div class="text-sm font-medium mb-3"><strong>${q.num}.</strong> ${q.text}</div>
        <div class="flex gap-2">
          ${["Richtig", "Falsch"].map(opt => `
            <button onclick="state.answers['${moduleKey}']['${q.id}']='${opt}'; renderApp();" class="flex-1 py-2 rounded-lg text-xs font-bold border ${
              val === opt ? "bg-teal-700 text-white" : "bg-slate-50 text-slate-700"
            }">${opt}</button>
          `).join("")}
        </div>
      </div>
    `;
  }
  if (q.type === "abc3") {
    return `
      <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="text-sm font-medium"><strong>${q.num}.</strong> ${q.text}</div>
        <div class="flex gap-2 shrink-0">
          ${[{ k: "A", l: "A (Mod)" }, { k: "B", l: "B (Breitner)" }, { k: "C", l: "C (Wild)" }].map(opt => `
            <button onclick="state.answers['${moduleKey}']['${q.id}']='${opt.k}'; renderApp();" class="px-3 py-1.5 rounded-lg text-xs font-bold border ${
              val === opt.k ? "bg-teal-700 text-white" : "bg-slate-50 text-slate-700"
            }">${opt.l}</button>
          `).join("")}
        </div>
      </div>
    `;
  }
  return `
    <div class="bg-white p-4 rounded-xl border border-slate-200">
      <div class="text-sm font-semibold mb-3"><strong>${q.num}.</strong> ${q.text}</div>
      <div class="space-y-2">
        ${Object.entries(q.options).map(([key, label]) => `
          <button onclick="state.answers['${moduleKey}']['${q.id}']='${key}'; renderApp();" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border flex items-start gap-2 ${
            val === key ? "bg-teal-700 text-white" : "bg-slate-50 text-slate-700"
          }">
            <span class="font-bold uppercase">${key})</span>
            <span>${label}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function playHorenTrack(trackId, scriptText, maxPlays) {
  const current = state.audioPlayCounts[trackId] || 0;
  if (current >= maxPlays) {
    showToast(`Ushbu audio faqat ${maxPlays} marta eshittiriladi!`, "🔒");
    return;
  }
  state.audioPlayCounts[trackId] = current + 1;
  speakGerman(scriptText, 0.92, 1.0);
  renderApp();
}

function renderHorenModule(horen) {
  const part = horen.parts.find(p => p.partNum === state.horenPart) || horen.parts[0];
  return `
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200">
        <div class="flex flex-wrap gap-2">
          ${horen.parts.map(p => `
            <button onclick="stopSpeaking(); state.horenPart=${p.partNum}; renderApp();" class="px-3.5 py-2 rounded-xl text-xs font-bold ${
              state.horenPart === p.partNum ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
            }">Teil ${p.partNum} (${p.maxPlays}x)</button>
          `).join("")}
        </div>
        <button onclick="stopSpeaking()" class="px-3 py-1.5 bg-amber-200 text-amber-950 rounded-lg text-xs font-bold">⏹ To'xtatish</button>
      </div>

      <div class="space-y-5">
        ${part.tracks.map(tr => {
          const plays = state.audioPlayCounts[tr.trackId] || 0;
          const remaining = Math.max(0, part.maxPlays - plays);
          const showTrans = !!state.showTranscripts[tr.trackId];
          return `
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b">
                <div>
                  <h4 class="font-bold text-slate-900">${tr.label}</h4>
                  <p class="text-xs text-slate-500">Qolgan urinishlar: <strong>${remaining} / ${part.maxPlays}</strong></p>
                </div>
                <div class="flex gap-2">
                  <button onclick='playHorenTrack("${tr.trackId}", ${JSON.stringify(tr.script)}, ${part.maxPlays})' class="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white">
                    🔊 Eshitish (${remaining})
                  </button>
                  <button onclick="state.showTranscripts['${tr.trackId}'] = !state.showTranscripts['${tr.trackId}']; renderApp();" class="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100">
                    ${showTrans ? "🙈 Yashirish" : "📄 Matn"}
                  </button>
                </div>
              </div>
              ${showTrans ? `<div class="bg-slate-50 p-4 rounded-xl text-xs text-slate-700">${tr.script}</div>` : ""}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${tr.questions.map(q => renderSingleQuestionCard(q, "horen")).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderSchreibenModule(schreiben) {
  return `
    <div class="space-y-6">
      ${schreiben.tasks.map(task => {
        const val = state.answers.schreiben[task.id] || "";
        const wc = countWords(val);
        return `
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div class="flex justify-between items-center pb-3 border-b">
              <h4 class="text-base font-extrabold">${task.title}</h4>
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">So'zlar: <span id="wc-${task.id}">${wc}</span> / ~${task.targetWords}</span>
            </div>
            <p class="text-sm font-medium">${task.prompt}</p>
            ${task.quoteText ? `<div class="bg-slate-50 border-l-4 border-teal-600 p-3 text-xs italic">${task.quoteText}</div>` : ""}
            <ul class="list-disc list-inside text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
              ${task.bullets.map(b => `<li>${b}</li>`).join("")}
            </ul>
            <textarea rows="6" oninput="state.answers.schreiben['${task.id}']=this.value; document.getElementById('wc-${task.id}').textContent = countWords(this.value);" class="w-full p-4 rounded-xl border border-slate-300 text-sm">${val}</textarea>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderSprechenModule(sprechen) {
  const part = sprechen.parts.find(p => p.partNum === state.sprechenPart) || sprechen.parts[0];
  const partKey = `P${part.partNum}`;
  const recordedUrl = state.answers.sprechen.recordedBlobs[partKey];

  return `
    <div class="space-y-5">
      <div class="flex gap-2 bg-white p-3 rounded-2xl border border-slate-200">
        ${sprechen.parts.map(p => `
          <button onclick="state.sprechenPart=${p.partNum}; renderApp();" class="px-3.5 py-2 rounded-xl text-xs font-bold ${
            state.sprechenPart === p.partNum ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
          }">Teil ${p.partNum}</button>
        `).join("")}
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="flex justify-between items-center pb-3 border-b">
          <h4 class="text-lg font-extrabold">${part.title}</h4>
          <button onclick='speakGerman(${JSON.stringify(part.examinerPrompt)}, 0.95, 1.0)' class="px-3.5 py-2 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold">
            🔊 Imtihonchi savolini eshitish
          </button>
        </div>
        <p class="text-sm text-slate-700">${part.situation}</p>
        <div class="bg-slate-900 text-white p-4 rounded-2xl text-sm">
          <span class="text-xs text-teal-300 block font-bold">Prüfer:</span>
          „${part.examinerPrompt}“
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-50 border p-4 rounded-2xl space-y-3">
            <div class="font-bold text-sm">🎙️ Ovozli javob yozish</div>
            <button onclick="toggleMicRecording('${partKey}')" class="w-full py-3 rounded-xl font-bold text-sm text-white ${
              state.isRecording && state.recordingPart === partKey ? "bg-red-600 recording-pulse" : "bg-teal-700"
            }">
              ${state.isRecording && state.recordingPart === partKey ? "⏹ To'xtatish" : "🎙️ Gapirishni boshlash"}
            </button>
            ${recordedUrl ? `<audio controls src="${recordedUrl}" class="w-full h-9"></audio>` : ""}
          </div>
          <div class="bg-slate-50 border p-4 rounded-2xl space-y-2">
            <div class="font-bold text-sm">📝 Qaydlar (Notizen)</div>
            <textarea rows="4" oninput="state.answers.sprechen['T${part.partNum}_notes']=this.value" class="w-full p-3 rounded-xl border text-xs bg-white">${state.answers.sprechen[`T${part.partNum}_notes`] || ""}</textarea>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div class="font-bold text-xs uppercase text-amber-900">O'z-o'zini baholash mezonlari:</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            ${[
              { k: "t1_all_points", label: "Teil 1: Barcha reja nuqtalari bo'yicha gapirdim" },
              { k: "t1_interaction", label: "Teil 1: Sherigim fikriga munosabat bildirdim" },
              { k: "t2_structure", label: "Teil 2: 5 ta folia bo'yicha taqdimot qildim" },
              { k: "t2_pros_cons", label: "Teil 2: Afzallik va kamchiliklarni aytdim" },
              { k: "t3_feedback", label: "Teil 3: Savollarga javob berdim" }
            ].map(item => `
              <label class="flex items-center gap-2 bg-white p-2.5 rounded-xl border cursor-pointer">
                <input type="checkbox" ${state.answers.sprechen.checklist[item.k] ? "checked" : ""} onchange="state.answers.sprechen.checklist['${item.k}']=this.checked;" class="w-4 h-4 accent-teal-700">
                <span>${item.label}</span>
              </label>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderExamResult() {
  const res = calculateExamResults();
  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      ${res.allPassed ? `
        <div class="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 text-center space-y-3 shadow-xl">
          <div class="text-5xl">🎉</div>
          <h2 class="text-2xl sm:text-3xl font-extrabold">Tabriklaymiz! Siz Goethe-Zertifikat B1 imtihonidan o'tdingiz!</h2>
          <p class="text-emerald-100 text-sm">Barcha 4 bo'limdan kamida 60% ball to'pladingiz.</p>
        </div>
      ` : `
        <div class="bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-3xl p-8 space-y-4 shadow-xl">
          <h2 class="text-2xl sm:text-3xl font-extrabold">⚠️ Qayta urinib ko'ring, darajangiz B1 emas!</h2>
          <p class="text-rose-100 text-sm">B1 sertifikatini olish uchun har bir bo'limdan kamida <strong>60%</strong> to'plash kerak.</p>
          <div class="bg-black/20 rounded-2xl p-4">
            <div class="text-xs font-bold uppercase text-rose-200 mb-2">Siz quyidagi bo'lim(lar)dan yiqildingiz:</div>
            <div class="flex flex-wrap gap-2">
              ${res.failedModules.map(fm => `
                <span class="px-3.5 py-1.5 bg-white text-red-700 font-extrabold text-xs rounded-xl">
                  ❌ ${fm.name}: ${fm.score}% (${fm.raw})
                </span>
              `).join("")}
            </div>
          </div>
        </div>
      `}

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${res.modulesSummary.map(m => `
          <div class="bg-white rounded-2xl border-2 ${m.passed ? "border-emerald-500" : "border-red-500"} p-5">
            <div class="flex justify-between mb-2">
              <span class="text-xs font-bold text-slate-500">${m.name}</span>
              <span class="text-xs font-extrabold ${m.passed ? "text-emerald-700" : "text-red-600"}">${m.passed ? "O'tdi ✓" : "Yiqildi ✗"}</span>
            </div>
            <div class="text-3xl font-extrabold">${m.score}%</div>
            <div class="text-xs text-slate-500 mt-1">${m.raw}</div>
          </div>
        `).join("")}
      </div>

      <div class="flex justify-center gap-3">
        <button onclick="startExam(${state.selectedEinheit})" class="px-6 py-3 bg-teal-700 text-white font-bold rounded-xl text-sm">🔄 Qayta urinish</button>
        <button onclick="switchMainView('exams')" class="px-6 py-3 bg-slate-200 text-slate-800 font-bold rounded-xl text-sm">📋 Menyuga qaytish</button>
      </div>
    </div>
  `;
}

function openVocabForUnit(unitId) {
  state.vocabFilterEinheit = String(unitId);
  state.vocabFilterTopic = "all";
  state.vocabMode = "list";
  switchMainView("vocab");
}

function getFilteredVocab() {
  return VOCAB_DATABASE.filter(item => {
    const matchUnit = state.vocabFilterEinheit === "all" || String(item.einheit) === state.vocabFilterEinheit;
    const matchTopic = state.vocabFilterTopic === "all" || item.topic === state.vocabFilterTopic;
    return matchUnit && matchTopic;
  });
}

function renderVocabView() {
  const topics = [...new Set(VOCAB_DATABASE.map(v => v.topic))];
  const filtered = getFilteredVocab();

  return `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-extrabold text-slate-900">Lug'at to'plamlari (Wortschatz B1)</h2>
            <p class="text-xs text-slate-500">Bob (Einheit 1–12) va mavzu bo'yicha so'zlarni yodlang.</p>
          </div>
          <div class="flex bg-slate-100 p-1 rounded-xl self-start">
            ${[{ id: "list", label: "📋 Ro'yxat" }, { id: "flashcard", label: "🗂️ Kartochkalar" }, { id: "quiz", label: "🎯 Test" }].map(m => `
              <button onclick="state.vocabMode='${m.id}'; renderApp();" class="px-3.5 py-2 rounded-lg text-xs font-bold ${
                state.vocabMode === m.id ? "bg-teal-700 text-white" : "text-slate-700"
              }">${m.label}</button>
            `).join("")}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t">
          <select onchange="state.vocabFilterEinheit=this.value; renderApp();" class="px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50">
            <option value="all">Barcha boblar (Einheit 1–12)</option>
            ${EINHEITEN_META.map(e => `<option value="${e.id}" ${state.vocabFilterEinheit === String(e.id) ? "selected" : ""}>${e.title}</option>`).join("")}
          </select>
          <select onchange="state.vocabFilterTopic=this.value; renderApp();" class="px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50">
            <option value="all">Barcha mavzular (${filtered.length} ta so'z)</option>
            ${topics.map(t => `<option value="${t}" ${state.vocabFilterTopic === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </div>
      </div>

      ${state.vocabMode === "list" ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${filtered.map(w => `
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div class="flex justify-between mb-2">
                <span class="px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-md text-[11px] font-bold">Einheit ${w.einheit} • ${w.topic}</span>
                <button onclick='speakGerman(${JSON.stringify(w.de)}, 0.9, 1.0)' class="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold">🔊 Eshitish</button>
              </div>
              <div class="text-lg font-extrabold text-slate-900">${w.de}</div>
              <div class="text-sm font-semibold text-emerald-700 my-2">🇺🇿 ${w.uz}</div>
              <div class="bg-slate-50 p-3 rounded-xl text-xs text-slate-700">„${w.example}“</div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      ${state.vocabMode === "flashcard" && filtered.length > 0 ? (() => {
        const idx = state.flashcardIdx % filtered.length;
        const card = filtered[idx];
        return `
          <div class="max-w-xl mx-auto space-y-4">
            <div onclick="state.flashcardFlipped = !state.flashcardFlipped; renderApp();" class="cursor-pointer bg-white rounded-3xl border-2 border-teal-600 p-10 shadow-lg text-center min-h-[240px] flex flex-col items-center justify-center">
              ${!state.flashcardFlipped
                ? `<div class="text-2xl font-extrabold text-slate-900">${card.de}</div><div class="text-xs text-teal-700 mt-4">Aylantirish uchun bosing ↻</div>`
                : `<div class="text-2xl font-extrabold text-emerald-700">🇺🇿 ${card.uz}</div><p class="text-sm text-slate-600 mt-2">„${card.example}“</p>`
              }
            </div>
            <div class="flex justify-between">
              <button onclick="state.flashcardIdx = (state.flashcardIdx - 1 + ${filtered.length}) % ${filtered.length}; state.flashcardFlipped=false; renderApp();" class="px-5 py-2.5 bg-slate-200 rounded-xl text-xs font-bold">← Oldingi</button>
              <button onclick='speakGerman(${JSON.stringify(card.de)}, 0.9, 1.0)' class="px-5 py-2.5 bg-amber-400 rounded-xl text-xs font-bold">🔊 Eshitish</button>
              <button onclick="state.flashcardIdx = (state.flashcardIdx + 1) % ${filtered.length}; state.flashcardFlipped=false; renderApp();" class="px-5 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold">Keyingi →</button>
            </div>
          </div>
        `;
      })() : ""}

      ${state.vocabMode === "quiz" && filtered.length > 0 ? (() => {
        const idx = state.quizIdx % filtered.length;
        const current = filtered[idx];
        const others = VOCAB_DATABASE.filter(v => v.de !== current.de);
        const choices = [current.uz, others[0].uz, others[1].uz, others[2].uz].sort();
        return `
          <div class="max-w-xl mx-auto bg-white rounded-3xl border p-6 space-y-4">
            <div class="text-center py-4 bg-slate-50 rounded-2xl">
              <div class="text-2xl font-extrabold">${current.de}</div>
            </div>
            <div class="space-y-2">
              ${choices.map(ch => `
                <button onclick='state.quizAnswered=${JSON.stringify(ch)}; renderApp();' class="w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold ${
                  state.quizAnswered === ch ? (ch === current.uz ? "bg-emerald-600 text-white" : "bg-red-600 text-white") : "bg-slate-50"
                }">${ch}</button>
              `).join("")}
            </div>
            <button onclick="state.quizIdx++; state.quizAnswered=null; renderApp();" class="px-5 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold">Keyingi →</button>
          </div>
        `;
      })() : ""}
    </div>
  `;
}

function renderRedemittelView() {
  const activeCat = REDEMITTEL_CATEGORIES.find(c => c.id === state.redemittelCat) || REDEMITTEL_CATEGORIES[0];
  return `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 class="text-2xl font-extrabold text-slate-900">B1 Redemittel (Tayyor imtihon iboralari)</h2>
        <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          ${REDEMITTEL_CATEGORIES.map(cat => `
            <button onclick="state.redemittelCat='${cat.id}'; renderApp();" class="px-3.5 py-2 rounded-xl text-xs font-bold ${
              state.redemittelCat === cat.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
            }">${cat.title}</button>
          `).join("")}
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 class="text-lg font-extrabold text-teal-800 border-b pb-3">${activeCat.title}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          ${activeCat.phrases.map(p => `
            <div class="p-4 rounded-2xl bg-slate-50 border flex flex-col justify-between gap-3">
              <div>
                <div class="text-sm font-bold text-slate-900 mb-1">🇩🇪 ${p.de}</div>
                <div class="text-xs text-emerald-700 font-medium">🇺🇿 ${p.uz}</div>
              </div>
              <button onclick='speakGerman(${JSON.stringify(p.de.replace(/\[.*?\]/g, ""))}, 0.92, 1.0)' class="self-end px-3 py-1.5 bg-white border rounded-lg text-xs font-bold">🔊 Eshitish</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

window.onload = function () {
  if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
  renderApp();
};
