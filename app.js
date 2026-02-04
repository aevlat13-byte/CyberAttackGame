const MAX_WAVES = 6;
const baseState = {
  health: 100,
  score: 0,
  wave: 1,
  streak: 0,
  difficulty: "easy",
  currentThreat: null,
  buffs: {
    training: false,
    updates: false,
    twoFA: false
  }
};

const state = { ...baseState };

const threatDeck = [
  {
    id: "phishing",
    name: "Phishing Email",
    hintEasy: "Look for a fake message asking you to click urgently.",
    hintStandard: "An urgent request appears in your inbox.",
    window: "emailWindow",
    visual: () => {
      emailContent.innerHTML = `
        <p><strong>From:</strong> School IT &lt;support@example.com&gt;</p>
        <p><strong>Subject:</strong> Immediate password reset required</p>
        <p>
          We noticed suspicious activity. Click the button below to keep your account active.
        </p>
        <button class="primary-btn" disabled>Verify account</button>
        <p class="small">Link preview: http://school-support.example.com</p>
      `;
    },
    correct: ["reportDelete", "staffTraining"],
    explanation: "Phishing relies on urgency and fake links. Report and delete the email so no one clicks it.",
    tip: "Hover over links and check the sender before trusting a message."
  },
  {
    id: "adware",
    name: "Adware Pop-ups",
    hintEasy: "Annoying ads keep appearing and the browser redirects.",
    hintStandard: "Unexpected ads and redirect messages show up.",
    window: "browserWindow",
    visual: () => {
      browserContent.innerHTML = `
        <p><strong>Warning:</strong> Your browser was redirected to an ad site.</p>
        <div class="ad-pop">"You are the 1,000,000th visitor! Claim prize now!"</div>
        <div class="ad-pop">"Download booster pack" (blocked)</div>
      `;
      spawnToast("Adware is opening pop-ups in the browser.");
    },
    correct: ["antiMalware", "updateSoftware"],
    explanation: "Adware hides in unwanted installs. An anti-malware scan removes it.",
    tip: "Only install trusted software and keep your browser updated."
  },
  {
    id: "ransomware",
    name: "Ransomware Lock",
    hintEasy: "Files are locked and a ransom note appears.",
    hintStandard: "A lock screen appears with payment demands.",
    window: "filesWindow",
    visual: () => {
      filesContent.innerHTML = `
        <p><strong>Files:</strong> All documents show a lock icon.</p>
        <ul>
          <li>Homework.docx (locked)</li>
          <li>Project.pptx (locked)</li>
          <li>Photos.zip (locked)</li>
        </ul>
      `;
      showOverlay(`
        <div class="ransom-note">
          <h2>Files Encrypted</h2>
          <p>Your files have been locked. Pay 3.5 credits to unlock.</p>
          <div class="ransom-timer">Countdown: 02:15:09</div>
          <p>Contact: unlock@payme.example.com</p>
        </div>
      `);
    },
    correct: ["restoreBackup", "disconnectNetwork"],
    explanation: "Ransomware encrypts files. Restore from backup and isolate the device.",
    tip: "Back up important work to a safe location regularly."
  },
  {
    id: "bruteforce",
    name: "Brute Force Attack",
    hintEasy: "Multiple failed logins trigger an alert.",
    hintStandard: "Login attempts are spiking.",
    window: "settingsWindow",
    visual: () => {
      spawnToast("Alert: 42 login attempts in 5 minutes. Account lock soon.");
    },
    correct: ["enable2fa", "changePassword", "firewallRule"],
    explanation: "Attackers guess passwords. Use 2FA and enforce strong passwords.",
    tip: "Create long passphrases and enable login alerts."
  },
  {
    id: "botnet",
    name: "Botnet / Network Compromise",
    hintEasy: "Network meter spikes with unusual outbound traffic.",
    hintStandard: "Outbound traffic is unusually high.",
    window: "browserWindow",
    visual: () => {
      browserContent.innerHTML = `
        <p><strong>Network Monitor:</strong> Outbound traffic is 6x normal.</p>
        <p>Multiple unknown connections detected.</p>
      `;
      spawnToast("Unusual outbound traffic detected.");
    },
    correct: ["firewallRule", "disconnectNetwork"],
    explanation: "Botnets use your device to send traffic. Block with firewall rules or disconnect.",
    tip: "Monitor network activity and block unknown connections."
  }
];

