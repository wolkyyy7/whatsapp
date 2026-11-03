// === GALA CASAL-WEBB INTERACTIVE ENGINE ===

const state = {
  currentSlide: 0,
  totalSlides: 17,
  mode: 'slides', // 'slides' or 'scroll'
  soundEnabled: true,
  scores: { sara: 0, juan: 0 },
  sceneTimer: null,
  scenePlaying: false,
  currentSceneKey: 'origen',
  sceneSpeed: 1
};

// --- Web Audio API Synthesizer (No external files needed) ---
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playPop(isJuan = false) {
  if (!state.soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  const baseFreq = isJuan ? 520 : 680;
  osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, ctx.currentTime + 0.065);
  gain.gain.setValueAtTime(0.14, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.075);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

function playTick() {
  if (!state.soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(900, ctx.currentTime);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.035);
}

function playGavel() {
  if (!state.soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  [0, 0.16].forEach(offset => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime + offset);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + offset + 0.12);
    gain.gain.setValueAtTime(0.28, ctx.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + offset);
    osc.stop(ctx.currentTime + offset + 0.15);
  });
}

function playWin() {
  if (!state.soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
    gain.gain.setValueAtTime(0.16, ctx.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.26);
  });
}

function playBuzzer() {
  if (!state.soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(115, ctx.currentTime + 0.28);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.32);
}

// --- Confetti Engine ---
const confettiParticles = [];
let confettiAnimId = null;

function launchConfetti(count = 90) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#f5c542', '#ff4d8d', '#38bdf8', '#25d366', '#a855f7', '#ffffff'];
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: window.innerWidth * (0.2 + Math.random() * 0.6),
      y: window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 5,
      size: 6 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
      alpha: 1
    });
  }
  if (!confettiAnimId) animateConfetti();
}

function animateConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.38;
    p.rot += p.vrot;
    p.alpha -= 0.008;
    if (p.alpha <= 0 || p.y > canvas.height + 30) {
      confettiParticles.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  }
  if (confettiParticles.length > 0) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimId = null;
  }
}

// --- Scoreboard ---
function addScore(person, delta = 1) {
  state.scores[person] = Math.max(0, state.scores[person] + delta);
  document.getElementById('score-sara').textContent = state.scores.sara;
  document.getElementById('score-juan').textContent = state.scores.juan;
  playTick();
}

// --- Slide Navigation ---
function showSlide(index) {
  const slides = document.querySelectorAll('.slide-section');
  state.totalSlides = slides.length;
  state.currentSlide = Math.max(0, Math.min(index, state.totalSlides - 1));

  slides.forEach((s, i) => {
    s.classList.toggle('active', i === state.currentSlide);
  });

  const pct = ((state.currentSlide + 1) / state.totalSlides) * 100;
  document.getElementById('progress-fill').style.width = `${pct}%`;

  const jumpSelect = document.getElementById('slide-jump');
  if (jumpSelect) jumpSelect.value = String(state.currentSlide);

  document.getElementById('btn-prev').disabled = state.currentSlide === 0;
  document.getElementById('btn-next').disabled = state.currentSlide === state.totalSlides - 1;

  if (state.mode === 'slides') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    slides[state.currentSlide].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  playTick();
}

function togglePresentationMode() {
  state.mode = state.mode === 'slides' ? 'scroll' : 'slides';
  document.body.classList.toggle('mode-slides', state.mode === 'slides');
  document.body.classList.toggle('mode-scroll', state.mode === 'scroll');
  const btn = document.getElementById('btn-mode');
  btn.innerHTML = state.mode === 'slides' ? '🖥️ Modo Diapositivas' : '📜 Modo Scroll Total';
  btn.classList.toggle('active', state.mode === 'scroll');
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  const btn = document.getElementById('btn-sound');
  btn.innerHTML = state.soundEnabled ? '🔊 Sonido ON' : '🔇 Silencio';
}

