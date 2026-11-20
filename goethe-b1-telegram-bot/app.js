let state = {
  mainView: "exams",
  selectedEinheit: 1,
  activeModule: "lesen",
  lesenPart: 1,
  horenPart: 1,
  sprechenPart: 1,
  timers: { lesen: 65 * 60, horen: 40 * 60, schreiben: 60 * 60, sprechen: 15 * 60 },
  timerInterval: null,
  answers: {
    lesen: {}, horen: {}, schreiben: { S1: "", S2: "", S3: "" },
    sprechen: { T1_notes: "", T2_notes: "", T3_notes: "", checklist: { t1_all_points: false, t1_interaction: false, t2_structure: false, t2_pros_cons: false, t3_feedback: false }, recordedBlobs: {} }
  },
  audioPlayCounts: {},
  showTranscripts: {},
  vocabFilterEinheit: "all",
  vocabFilterTopic: "all",
  vocabMode: "list",
  flashcardIdx: 0,
  flashcardFlipped: false,
  quizIdx: 0,
  quizAnswered: null,
  redemittelCat: "schreiben_email",
  isRecording: false,
  recordingPart: null,
  mediaRecorder: null,
  audioChunks: []
};

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); }

function showToast(msg, icon = "ℹ️") {
  const box = document.getElementById("toast-box");
  document.getElementById("toast-msg").textContent = msg;
  document.getElementById("toast-icon").textContent = icon;
  box.classList.remove("hidden");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => box.classList.add("hidden"), 3500);
}

function speakGerman(text, rate = 0.95) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function countWords(str) {
  return str && str.trim() ? str.trim().split(/\s+/).length : 0;
}

function startModuleTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (state.mainView !== "exam-session") { clearInterval(state.timerInterval); return; }
    const mod = state.activeModule;
    if (state.timers[mod] > 0) {
      state.timers[mod]--;
      const el = document.getElementById("live-timer-display");
      if (el) el.textContent = formatTime(state.timers[mod]);
    } else {
      clearInterval(state.timerInterval);
      showToast("Vaqt tugadi!", "⏰");
    }
  }, 1000);
}

function switchMainView(view) {
  stopSpeaking();
  state.mainView = view;
  ["exams", "vocab", "redemittel"].forEach(id => {
    const btn = document.getElementById(`nav-${id}`);
    if (btn) btn.className = (id === view || (view.startsWith("exam") && id === "exams"))
      ? "tab-active flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap";
  });
  renderApp();
}

function startExam(einheitId) {
  if (!EXAM_DATA[einheitId]) { showToast("Hozircha Einheit 1 simulyatori ochiladi!", "📘"); einheitId = 1; }
  state.selectedEinheit = einheitId;
  state.activeModule = "lesen";
  state.lesenPart = 1; state.horenPart = 1; state.sprechenPart = 1;
  state.timers = { lesen: 65 * 60, horen: 40 * 60, schreiben: 60 * 60, sprechen: 15 * 60 };
  state.answers = { lesen: {}, horen: {}, schreiben: { S1: "", S2: "", S3: "" }, sprechen: { T1_notes: "", T2_notes: "", T3_notes: "", checklist: { t1_all_points: false, t1_interaction: false, t2_structure: false, t2_pros_cons: false, t3_feedback: false }, recordedBlobs: {} } };
  state.audioPlayCounts = {};
  state.mainView = "exam-session";
  renderApp();
  startModuleTimer();
}

function switchExamModule(mod) {
  stopSpeaking();
  state.activeModule = mod;
  renderApp();
  startModuleTimer();
}