const actions = [
  {
    id: "reportDelete",
    label: "Report & Delete suspicious email",
    description: "Flag the message and remove it from inbox."
  },
  {
    id: "staffTraining",
    label: "Staff training refresher",
    description: "Teach people how to spot phishing."
  },
  {
    id: "antiMalware",
    label: "Run anti-malware scan",
    description: "Find and remove unwanted programs."
  },
  {
    id: "firewallRule",
    label: "Enable/configure firewall rule",
    description: "Block suspicious traffic and log attempts."
  },
  {
    id: "enable2fa",
    label: "Turn on 2FA",
    description: "Require a second login code."
  },
  {
    id: "updateSoftware",
    label: "Update software and browser",
    description: "Patch known security holes."
  },
  {
    id: "disconnectNetwork",
    label: "Disconnect from network",
    description: "Stop spread while investigating."
  },
  {
    id: "restoreBackup",
    label: "Restore from backup",
    description: "Recover safe versions of files."
  },
  {
    id: "changePassword",
    label: "Change password + enforce policy",
    description: "Reset to a strong passphrase."
  }
];

const healthFill = document.getElementById("healthFill");
const healthValue = document.getElementById("healthValue");
const scoreValue = document.getElementById("scoreValue");
const waveValue = document.getElementById("waveValue");
const statusText = document.getElementById("statusText");
const clock = document.getElementById("clock");
const securityActions = document.getElementById("securityActions");
const notifications = document.getElementById("notifications");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlayContent");
const feedbackModal = document.getElementById("feedbackModal");
const feedbackContent = document.getElementById("feedbackContent");
const endModal = document.getElementById("endModal");
const endTitle = document.getElementById("endTitle");
const endMessage = document.getElementById("endMessage");
const rankText = document.getElementById("rankText");
const nextWaveBtn = document.getElementById("nextWaveBtn");
const restartBtn = document.getElementById("restartBtn");

const emailContent = document.getElementById("emailContent");
const filesContent = document.getElementById("filesContent");
const browserContent = document.getElementById("browserContent");

const openButtons = document.querySelectorAll("[data-open]");
const windows = document.querySelectorAll(".window");
const difficultyButtons = document.querySelectorAll(".difficulty__btn");

const randomIndex = (max) => Math.floor(Math.random() * max);

function updateHud() {
  healthValue.textContent = state.health;
  scoreValue.textContent = state.score;
  waveValue.textContent = `${state.wave}/${MAX_WAVES}`;
  healthFill.style.width = `${Math.max(state.health, 0)}%`;
}

function spawnToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  notifications.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function showOverlay(html) {
  overlayContent.innerHTML = html;
  overlay.classList.add("is-active");
  overlay.setAttribute("aria-hidden", "false");
}

function hideOverlay() {
  overlay.classList.remove("is-active");
  overlay.setAttribute("aria-hidden", "true");
  overlayContent.innerHTML = "";
}

function renderActions() {
  securityActions.innerHTML = "";
  actions.forEach((action) => {
    const button = document.createElement("button");
    button.className = "action-btn";
    button.dataset.action = action.id;
    button.innerHTML = `<strong>${action.label}</strong><br /><span>${action.description}</span>`;
    securityActions.appendChild(button);
  });
}

function resetWindows() {
  windows.forEach((window) => {
    window.classList.remove("is-open");
    window.setAttribute("aria-hidden", "true");
  });
}

function openWindow(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add("is-open");
  target.setAttribute("aria-hidden", "false");
}

function startWave() {
  resetWindows();
  hideOverlay();
  const threat = threatDeck[randomIndex(threatDeck.length)];
  state.currentThreat = threat;
  threat.visual();
  openWindow(threat.window);
  openWindow("securityWindow");
  statusText.textContent = "Threat detected";
  const hint = state.difficulty === "easy" ? threat.hintEasy : threat.hintStandard;
  spawnToast(hint);
}