// --- REAL CHAT ANIMATED REENACTMENT SCENES ---
const SCENES = {
  origen: {
    title: 'Escena 1: El Origen a las 3:18 AM (27 Marzo)',
    subtitle: 'El primer "Gilipollas", el debate sofá vs. cama y el primer "domir" sin R de la historia',
    messages: [
      { banner: '📅 27 de marzo de 2026 — 03:18 AM' },
      { from: 'sara', text: '📞 Llamada de voz perdida', time: '03:18', delay: 600 },
      { from: 'juan', text: 'Gilipollas', time: '03:18', delay: 900 },
      { from: 'sara', text: 'tu más', time: '03:19', delay: 800 },
      { from: 'juan', text: 'Te saco 3 cabezas', time: '03:20', delay: 950 },
      { from: 'sara', text: 'si 8', time: '03:20', delay: 800 },
      { from: 'juan', text: 'Eres muy niña ipad', time: '03:21', delay: 950 },
      { from: 'sara', text: 'y tu\nps el doble', time: '03:22', delay: 900 },
      { from: 'sara', text: 'que haces ocupando mi espacio del sofá', time: '03:22', delay: 1100 },
      { from: 'juan', text: '1 es una cama', time: '03:23', delay: 900 },
      { from: 'sara', text: 'no me voy a poner a pensar como tú comprenderás a las 3 de la mañana', time: '03:24', delay: 1200 },
      { from: 'juan', text: '2 es mi espacio', time: '03:24', delay: 800 },
      { from: 'juan', text: 'Ni por el dia tampoco', time: '03:24', delay: 900 },
      { from: 'sara', text: 'bueno q te calles', time: '03:26', delay: 900 },
      { from: 'sara', text: 'que me voy a domir', time: '03:26', delay: 900, highlight: true },
      { from: 'juan', text: 'Ya te callo yo a ti\nComo he hecho antes\nBuenas noches', time: '03:26', delay: 1100 },
      { from: 'sara', text: 'buenas nochesss', time: '03:26', delay: 800 }
    ]
  },
  metralleta: {
    title: 'Escena 2: La Metralleta de las 47 Letras (23 Agosto)',
    subtitle: '41 mensajes de una sola letra en 49 segundos y un cierre digno de Óscar',
    messages: [
      { banner: '📅 23 de agosto de 2026 — 15:40 PM' },
      { from: 'sara', text: '🚫 Este mensaje fue eliminado (x3)', time: '15:40', delay: 700 },
      ...('HOLASABESQJEPUESQUEERESTONTITONADAMASJIJI'.split('').map((ch, idx) => ({
        from: 'sara',
        text: ch,
        time: '15:41',
        delay: idx < 6 ? 240 : 110,
        shake: idx % 5 === 0
      }))),
      { from: 'sara', text: '🚫 Este mensaje fue eliminado', time: '15:42', delay: 900 },
      { banner: '⏱️ 26 segundos sin respuesta de Juan...' },
      { from: 'sara', text: 'me has bloqueado?', time: '15:42', delay: 1100, highlight: true }
    ]
  },
  bipolar: {
    title: 'Escena 3: Del Grand Battement a la Policía (16 Mayo)',
    subtitle: 'Premio Oficial a la Bipolaridad Digital en 7 minutos y 49 segundos',
    messages: [
      { banner: '📅 16 de mayo de 2026 — 20:33 PM' },
      { from: 'juan', text: 'Me gusta esa foto', time: '20:33', delay: 800 },
      { from: 'sara', text: 'me la suda', time: '20:33', delay: 700 },
      { from: 'sara', text: 'es broma\npásamela porfa', time: '20:33', delay: 850 },
      { banner: '⚡ 8 minutos después...' },
      { from: 'sara', text: 'me voy a duchar ya', time: '20:39', delay: 800 },
      { from: 'juan', text: 'me\nLa\nSuda', time: '20:41', delay: 850 },
      { from: 'sara', text: 'okey\nno voy a decirte nada más\nchao', time: '20:41', delay: 950 },
      { from: 'juan', text: 'Me vas a llamar pringado a mi 🤣🤣\nTu a mi\nQue no sabias ni lo que era un kart', time: '20:43', delay: 1200 },
      { from: 'sara', text: 'sabes lo que es un gran batteman\nno verdad\nps a callar', time: '20:43', delay: 1200 },
      { from: 'juan', text: 'Pues si\nPero no te lo voy a explicar', time: '20:43', delay: 1000 },
      { from: 'sara', text: 'porque lo has buscado en google no te jode', time: '20:43', delay: 1000 },
      { from: 'sara', text: 'no me hables más y ya', time: '20:44', delay: 1200, highlight: true },
      { banner: '⏳ 7 minutos y 49 segundos de silencio dramático...' },
      { from: 'sara', text: 'cómo se llama lo de la policía\nsi están el la carretera', time: '20:52', delay: 1100, highlight: true }
    ]
  },
  picante: {
    title: 'Escena 4: Fuego vs. Siesta & El Papa de Roma',
    subtitle: 'Cuando uno intenta ponerse intenso y el otro sale por Peteneras',
    messages: [
      { banner: '🔥 Acto 1: 18 de abril de 2026 — 02:27 AM' },
      { from: 'juan', text: 'Te quiero en mi cama\nEncima mio', time: '02:27', delay: 1000 },
      { from: 'sara', text: 'mañna me duero la siesta contigo\ntanto me echas de menos ??', time: '02:28', delay: 1100, highlight: true },
      { banner: '⛪ Acto 2: 6 de junio de 2026 — 10:29 AM' },
      { from: 'sara', text: 'mi noviooooooo que guapo', time: '10:29', delay: 950 },
      { from: 'juan', text: 'Habran ido todos a ver al papa digo yo\nJajajajajaja', time: '10:29', delay: 1100, highlight: true },
      { banner: '🧊 Acto 3: 31 de mayo de 2026 — 20:58 PM' },
      { from: 'juan', text: 'Te quiero', time: '20:58', delay: 900 },
      { from: 'sara', text: 'dale', time: '20:59', delay: 950, highlight: true }
    ]
  },
  inception: {
    title: 'Escena 5: INCEPTION — Cómo nació este juego HOY (3 Nov)',
    subtitle: 'Hace apenas unas horas, mientras Sara volvía en autobús hacia el Zoco',
    messages: [
      { banner: '📅 HOY, 3 de noviembre de 2026 — 11:06 AM' },
      { from: 'juan', text: 'Fua\nCacho idea acabo de tener\nTe juro que va a ser muy gracioso', time: '11:06', delay: 1000 },
      { from: 'juan', text: 'Lo voy a preparar ahora por la mañana\nY luego te lo enseño cuando estemos juntos\nEs un juego sobre nosotros', time: '11:06', delay: 1200 },
      { from: 'sara', text: 'okisss', time: '11:12', delay: 950, highlight: true },
      { from: 'juan', text: 'Pero que desagradecida que te estoy preparando un juegazo y te la suuda\nGilipollas\n😠😠😠😠😠😠😠', time: '11:14', delay: 1200 },
      { from: 'sara', text: 'neneee\nque noooii\nque tengo mazo ganas', time: '11:14', delay: 1000 },
      { from: 'sara', text: 'a ver el juego\nq pasa???', time: '11:30', delay: 1000 },
      { from: 'sara', text: 'juan casal', time: '12:10', delay: 800 },
      { from: 'juan', text: 'Sara webo', time: '12:13', delay: 800 },
      { from: 'sara', text: 'tengo q ir en bus', time: '12:14', delay: 850 },
      { from: 'juan', text: 'Jajajaja plebeyaa\nBueno si no has llegado te hago la comida cuando llegues\nO te recojo en el zoco', time: '12:16', delay: 1200 },
      { from: 'sara', text: 'le bien\nlike cabezón', time: '12:16', delay: 950, highlight: true }
    ]
  }
};