function calculateExamResults() {
  const exam = EXAM_DATA[state.selectedEinheit];
  let lesenCorrect = 0;
  exam.modules.lesen.parts.forEach(p => {
    if (p.questions) p.questions.forEach(q => { if (state.answers.lesen[q.id] === q.correct) lesenCorrect++; });
    if (p.subtexts) p.subtexts.forEach(st => st.questions.forEach(q => { if (state.answers.lesen[q.id] === q.correct) lesenCorrect++; }));
  });
  const lesenPercent = Math.round((lesenCorrect / 30) * 100);

  let horenCorrect = 0;
  exam.modules.horen.parts.forEach(p => p.tracks.forEach(tr => tr.questions.forEach(q => { if (state.answers.horen[q.id] === q.correct) horenCorrect++; })));
  const horenPercent = Math.round((horenCorrect / 30) * 100);

  const weights = { S1: 40, S2: 40, S3: 20 };
  let schreibenPoints = 0;
  exam.modules.schreiben.tasks.forEach(task => {
    const txt = (state.answers.schreiben[task.id] || "").trim();
    const wc = countWords(txt);
    if (wc >= 10) {
      let pt = Math.min(1, wc / (task.targetWords * 0.8)) * (weights[task.id] * 0.5);
      let hits = task.keywords.filter(kw => txt.toLowerCase().includes(kw)).length;
      pt += Math.min(1, hits / 3) * (weights[task.id] * 0.5);
      schreibenPoints += Math.round(pt);
    }
  });
  const schreibenPercent = Math.min(100, Math.round(schreibenPoints));

  const checkedCount = Object.values(state.answers.sprechen.checklist).filter(Boolean).length;
  let sprechenPercent = Math.min(100, checkedCount * 20);

  const modulesSummary = [
    { key: "lesen", name: "Lesen (O'qish)", score: lesenPercent, raw: `${lesenCorrect}/30 to'g'ri`, passed: lesenPercent >= 60 },
    { key: "horen", name: "Hören (Tinglash)", score: horenPercent, raw: `${horenCorrect}/30 to'g'ri`, passed: horenPercent >= 60 },
    { key: "schreiben", name: "Schreiben (Yozish)", score: schreibenPercent, raw: `${schreibenPercent}/100 ball`, passed: schreibenPercent >= 60 },
    { key: "sprechen", name: "Sprechen (Gapirish)", score: sprechenPercent, raw: `${sprechenPercent}/100 ball`, passed: sprechenPercent >= 60 }
  ];
  const failedModules = modulesSummary.filter(m => !m.passed);
  return { modulesSummary, failedModules, allPassed: failedModules.length === 0 };
}

function finishFullExam() {
  clearInterval(state.timerInterval);
  stopSpeaking();
  const res = calculateExamResults();
  if (tg) {
    try {
      tg.sendData(JSON.stringify({ type: "exam_result", einheit: state.selectedEinheit, allPassed: res.allPassed, scores: res.modulesSummary }));
    } catch (e) {}
  }
  state.mainView = "exam-result";
  renderApp();
}

