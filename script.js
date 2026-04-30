/* =========================================================
   Spin & Learn
   - Wheel categories (wedges) + questions each
   - True/False answers
   - Feedback screen always shown
     - Header differs based on correctness
     - If incorrect: show explanation
     - Always: prompt to take a course
     - courseCorrect shown when answer is right
     - courseIncorrect shown when answer is wrong
   - Prevent repeats per category until all used
   ========================================================= */
   import { wedges as englishWedges } from './questionsEnglish.js';
   import { wedges as spanishWedges } from './questionsSpanish.js';
   
   let currentLanguage = 'english';
   let wedges = englishWedges;
   
   const langBtn = document.getElementById('langToggleBtn');
   const CTAtext = document.getElementById('selectCTA');
   
   langBtn.addEventListener('click', () => {
     if (currentLanguage === 'english') {
       currentLanguage = 'spanish';
       spanishVariables();
       updateSoundButtonUI()
       
     } else {
       currentLanguage = 'english';
       englishVariables();
       updateSoundButtonUI()
      
     }
   
     // 🔁 IMPORTANT: reinitialize or redraw your wheel here
     drawWheel(); // or whatever your setup function is called
   });
   function englishVariables() {
    ANSWER_LABELS = {
      true: "Fact",
      false: "Fiction"
    };
    wedges = englishWedges;
    langBtn.textContent = 'Jugar en Español';
    CTAtext.textContent = 'Select an answer to learn more.';
    document.getElementById("spinBtn").textContent = "SPIN";
    trueBtn.innerText = ANSWER_LABELS.true;
    falseBtn.innerText = ANSWER_LABELS.false;
   }
   function spanishVariables() {
    ANSWER_LABELS = {
      true: "Hecho",
      false: "Ficción"
    };
    wedges = spanishWedges;
    langBtn.textContent = 'Play in English';
    CTAtext.textContent = 'Selecciona una respuesta para aprender más.';
    document.getElementById("spinBtn").textContent = "GIRAR";
    trueBtn.innerText = ANSWER_LABELS.true;
    falseBtn.innerText = ANSWER_LABELS.false;
    document.getElementById('learnMore').textContent = 'Aprende más en la capacitación de Grow NJ Kids:';
    document.getElementById("disclaimer").textContent = 'Para el compromiso de la conferencia y la conciencia de la capacitación. No es asesoramiento legal.';
    document.getElementById("backBtn").textContent = "Volver a la rueda";
  }
/* =========================
   WHEEL APPEARANCE
   =========================
   You can assign one color per wedge here.
   If you want the wheel to use colors from the editor later, this becomes config-driven.
*/
const colors = ["#A1BBD4", "#4f6f3e", "#d65c24"];
// const colors = ["#A1BBD4", "#cc0033", "#DFEAF4", "#4f6f3e", "#e28357", "#d65c24"];

/* =========================
   SPIN SETTINGS  ✅ SLOW DOWN HERE
   =========================
   To slow the wheel:
   1) Increase SPIN_TIME_MS (longer animation)
   2) Reduce SPIN_ANGLE_MIN/MAX (less total rotation)
   These two together control "how fast it feels."
*/
const SPIN_TIME_MS = 15000;     // was 3500; increase = slower spin
const SPIN_ANGLE_MIN = 100;   // lower = fewer total degrees of rotation
const SPIN_ANGLE_MAX = 500;   // lower = fewer total degrees of rotation

/* =========================
   ANSWER LABEL CONFIG
   =========================
   Change these labels without touching logic.
   The values MUST map to true/false internally.
*/
let ANSWER_LABELS = {
  true: "Fact",
  false: "Fiction"
};


/* =========================
   DOM REFERENCES
   ========================= */
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
let center = canvas.width / 2;
let radius = center;

const spinBtn = document.getElementById("spinBtn");
const overlay = document.getElementById("overlay");

const questionView = document.getElementById("questionView");
const infoView = document.getElementById("infoView");

const overlayTitle = document.getElementById("overlay-title");
const overlayQuestion = document.getElementById("overlay-question");

const WHEEL_PADDING = 20;

const trueBtn = document.getElementById("trueBtn");
const falseBtn = document.getElementById("falseBtn");
trueBtn.innerText = ANSWER_LABELS.true;
falseBtn.innerText = ANSWER_LABELS.false;


const feedbackTitle = document.getElementById("feedback-title");
const feedbackText = document.getElementById("feedback-text");

const courseName = document.getElementById("course-name");
const courseLink = document.getElementById("course-link");

const backBtn = document.getElementById("backBtn");
/* =========================
   AUDIO (Background + SFX)
   ========================= */

// Update these paths to match your files
const AUDIO_FILES = {
  bgm: "audio/background.mp3",
  cheer: "audio/cheer.mp3"
};