function selectScene(key, btnEl) {
  state.currentSceneKey = key;
  document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  playScene(key);
}

function playScene(key = state.currentSceneKey) {
  if (state.sceneTimer) clearTimeout(state.sceneTimer);
  const scene = SCENES[key];
  if (!scene) return;

  const screen = document.getElementById('wa-live-screen');
  const statusEl = document.getElementById('wa-live-status');
  const mockup = document.getElementById('iphone-mockup');
  if (!screen) return;

  screen.innerHTML = '';
  let idx = 0;

  function step() {
    if (idx >= scene.messages.length) {
      statusEl.textContent = '✅ Escena completada — Pulsa Repetir o elige otra';
      return;
    }
    const item = scene.messages[idx++];
    if (item.banner) {
      const b = document.createElement('div');
      b.className = 'wa-time-banner';
      b.textContent = item.banner;
      screen.appendChild(b);
      screen.scrollTop = screen.scrollHeight;
      state.sceneTimer = setTimeout(step, 500 / state.sceneSpeed);
      return;
    }

    statusEl.textContent = item.from === 'sara' ? 'Sara Webb está escribiendo...' : 'Juan Casal está escribiendo...';

    const waitMs = (item.delay || 800) / state.sceneSpeed;
    state.sceneTimer = setTimeout(() => {
      const bub = document.createElement('div');
      bub.className = `bubble ${item.from}`;
      if (item.highlight) {
        bub.style.border = '1.5px solid #f5c542';
        bub.style.boxShadow = '0 0 15px rgba(245,197,66,0.3)';
      }
      const senderName = item.from === 'sara' ? '👸🏻 Sara Webb' : '🤴🏻 Juan Casal';
      bub.innerHTML = `<span class="sender-tag">${senderName}</span>${item.text.replace(/\n/g, '<br>')}<span class="meta">${item.time} ✓✓</span>`;
      screen.appendChild(bub);
      screen.scrollTop = screen.scrollHeight;

      if (item.shake && mockup) {
        mockup.classList.remove('shake');
        void mockup.offsetWidth;
        mockup.classList.add('shake');
      }
      playPop(item.from === 'juan');
      step();
    }, waitMs);
  }

  step();
}