async function toggleMicRecording(partKey) {
  if (state.isRecording) {
    state.isRecording = false;
    if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") state.mediaRecorder.stop();
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
    recorder.ondataavailable = e => { if (e.data.size > 0) state.audioChunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(state.audioChunks, { type: "audio/webm" });
      state.answers.sprechen.recordedBlobs[partKey] = URL.createObjectURL(blob);
      stream.getTracks().forEach(t => t.stop());
      renderApp();
      showToast("Ovoz saqlandi!", "🎙️");
    };
    recorder.start();
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
  return `<div class="space-y-6">
    <div class="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-2xl p-6 text-white shadow-lg flex flex-col lg:flex-row justify-between items-center gap-4">
      <div>
        <h2 class="text-2xl font-extrabold">Goethe-Zertifikat B1 Imtihon Markazi</h2>
        <p class="text-teal-100 text-sm mt-1">O'tish bali: har bir moduldan kamida 60% ball to'plash shart.</p>
      </div>
      <button onclick="startExam(1)" class="px-6 py-3.5 bg-amber-400 text-slate-900 font-bold rounded-xl shadow">🚀 1-Imtihonni boshlash</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${EINHEITEN_META.map(item => `<div class="bg-white rounded-2xl border p-5 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold text-teal-700">${item.pages}</span>
          <h4 class="font-bold text-slate-900 mt-1">${item.title}</h4>
          <p class="text-xs text-slate-500 my-3">${item.topics}</p>
        </div>
        <div class="flex justify-between pt-3 border-t">
          <button onclick="state.vocabFilterEinheit='${item.id}'; switchMainView('vocab');" class="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold">📚 Lug'at</button>
          <button onclick="startExam(${item.id})" class="px-4 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-bold">▶ Imtihon</button>
        </div>
      </div>`).join("")}
    </div>
  </div>`;
}

function renderExamSession() {
  const exam = EXAM_DATA[state.selectedEinheit];
  const mod = state.activeModule;
  return `<div class="space-y-5">
    <div class="bg-white rounded-2xl border p-4 flex flex-wrap justify-between items-center gap-4">
      <div>
        <h2 class="text-xl font-extrabold">${exam.name}</h2>
        <div class="flex gap-2 mt-2">
          ${["lesen","horen","schreiben","sprechen"].map(m => `<button onclick="switchExamModule('${m}')" class="px-3 py-1.5 rounded-lg text-xs font-bold ${mod===m?'bg-teal-700 text-white':'bg-slate-100'}">${m.toUpperCase()}</button>`).join("")}
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="bg-slate-900 text-emerald-400 px-4 py-2 rounded-xl font-mono font-bold" id="live-timer-display">${formatTime(state.timers[mod])}</div>
        <button onclick="finishFullExam()" class="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">✅ Yakunlash</button>
      </div>
    </div>
    ${mod === "lesen" ? renderLesenModule(exam.modules.lesen) : ""}
    ${mod === "horen" ? renderHorenModule(exam.modules.horen) : ""}
    ${mod === "schreiben" ? renderSchreibenModule(exam.modules.schreiben) : ""}
    ${mod === "sprechen" ? renderSprechenModule(exam.modules.sprechen) : ""}
  </div>`;
}

function renderLesenModule(lesen) {
  const part = lesen.parts.find(p => p.partNum === state.lesenPart) || lesen.parts[0];
  return `<div class="space-y-4">
    <div class="flex gap-2 bg-white p-3 rounded-xl border">
      ${lesen.parts.map(p => `<button onclick="state.lesenPart=${p.partNum}; renderApp();" class="px-3 py-1.5 rounded-lg text-xs font-bold ${state.lesenPart===p.partNum?'bg-teal-700 text-white':'bg-slate-100'}">Teil ${p.partNum}</button>`).join("")}
    </div>
    ${part.text ? `<div class="bg-white p-5 rounded-xl border text-sm leading-relaxed">${part.text}</div>` : ""}
    <div class="space-y-3">
      ${(part.questions || []).map(q => renderSingleQuestionCard(q, "lesen")).join("")}
      ${(part.subtexts || []).map(st => `<div class="bg-white p-4 rounded-xl border space-y-3"><p class="text-sm">${st.text}</p>${st.questions.map(q => renderSingleQuestionCard(q, "lesen")).join("")}</div>`).join("")}
    </div>
  </div>`;
}

function renderSingleQuestionCard(q, moduleKey) {
  const val = state.answers[moduleKey][q.id];
  if (!q.options && q.type !== "abc3") {
    return `<div class="bg-white p-4 rounded-xl border">
      <div class="text-sm font-medium mb-2"><strong>${q.num}.</strong> ${q.text}</div>
      <div class="flex gap-2">
        ${["Richtig","Falsch","JA","NEIN","a","b","c","d","e","f","g","h","i","j","0"].slice(0, q.type==="jn"?2:(q.type==="matching"?11:2)).map(opt => `<button onclick="state.answers['${moduleKey}']['${q.id}']='${opt}'; renderApp();" class="px-3 py-1.5 rounded-lg text-xs font-bold border ${val===opt?'bg-teal-700 text-white':'bg-slate-50'}">${opt}</button>`).join("")}
      </div>
    </div>`;
  }
  const opts = q.type === "abc3" ? { A: "Moderator", B: "Breitner", C: "Wild" } : q.options;
  return `<div class="bg-white p-4 rounded-xl border">
    <div class="text-sm font-medium mb-2"><strong>${q.num}.</strong> ${q.text}</div>
    <div class="space-y-1.5">
      ${Object.entries(opts).map(([k, l]) => `<button onclick="state.answers['${moduleKey}']['${q.id}']='${k}'; renderApp();" class="w-full text-left px-3 py-2 rounded-lg text-xs border ${val===k?'bg-teal-700 text-white':'bg-slate-50'}"><strong>${k})</strong> ${l}</button>`).join("")}
    </div>
  </div>`;
}

function renderHorenModule(horen) {
  const part = horen.parts.find(p => p.partNum === state.horenPart) || horen.parts[0];
  return `<div class="space-y-4">
    <div class="flex gap-2 bg-white p-3 rounded-xl border">
      ${horen.parts.map(p => `<button onclick="state.horenPart=${p.partNum}; renderApp();" class="px-3 py-1.5 rounded-lg text-xs font-bold ${state.horenPart===p.partNum?'bg-teal-700 text-white':'bg-slate-100'}">Teil ${p.partNum}</button>`).join("")}
    </div>
    ${part.tracks.map(tr => `<div class="bg-white p-5 rounded-xl border space-y-3">
      <div class="flex justify-between items-center">
        <span class="font-bold text-sm">${tr.label}</span>
        <button onclick='speakGerman(${JSON.stringify(tr.script)}, 0.92)' class="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold">🔊 Eshitish</button>
      </div>
      ${tr.questions.map(q => renderSingleQuestionCard(q, "horen")).join("")}
    </div>`).join("")}
  </div>`;
}

function renderSchreibenModule(schreiben) {
  return `<div class="space-y-4">
    ${schreiben.tasks.map(t => `<div class="bg-white p-5 rounded-xl border space-y-3">
      <h4 class="font-bold text-sm">${t.title}</h4>
      <p class="text-xs text-slate-600">${t.prompt}</p>
      <textarea rows="5" oninput="state.answers.schreiben['${t.id}']=this.value" class="w-full p-3 border rounded-xl text-sm">${state.answers.schreiben[t.id] || ""}</textarea>
    </div>`).join("")}
  </div>`;
}