const audio = {
  bgm: new Audio(AUDIO_FILES.bgm),
  cheer: new Audio(AUDIO_FILES.cheer),
  unlocked: false,
  muted: false
};

// Background music settings
audio.bgm.loop = true;
audio.bgm.volume = 0.22;      // 0.0 to 1.0 (keep low under voice)
audio.bgm.preload = "auto";

// Cheer settings
audio.cheer.volume = 0.95;
audio.cheer.preload = "auto";

/** Try to unlock audio (must be called from a user gesture). */
async function unlockAudio() {
  if (audio.unlocked) return true;

  try {
    // A play/pause sequence often unlocks reliably across browsers
    await audio.bgm.play();
    audio.bgm.pause();
    audio.bgm.currentTime = 0;

    audio.unlocked = true;
    return true;
  } catch (err) {
    console.warn("Audio still blocked until a user interaction.", err);
    return false;
  }
}

function applyMuteState() {
  audio.bgm.muted = audio.muted;
  audio.cheer.muted = audio.muted;
}
const muteBtn = document.getElementById("muteBtn");

function updateSoundButtonUI() {
  if (currentLanguage === "english"){
    if (audio.muted || audio.bgm.paused) {
      muteBtn.textContent = "🔇 Sound Off";
    } else {
      muteBtn.textContent = "🔊 Sound On";
    }
  } else if (currentLanguage === "spanish"){
    if (audio.muted || audio.bgm.paused) {
      muteBtn.textContent = "🔇 Sonido Apagado";
    } else {
      muteBtn.textContent = "🔊 Sonido Encendido";
    }
  }
}

muteBtn.addEventListener("click", async () => {
  const ok = await unlockAudio();
  if (!ok) return;

  // Toggle sound state: if music is playing -> pause; if paused -> play
  if (!audio.bgm.paused && !audio.muted) {
    audio.bgm.pause();
  } else {
    audio.muted = false;      // ensure not muted when turning on
    applyMuteState();
    try {
      await audio.bgm.play();
    } catch (err) {
      console.warn("Could not start background music.", err);
    }
  }

  updateSoundButtonUI();
});

// Initialize button label
applyMuteState();
updateSoundButtonUI();

/**
 * Play cheer SFX (safe even if bgm is running).
 * Resets to start so it can fire repeatedly.
 */
function playCheer() {
  if (!audio.unlocked || audio.muted) return;

  const originalVol = audio.bgm.volume;

  // Duck background music if it's playing
  if (!audio.bgm.paused) {
    audio.bgm.volume = Math.max(0, originalVol * 0.25);
  }

  audio.cheer.currentTime = 0;
  audio.cheer.play().catch(() => {});

  const restore = () => {
    audio.bgm.volume = originalVol;
    audio.cheer.removeEventListener("ended", restore);
  };

  audio.cheer.addEventListener("ended", restore);

  // Fallback restore (in case "ended" doesn't fire)
  setTimeout(() => {
    audio.bgm.volume = originalVol;
  }, 2000);
}



/* =========================
   STATE
   ========================= */
let angle = 0;
let spinning = false;

let currentWedge = null;
let currentQuestion = null;

/**
 * Prevent repeats per category:
 * Map: category label -> Set of used question indices
 * Once all questions are used for a category, we clear its set.
 */
const usedQuestionIndicesByCategory = new Map();

/* =========================
   HELPERS
   ========================= */

/** Show overlay */
function showOverlay() {
  overlay.style.display = "flex";
}

/** Hide overlay */
function hideOverlay() {
  overlay.style.display = "none";
}

/** Show only one section inside the overlay */
function showSection(sectionEl) {
  questionView.style.display = "none";
  infoView.style.display = "none";
  sectionEl.style.display = "block";
}

/** Get or create the used-set for a category label */
function getUsedSetForCategory(label) {
  if (!usedQuestionIndicesByCategory.has(label)) {
    usedQuestionIndicesByCategory.set(label, new Set());
  }
  return usedQuestionIndicesByCategory.get(label);
}

/**
 * Pick a question that hasn't been used yet for this category.
 * If all have been used, we reset and start over.
 */
function pickNonRepeatingQuestion(wedge) {
  const used = getUsedSetForCategory(wedge.label);

  // Reset if all have been used
  if (used.size >= wedge.questions.length) {
    used.clear();
  }

  // Build list of unused indices
  const available = [];
  for (let i = 0; i < wedge.questions.length; i++) {
    if (!used.has(i)) available.push(i);
  }

  // Pick one unused index at random
  const idx = available[Math.floor(Math.random() * available.length)];
  used.add(idx);

  return wedge.questions[idx];
}
/**
 * Determines whether black or white text will have better contrast
 * against a given hex color.
 * Returns "#000000" or "#FFFFFF"
 */