function toggleSceneSpeed() {
  state.sceneSpeed = state.sceneSpeed === 1 ? 2 : 1;
  document.getElementById('btn-speed').textContent = `⚡ Velocidad: ${state.sceneSpeed}x`;
}

// --- CHRONOBIOLOGY 24H CHART ---
const HOURLY_SARA = [924,693,980,1027,648,319,61,73,149,311,789,914,913,1213,1307,1165,1184,918,1141,862,1110,874,1114,1196];
const HOURLY_JUAN = [750,547,792,841,513,298,27,51,136,350,747,845,862,1073,1157,1021,1179,960,1082,689,976,861,978,1071];

function renderHourlyChart() {
  const container = document.getElementById('hourly-chart');
  const detail = document.getElementById('hour-detail');
  if (!container) return;
  const maxTotal = Math.max(...HOURLY_SARA.map((s, i) => s + HOURLY_JUAN[i]));
  container.innerHTML = '';

  for (let h = 0; h < 24; h++) {
    const s = HOURLY_SARA[h];
    const j = HOURLY_JUAN[h];
    const sPct = Math.max(4, Math.round((s / maxTotal) * 100));
    const jPct = Math.max(4, Math.round((j / maxTotal) * 100));

    const col = document.createElement('div');
    col.className = 'hour-col';
    col.innerHTML = `
      <div class="hour-bar-wrap">
        <div class="bar-s" style="height:${sPct}%"></div>
        <div class="bar-j" style="height:${jPct}%"></div>
      </div>
      <span class="hour-lbl">${String(h).padStart(2, '0')}h</span>
    `;
    col.addEventListener('click', () => {
      playTick();
      const total = s + j;
      let comment = 'Actividad normal de charla.';
      if (h === 3) comment = '🦉 ¡PICO VAMPIRO DE MADRUGADA! Más mensajes a las 3 AM que a las 9 de la mañana.';
      else if (h === 6 || h === 7) comment = '😴 Hora zombie: prácticamente nadie respira a esta hora.';
      else if (h === 14) comment = '🍝 ¡Récord absoluto de Sara (1.307 mensajes a la hora de comer)!';
      else if (h === 16) comment = '☕ ¡Hora punta de Juan (1.179 mensajes a la hora de la siesta)!';
      detail.innerHTML = `<strong>🕒 Franja ${String(h).padStart(2, '0')}:00 - ${String(h).padStart(2, '0')}:59:</strong> Total <b>${total}</b> mensajes (👸🏻 Sara: <b>${s}</b> | 🤴🏻 Juan: <b>${j}</b>) — <em>${comment}</em>`;
    });
    container.appendChild(col);
  }
}