function renderSprechenModule(sprechen) {
  const part = sprechen.parts.find(p => p.partNum === state.sprechenPart) || sprechen.parts[0];
  const pk = `P${part.partNum}`;
  return `<div class="space-y-4">
    <div class="flex gap-2 bg-white p-3 rounded-xl border">
      ${sprechen.parts.map(p => `<button onclick="state.sprechenPart=${p.partNum}; renderApp();" class="px-3 py-1.5 rounded-lg text-xs font-bold ${state.sprechenPart===p.partNum?'bg-teal-700 text-white':'bg-slate-100'}">Teil ${p.partNum}</button>`).join("")}
    </div>
    <div class="bg-white p-5 rounded-xl border space-y-4">
      <h4 class="font-bold">${part.title}</h4>
      <button onclick='speakGerman(${JSON.stringify(part.examinerPrompt)})' class="px-4 py-2 bg-teal-50 text-teal-800 border rounded-xl text-xs font-bold">🔊 Savolni eshitish</button>
      <button onclick="toggleMicRecording('${pk}')" class="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">🎙️ ${state.isRecording ? "To'xtatish" : "Ovoz yozish"}</button>
      ${state.answers.sprechen.recordedBlobs[pk] ? `<audio controls src="${state.answers.sprechen.recordedBlobs[pk]}"></audio>` : ""}
    </div>
  </div>`;
}

function renderExamResult() {
  const res = calculateExamResults();
  return `<div class="max-w-3xl mx-auto space-y-5">
    <div class="${res.allPassed ? 'bg-emerald-600' : 'bg-red-600'} text-white p-8 rounded-3xl">
      <h2 class="text-2xl font-extrabold">${res.allPassed ? "🎉 Tabriklaymiz! B1 imtihonidan o'tdingiz!" : "⚠️ Qayta urinib ko'ring, darajangiz B1 emas!"}</h2>
      ${!res.allPassed ? `<p class="mt-2 text-sm">Yiqilgan bo'limlar: ${res.failedModules.map(f => f.name + " (" + f.score + "%)").join(", ")}</p>` : ""}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${res.modulesSummary.map(m => `<div class="bg-white p-4 rounded-2xl border-2 ${m.passed?'border-emerald-500':'border-red-500'}">
        <div class="text-xs font-bold">${m.name}</div>
        <div class="text-2xl font-extrabold mt-1">${m.score}%</div>
      </div>`).join("")}
    </div>
    <button onclick="switchMainView('exams')" class="px-6 py-3 bg-teal-700 text-white rounded-xl text-sm font-bold">Menyuga qaytish</button>
  </div>`;
}

function renderVocabView() {
  const filtered = VOCAB_DATABASE.filter(v => state.vocabFilterEinheit === "all" || String(v.einheit) === state.vocabFilterEinheit);
  return `<div class="space-y-4">
    <div class="bg-white p-4 rounded-2xl border flex justify-between items-center">
      <h2 class="font-extrabold text-lg">Lug'at to'plamlari</h2>
      <select onchange="state.vocabFilterEinheit=this.value; renderApp();" class="border rounded-xl px-3 py-2 text-xs">
        <option value="all">Barcha boblar</option>
        ${EINHEITEN_META.map(e => `<option value="${e.id}" ${state.vocabFilterEinheit===String(e.id)?'selected':''}>${e.title}</option>`).join("")}
      </select>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      ${filtered.map(w => `<div class="bg-white p-4 rounded-xl border">
        <div class="flex justify-between"><span class="text-xs font-bold text-teal-700">Einheit ${w.einheit}</span><button onclick='speakGerman(${JSON.stringify(w.de)})' class="text-xs">🔊</button></div>
        <div class="font-bold text-base mt-1">${w.de}</div>
        <div class="text-xs text-emerald-700 font-semibold">${w.uz}</div>
      </div>`).join("")}
    </div>
  </div>`;
}

function renderRedemittelView() {
  return `<div class="space-y-4">
    ${REDEMITTEL_CATEGORIES.map(c => `<div class="bg-white p-5 rounded-2xl border space-y-2">
      <h3 class="font-bold text-teal-800">${c.title}</h3>
      ${c.phrases.map(p => `<div class="p-3 bg-slate-50 rounded-xl text-xs"><strong>🇩🇪 ${p.de}</strong><br><span class="text-emerald-700">🇺🇿 ${p.uz}</span></div>`).join("")}
    </div>`).join("")}
  </div>`;
}

window.onload = function() { renderApp(); };