function getContrastingTextColor(hexColor) {
  // Remove leading #
  const hex = hexColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

  // Threshold: tweak if needed (140–160 are common)
  return luminance > 150 ? "#000000" : "#FFFFFF";
}

function getBestTextLayout(ctx, text, maxWidth, baseFontSize) {
  let fontSize = baseFontSize;

  while (fontSize >= 12) {
    ctx.font = `${fontSize}px Arial`;

    // Try 1 line
    if (ctx.measureText(text).width <= maxWidth) {
      return { lines: [text], fontSize };
    }

    const words = text.split(' ');

    // Try 2 lines
    for (let i = 1; i < words.length; i++) {
      const line1 = words.slice(0, i).join(' ');
      const line2 = words.slice(i).join(' ');

      if (
        ctx.measureText(line1).width <= maxWidth &&
        ctx.measureText(line2).width <= maxWidth
      ) {
        return { lines: [line1, line2], fontSize };
      }
    }

    // Try 3 lines
    for (let i = 1; i < words.length - 1; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const line1 = words.slice(0, i).join(' ');
        const line2 = words.slice(i, j).join(' ');
        const line3 = words.slice(j).join(' ');

        if (
          ctx.measureText(line1).width <= maxWidth &&
          ctx.measureText(line2).width <= maxWidth &&
          ctx.measureText(line3).width <= maxWidth
        ) {
          return { lines: [line1, line2, line3], fontSize };
        }
      }
    }

    // If nothing fits, reduce font slightly and try again
    fontSize -= 1;
  }

  // Fallback (worst case)
  return { lines: [text], fontSize: 12 };
}
/* =========================
   DRAW THE WHEEL
   ========================= */

   function drawWheel() {
    const slice = (2 * Math.PI) / wedges.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const fontSize = Math.max(12, Math.min(16, Math.floor(220 / wedges.length)));
  
    for (let i = 0; i < wedges.length; i++) {
      const startAngle = angle + i * slice;
      const endAngle = startAngle + slice;
      const midAngle = startAngle + slice / 2;
  
      /* -------- Draw wedge -------- */
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
  
      /* -------- Divider -------- */
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(95,106,114,0.4)";
      ctx.lineWidth = 6;
      ctx.moveTo(center, center);
      ctx.lineTo(
        center + radius * Math.cos(startAngle),
        center + radius * Math.sin(startAngle)
      );
      ctx.stroke();
      ctx.restore();
  
      /* -------- Label -------- */
      const textRadius = radius * (wedges.length > 6 ? 0.5 : 0.6);
  
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(midAngle);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = getContrastingTextColor(colors[i % colors.length]);
  
      const label = wedges[i].label || ""; // ✅ safety
  
      const maxTextWidth = radius * 0.5;
      const baseFontSize = Math.max(14, Math.min(18, Math.floor(240 / wedges.length)));
  
      const { lines, fontSize: finalFontSize } =
        getBestTextLayout(ctx, label, maxTextWidth, baseFontSize);
  
      ctx.font = `${finalFontSize}px Arial`;
  
      const lineHeight = finalFontSize + 2;
      const offset = (lines.length - 1) * lineHeight / 2;
  
      lines.forEach((line, index) => {
        ctx.fillText(line, textRadius, index * lineHeight - offset);
      });
  
      ctx.restore();
    } // ✅ THIS WAS MISSING
  
    /* -------- Outer border -------- */
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#5F6A72";
    ctx.lineWidth = 10;
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }


/* =========================
   SPIN LOGIC
   ========================= */
function easeOutCubic(t) {
  // t in [0,1]
  return 1 - Math.pow(1 - t, 3);
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;

  // ✅ Random spin time (milliseconds)
  const duration = Math.floor(Math.random() * 2500) + 4500; // 4500–7000ms

  // ✅ Random total rotation (radians)
  // Convert "degrees" feel into radians: 360° = 2π
  const minTurns = 5;  // minimum full rotations
  const maxTurns = 9;  // maximum full rotations
  const turns = Math.random() * (maxTurns - minTurns) + minTurns;

  // Add some extra randomness within one turn
  const extra = Math.random() * (2 * Math.PI);

  const startAngle = angle;
  const targetAngle = startAngle + turns * (2 * Math.PI) + extra;

  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);    // 0..1
    const eased = easeOutCubic(t);                // fast then slow

    angle = startAngle + (targetAngle - startAngle) * eased;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      finishSpin(); // uses angle to pick category/question
      spinning = false;
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame(animate);
}


/**
 * Determine which wedge is at the arrow (top).
 * Then pick a non-repeating question from that wedge.
 */
