// ── State ────────────────────────────────────────────────
const ALL_COL_LETTERS = ['A','B','C','D','E','F'];
let ROW_NUMBERS = ['1','2','3','4'];

let numPairs    = 12;
let COLS        = 6;
let ROWS        = 4;
let TOTAL       = 24;
let COL_LETTERS = ALL_COL_LETTERS.slice(0, COLS);

let images      = [];   // image URLs (one per pair)
let cards       = [];   // shuffled array of TOTAL {id, src, matched, flipped}
let flipped     = [];   // up to 2 currently face-up unmatched cards
let locked      = false;
let currentTeam = 0;    // 0 = team1, 1 = team2
let scores      = [0, 0];
let teamNames   = ['Team 1', 'Team 2'];

// ── Setup screen ─────────────────────────────────────────
const fileInput      = document.getElementById('file-input');
const btnLoad        = document.getElementById('btn-load-images');
const imageListInput = document.getElementById('image-list-input');
const setupError     = document.getElementById('setup-error');
const setupScreen    = document.getElementById('setup-screen');

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    const urls = Array.from(fileInput.files).map(f => URL.createObjectURL(f));
    imageListInput.value = ''; // clear text input
    tryStartGame(urls);
  }
});

btnLoad.addEventListener('click', () => {
  if (fileInput.files.length > 0) {
    const urls = Array.from(fileInput.files).map(f => URL.createObjectURL(f));
    tryStartGame(urls);
  } else {
    const raw = imageListInput.value.trim();
    if (!raw) { setupError.textContent = 'Paste image paths or pick files.'; return; }
    const urls = raw.split(',').map(s => s.trim()).filter(Boolean);
    tryStartGame(urls);
  }
});

function tryStartGame(urls) {
  numPairs = parseInt(document.getElementById('pair-count').value, 10);
  if (urls.length < numPairs) {
    setupError.textContent = `Need at least ${numPairs} images — you provided ${urls.length}.`;
    return;
  }
  images = urls.slice(0, numPairs);
  setupError.textContent = '';
  setupScreen.style.display = 'none';
  initGame();
}

// ── Grid dimension helper ──────────────────────────────────
// Prefer 4 rows; fall back to other row counts keeping cols ≤ 6
function getGridDims(pairs) {
  const total = pairs * 2;
  if (total % 4 === 0 && total / 4 <= 6) return { cols: total / 4, rows: 4 };
  for (let rows = 3; rows <= 6; rows++) {
    if (total % rows === 0 && total / rows <= 6) return { cols: total / rows, rows };
  }
  return { cols: total, rows: 1 };
}

// ── Game init ─────────────────────────────────────────────
function initGame() {
  flipped     = [];
  locked      = false;
  currentTeam = 0;
  scores      = [0, 0];

  // Compute grid dimensions
  const dims  = getGridDims(numPairs);
  COLS        = dims.cols;
  ROWS        = dims.rows;
  TOTAL       = numPairs * 2;
  COL_LETTERS = ALL_COL_LETTERS.slice(0, COLS);
  ROW_NUMBERS = Array.from({ length: ROWS }, (_, i) => String(i + 1));

  // Build deck (each image twice)
  const deck = [];
  images.forEach((src, i) => {
    deck.push({ id: i * 2,     pairId: i, src });
    deck.push({ id: i * 2 + 1, pairId: i, src });
  });
  shuffle(deck);
  cards = deck.map(c => ({ ...c, matched: false, flipped: false }));

  renderScoreboard();
  renderGrid();
}

// ── Rendering ─────────────────────────────────────────────
function renderGrid() {
  const wrapper = document.getElementById('grid-wrapper');
  wrapper.innerHTML = '';
  wrapper.style.gridTemplateColumns = `32px repeat(${COLS}, 1fr)`;
  wrapper.style.gridTemplateRows    = `28px repeat(${ROWS}, 1fr)`;

  // corner (empty top-left cell)
  const corner = document.createElement('div');
  corner.style.gridRow = '1';
  corner.style.gridColumn = '1';
  wrapper.appendChild(corner);

  COL_LETTERS.forEach((letter, ci) => {
    const lbl = document.createElement('div');
    lbl.className = 'col-label';
    lbl.style.gridRow = '1';
    lbl.style.gridColumn = ci + 2;
    lbl.textContent = letter;
    wrapper.appendChild(lbl);
  });

  for (let r = 0; r < ROWS; r++) {
    const rl = document.createElement('div');
    rl.className = 'row-label';
    rl.style.gridRow = r + 2;
    rl.style.gridColumn = '1';
    rl.textContent = ROW_NUMBERS[r];
    wrapper.appendChild(rl);

    for (let c = 0; c < COLS; c++) {
      const idx  = r * COLS + c;
      const data = cards[idx];

      const cell = document.createElement('div');
      cell.className = 'card-cell';
      cell.style.gridRow = r + 2;
      cell.style.gridColumn = c + 2;

      const card = document.createElement('div');
      card.className = 'card' +
        (data.flipped ? ' flipped' : '') +
        (data.matched ? ' matched' : '');
      card.dataset.index = idx;
      card.addEventListener('click', onCardClick);

      const back  = document.createElement('div');
      back.className = 'card-face card-back';

      const front = document.createElement('div');
      front.className = 'card-face card-front';
      const img = document.createElement('img');
      img.src = data.src;
      img.alt = `Card ${COL_LETTERS[c]}${ROW_NUMBERS[r]}`;
      front.appendChild(img);

      card.appendChild(back);
      card.appendChild(front);
      cell.appendChild(card);
      wrapper.appendChild(cell);
    }
  }
}