// --- JURY TRIAL INTERACTIVE GAME ---
function revealVerdict(id, winner) {
  playGavel();
  const box = document.getElementById(`verdict-${id}`);
  if (box) {
    box.classList.add('visible');
  }
}

// --- BLIND TRIVIA INTERACTIVE GAME ---
function answerTrivia(qIndex, chosen, actual, btnEl) {
  const card = document.getElementById(`trivia-card-${qIndex}`);
  if (!card || card.dataset.answered === 'true') return;
  card.dataset.answered = 'true';

  const resultBox = document.getElementById(`trivia-res-${qIndex}`);
  const isCorrect = chosen === actual;

  if (isCorrect) {
    playWin();
    launchConfetti(45);
    btnEl.style.background = '#16a34a';
    btnEl.style.borderColor = '#22c55e';
  } else {
    playBuzzer();
    btnEl.style.background = '#dc2626';
    btnEl.style.borderColor = '#ef4444';
  }

  if (resultBox) {
    resultBox.classList.add('visible');
    const badge = resultBox.querySelector('.trivia-outcome');
    if (badge) {
      badge.innerHTML = isCorrect
        ? '✅ ¡ACIERTO TOTAL! (+1 punto en el marcador de arriba)'
        : '❌ ¡FALLASTE! Te ha traicionado el subconsciente';
      badge.style.color = isCorrect ? '#4ade80' : '#f87171';
    }
  }
}

// --- HIGHER OR LOWER BETTING GAME ---
function resolveBet(betId, realValue) {
  const sInput = document.getElementById(`bet-sara-${betId}`);
  const jInput = document.getElementById(`bet-juan-${betId}`);
  const outBox = document.getElementById(`bet-res-${betId}`);
  const counterEl = document.getElementById(`bet-num-${betId}`);
  if (!outBox || !counterEl) return;

  const sVal = parseInt(sInput?.value || '0', 10);
  const jVal = parseInt(jInput?.value || '0', 10);
  const sDiff = Math.abs(realValue - sVal);
  const jDiff = Math.abs(realValue - jVal);

  outBox.classList.add('visible');
  playWin();
  launchConfetti(55);

  // Animate odometer
  let cur = 0;
  const step = Math.ceil(realValue / 25);
  const timer = setInterval(() => {
    cur += step;
    if (cur >= realValue) {
      cur = realValue;
      clearInterval(timer);
    }
    counterEl.textContent = cur.toLocaleString('es-ES');
  }, 30);

  const winnerEl = document.getElementById(`bet-win-${betId}`);
  if (winnerEl) {
    if (sDiff < jDiff) {
      winnerEl.innerHTML = `🏆 ¡Punto para <b>SARA</b>! (Se quedó a ${sDiff} vs ${jDiff} de Juan)`;
      addScore('sara', 1);
    } else if (jDiff < sDiff) {
      winnerEl.innerHTML = `🏆 ¡Punto para <b>JUAN</b>! (Se quedó a ${jDiff} vs ${sDiff} de Sara)`;
      addScore('juan', 1);
    } else {
      winnerEl.innerHTML = `🤝 ¡EMPATE EXACTO! (+1 punto para cada uno)`;
      addScore('sara', 1);
      addScore('juan', 1);
    }
  }
}