function finishSpin() {
  const slice = (2 * Math.PI) / wedges.length;

  // Canvas 0 rad is at 3 o'clock. Our arrow is at 12 o'clock (-90°).
  // We want the angle that is pointing straight up, adjusted by current rotation.
  const pointerAngle = (3 * Math.PI / 2); // 12 o'clock in [0, 2π) terms

  // Normalize current wheel rotation into [0, 2π)
  const normalized = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

  // Compute which wedge is under the pointer
  // We subtract wheel rotation from pointer position to get "wheel space"
  const wheelSpaceAngle = (pointerAngle - normalized + (2 * Math.PI)) % (2 * Math.PI);

  const index = Math.floor(wheelSpaceAngle / slice) % wedges.length;

  currentWedge = wedges[index];
  currentQuestion = pickNonRepeatingQuestion(currentWedge);

  showQuestion(currentWedge, currentQuestion);

  spinning = false;
  spinBtn.disabled = false;
}


/* =========================
   OVERLAY FLOW
   ========================= */
function showQuestion(wedge, q) {
  overlayTitle.innerText = wedge.label;
  overlayQuestion.innerText = q.question;

  showSection(questionView);
  showOverlay();
}

/**
 * Called when user clicks True or False.
 * Shows the info screen with:
 * - A header based on correctness
 * - Explanation shown if incorrect
 * - A course CTA that differs based on whether the answer was correct or not:
 *     correct   → q.courseCorrect  / q.courseCorrectUrl
 *     incorrect → q.courseIncorrect / q.courseIncorrectUrl
 *
 * Falls back to the legacy single-course fields (q.course / q.courseUrl)
 * so existing question banks continue to work without modification.
 */
function answer(userAnswer) {
  const isCorrect = userAnswer === currentQuestion.correct;

  if (isCorrect) {
    playCheer(); // ✅ cheering for correct answers
  }
  if (currentLanguage === "english"){
     CTAtext.textContent = 'Select an answer to learn more.';
  
  feedbackTitle.innerText = isCorrect ? "✅ Correct!" : "ℹ️ Let's Take a Closer Look";

  feedbackText.innerText = isCorrect
    ? "Nice work! Want to go deeper? This topic is covered in available training."
    : `${currentQuestion.explanation} Want to explore this further? Grow NJ Kids training covers this topic in detail.`;
  } else if (currentLanguage === "spanish"){
     CTAtext.textContent = 'Selecciona una respuesta para aprender más.';
  
  feedbackTitle.innerText = isCorrect ? "✅ ¡Correcto!" : "ℹ️ Echemos un vistazo más de cerca";

  feedbackText.innerText = isCorrect
    ? "¡Buen trabajo! ¿Quieres profundizar? Este tema se cubre en la capacitación disponible."
    : `${currentQuestion.explanation} ¿Quieres explorar esto más a fondo? La capacitación de Grow NJ Kids cubre este tema en detalle.`;
  }
  // ── Course recommendation logic ──────────────────────────────────────────
  // Prefer the split correct/incorrect fields; fall back to the legacy
  // single `course` / `courseUrl` fields for backwards compatibility.
  const q = currentQuestion;

  const recommendedName = isCorrect
    ? (q.courseCorrect  || q.course || "Grow NJ Kids Training")
    : (q.courseIncorrect || q.course || "Grow NJ Kids Training");

  const recommendedUrl = isCorrect
    ? (q.courseCorrectUrl  ?? q.courseUrl ?? "")
    : (q.courseIncorrectUrl ?? q.courseUrl ?? "");
  // ────────────────────────────────────────────────────────────────────────

  courseName.innerText = recommendedName;

  // Show course link only if a URL exists
  if (recommendedUrl && recommendedUrl.trim() !== "") {
    courseLink.href = recommendedUrl;
    courseLink.style.display = "inline-block";
  } else {
    courseLink.href = "#";
    courseLink.style.display = "none";
  }

  showSection(infoView);
}

function backToWheel() {
  hideOverlay();
  currentWedge = null;
  currentQuestion = null;
}
function resizeCanvasToContainer() {
  const container = document.getElementById("wheel-container");
  const rect = container.getBoundingClientRect();

  // Set the canvas pixel size to match the CSS size
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);

  // Recompute geometry based on new size
  // IMPORTANT: these were const before; change them to let variables
  center = canvas.width / 2;
  radius = center - WHEEL_PADDING;

  drawWheel();
}

/* =========================
   EVENT LISTENERS
   ========================= */
spinBtn.addEventListener("click", spin);
trueBtn.addEventListener("click", () => answer(true));
falseBtn.addEventListener("click", () => answer(false));
backBtn.addEventListener("click", backToWheel);

/**
 * Optional: clicking outside the modal closes it.
 * If you want a more "locked" kiosk flow, comment this out.
 */
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) backToWheel();
});

/* =========================
   INIT
   ========================= */
drawWheel();