function handleAction(actionId) {
  const threat = state.currentThreat;
  if (!threat) return;
  const isCorrect = threat.correct.includes(actionId);
  const healthPenalty = state.difficulty === "easy" ? 15 : 20;
  let feedback = "";
  if (isCorrect) {
    state.score += 10;
    state.streak += 1;
    if (state.streak >= 2) {
      state.score += 5;
      feedback += "Streak bonus +5. ";
    }
    statusText.textContent = "Threat contained";
  } else {
    state.health -= healthPenalty;
    state.streak = 0;
    statusText.textContent = "Infection worsened";
  }

  if (actionId === "staffTraining") state.buffs.training = true;
  if (actionId === "updateSoftware") state.buffs.updates = true;
  if (actionId === "enable2fa") state.buffs.twoFA = true;

  if (!isCorrect) {
    feedback += "That defence did not match the threat.";
  }

  showFeedback(threat, isCorrect, feedback);
}

function showFeedback(threat, isCorrect, extraNote) {
  hideOverlay();
  feedbackContent.innerHTML = `
    <p><strong>Threat identified:</strong> ${threat.name}</p>
    <p><strong>Best defence:</strong> ${threat.correct.map(mapActionLabel).join(" or ")}</p>
    <p><strong>Outcome:</strong> ${isCorrect ? "Threat blocked." : "Threat spread further."}</p>
    <p><strong>Why:</strong> ${threat.explanation}</p>
    <p><strong>In future:</strong> ${threat.tip}</p>
    ${extraNote ? `<p class="note">${extraNote}</p>` : ""}
  `;
  feedbackModal.classList.add("is-active");
  feedbackModal.setAttribute("aria-hidden", "false");
}

function mapActionLabel(actionId) {
  const action = actions.find((item) => item.id === actionId);
  return action ? action.label : actionId;
}

function nextWave() {
  feedbackModal.classList.remove("is-active");
  feedbackModal.setAttribute("aria-hidden", "true");
  state.wave += 1;
  updateHud();
  if (state.health <= 0) {
    endGame(false);
    return;
  }
  if (state.wave > MAX_WAVES) {
    endGame(true);
    return;
  }
  setTimeout(startWave, 800);
}

function endGame(isWin) {
  endTitle.textContent = isWin ? "System Secured" : "System Compromised";
  endMessage.textContent = isWin
    ? "Great work! You matched the right defences to each threat."
    : "System Health reached zero. Review the feedback and try again.";

  const rankScore = state.score;
  let rank = "Trainee Technician";
  if (rankScore >= 90) rank = "Chief Analyst";
  else if (rankScore >= 70) rank = "Incident Responder";
  else if (rankScore >= 50) rank = "Junior Analyst";
  rankText.textContent = `Detective Rank: ${rank}`;

  endModal.classList.add("is-active");
  endModal.setAttribute("aria-hidden", "false");
}

function resetGame() {
  Object.assign(state, JSON.parse(JSON.stringify(baseState)));
  updateHud();
  statusText.textContent = "System stable";
  endModal.classList.remove("is-active");
  endModal.setAttribute("aria-hidden", "true");
  feedbackModal.classList.remove("is-active");
  feedbackModal.setAttribute("aria-hidden", "true");
  hideOverlay();
  startWave();
}

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

openButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.open;
    openWindow(target);
  });
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    difficultyButtons.forEach((btn) => btn.classList.remove("is-active"));
    button.classList.add("is-active");
    state.difficulty = button.dataset.difficulty;
    spawnToast(`Difficulty set to ${state.difficulty}.`);
  });
});

securityActions.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  handleAction(button.dataset.action);
});

nextWaveBtn.addEventListener("click", nextWave);
restartBtn.addEventListener("click", resetGame);

renderActions();
updateHud();
updateClock();
setInterval(updateClock, 1000);
startWave();