function renderScoreboard() {
  document.getElementById('team1-name').textContent  = teamNames[0];
  document.getElementById('team2-name').textContent  = teamNames[1];
  document.getElementById('team1-score').textContent = scores[0];
  document.getElementById('team2-score').textContent = scores[1];
  document.getElementById('team1-box').classList.toggle('active', currentTeam === 0);
  document.getElementById('team2-box').classList.toggle('active', currentTeam === 1);
  document.getElementById('turn-info').textContent =
    scores[0] + scores[1] < numPairs
      ? `${teamNames[currentTeam]}'s turn`
      : gameOverText();
}

function gameOverText() {
  if (scores[0] > scores[1]) return `${teamNames[0]} wins! 🎉`;
  if (scores[1] > scores[0]) return `${teamNames[1]} wins! 🎉`;
  return "It's a tie!";
}

// ── Card click ────────────────────────────────────────────
function onCardClick(e) {
  if (locked) return;
  const idx  = +e.currentTarget.dataset.index;
  const data = cards[idx];
  if (data.matched || data.flipped) return;
  if (flipped.length === 2) return;

  data.flipped = true;
  e.currentTarget.classList.add('flipped');
  flipped.push(idx);

  if (flipped.length === 2) {
    locked = true;
    checkMatch();
  }
}

function checkMatch() {
  const [i1, i2] = flipped;
  const c1 = cards[i1];
  const c2 = cards[i2];

  if (c1.pairId === c2.pairId) {
    c1.matched = c2.matched = true;
    scores[currentTeam]++;
    notify(`${teamNames[currentTeam]} found a match! +1`);
    markMatched(i1, i2);
    flipped = [];
    locked  = false;
    renderScoreboard();

    if (scores[0] + scores[1] === numPairs) {
      setTimeout(() => notify(gameOverText(), 4000), 600);
    }
  } else {
    setTimeout(() => {
      unflipCard(i1);
      unflipCard(i2);
      c1.flipped = c2.flipped = false;
      flipped = [];
      currentTeam = 1 - currentTeam;
      locked  = false;
      renderScoreboard();
    }, 1200);
  }
}

function markMatched(i1, i2) {
  [i1, i2].forEach(idx => {
    const el = document.querySelector(`.card[data-index="${idx}"]`);
    if (el) el.classList.add('matched');
  });
}

function unflipCard(idx) {
  const el = document.querySelector(`.card[data-index="${idx}"]`);
  if (el) el.classList.remove('flipped');
}

// ── Notification ──────────────────────────────────────────
let notifTimer = null;
function notify(msg, duration = 2000) {
  const el = document.getElementById('notification');
  el.textContent = msg;
  el.classList.add('show');
  if (notifTimer) clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// ── Team name modal ───────────────────────────────────────
document.getElementById('btn-team-names').addEventListener('click', () => {
  document.getElementById('input-team1').value = teamNames[0];
  document.getElementById('input-team2').value = teamNames[1];
  document.getElementById('modal-overlay').classList.add('open');
});

document.getElementById('modal-save').addEventListener('click', () => {
  teamNames[0] = document.getElementById('input-team1').value.trim() || 'Team 1';
  teamNames[1] = document.getElementById('input-team2').value.trim() || 'Team 2';
  document.getElementById('modal-overlay').classList.remove('open');
  renderScoreboard();
});

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.remove('open');
  }
});

// ── Restart ───────────────────────────────────────────────
document.getElementById('btn-restart').addEventListener('click', () => {
  if (images.length === 0) return;
  initGame();
});

// ── Utility ───────────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