// --- ROULETTE WHEEL ---
const ROULETTE_PRIZES = [
  { label: 'Prohibido "Vale/Okis" 24h', desc: 'Quien pierda hoy no puede escribir ni "vale", ni "valee", ni "ok", ni "okis" en 24 horas.' },
  { label: 'Escribir 3x DORMIR con R', desc: 'Sara tiene que escribir 3 veces seguidas "Me voy a doRmir" pronunciando la R como un motor.' },
  { label: 'Abrazo de 30 Segundos', desc: 'Cronometrado ahora mismo sin hablar ni reírse (si alguien se ríe, empieza de cero).' },
  { label: 'Foto Juntos SIN Bombita 💣', desc: 'Hacerse una foto juntos ahora mismo y mandarla normal (prohibido usar visualización única).' },
  { label: 'Postre / Cena Invitada', desc: 'El que tenga menos puntos en el marcador superior invita al próximo postre o merienda.' },
  { label: 'Audio Dramático de 1 Min', desc: 'Grabar un audio imitando al otro diciendo sus muletillas ("bro mira", "tlj", "valee perfe").' }
];

let wheelAngle = 0;
function drawRoulette() {
  const canvas = document.getElementById('roulette-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 4;
  const colors = ['#ec4899', '#2563eb', '#d97706', '#9333ea', '#059669', '#dc2626'];
  const slice = (2 * Math.PI) / ROULETTE_PRIZES.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ROULETTE_PRIZES.forEach((p, i) => {
    const start = i * slice - Math.PI / 2;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillText(p.label, r - 14, 4);
    ctx.restore();
  });
}

function spinRoulette() {
  const canvas = document.getElementById('roulette-canvas');
  const resBox = document.getElementById('roulette-result');
  if (!canvas) return;

  const extraSpins = 5 + Math.floor(Math.random() * 4);
  const randDeg = Math.floor(Math.random() * 360);
  wheelAngle += extraSpins * 360 + randDeg;
  canvas.style.transform = `rotate(${wheelAngle}deg)`;

  let ticks = 0;
  const tickTimer = setInterval(() => {
    playTick();
    ticks++;
    if (ticks > 18) clearInterval(tickTimer);
  }, 180);

  setTimeout(() => {
    const norm = (360 - (wheelAngle % 360)) % 360;
    const idx = Math.floor(norm / (360 / ROULETTE_PRIZES.length)) % ROULETTE_PRIZES.length;
    const prize = ROULETTE_PRIZES[idx];
    playWin();
    launchConfetti(100);
    if (resBox) {
      resBox.classList.add('visible');
      resBox.innerHTML = `<h3 class="gold-text" style="margin-bottom:6px;">🎯 ¡HA TOCADO: ${prize.label}!</h3><p>${prize.desc}</p>`;
    }
  }, 4050);
}

// --- INIT & TOUCH/KEYBOARD EVENTS ---
window.addEventListener('DOMContentLoaded', () => {
  renderHourlyChart();
  drawRoulette();
  showSlide(0);
  playScene('origen');

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') showSlide(state.currentSlide + 1);
    else if (e.key === 'ArrowLeft') showSlide(state.currentSlide - 1);
  });

  // Touch swipe for iPhone & iPad in Slide Mode
  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', e => {
    if (state.mode !== 'slides') return;
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.8) {
      if (dx < 0) showSlide(state.currentSlide + 1);
      else showSlide(state.currentSlide - 1);
    }
  }, { passive: true });
});
