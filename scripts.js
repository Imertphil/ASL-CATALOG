// constant
const HAND_CONNECTIONS = [
  // thumb
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  // index finger
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  // middle finger
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  // ring finger
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  // pinky finger
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  // palm knucle lines
  [5, 9],
  [9, 13],
  [13, 17],
];

// anime variables
let animGesture = null;
let animFrameIdx = 0;
let animPlaying = true;
let animTimerID = null;
let overlayEl = null;
let animBbox = null;

// dictionary
const elGestureList = document.getElementById("gesture-list");
const elEmptyState = document.getElementById("empty-state");
const elSearchInput = document.getElementById("search-input");
const elFilterCat = document.getElementById("filter-category");
const elSortSelect = document.getElementById("sort-select");

// reset
const elResetDataButton = document.getElementById("reset");

// detail page
const elDetailPanel = document.getElementById("detail-panel");
const elDetailWord = document.getElementById("detail-word");
const elDetailMeaning = document.getElementById("detail-meaning");
const elDetailMetaRow = document.getElementById("detail-meta-row");
const elDetailCanvas = document.getElementById("detail-canvas");
const elDetailFrame = document.getElementById("detail-frame-label");
const elDetailDesc = document.getElementById("detail-desc");
const elDetailClose = document.getElementById("detail-close");
const elAnimPlayPause = document.getElementById("anim-play-pause");
const elAnimSpeed = document.getElementById("anim-speed");
const elAnimTrail = document.getElementById("anim-trail");
const elTrailMaxLabel = document.getElementById("trail-max-label");

// canvas 2d
const detailCtx = elDetailCanvas.getContext("2d");

// keys
const LS_DELETE_IDS = "deleted-asl-signs";

import { GESTURE_DATA } from "./data/gestures.js";

// get all gesture
function getVisibleGestures() {
  const deletedIDs = JSON.parse(localStorage.getItem(LS_DELETE_IDS) || "[]");
  const gestures = GESTURE_DATA.filter((g) => !deletedIDs.includes(g.id));
  return [...gestures];
}

/**
 *
 * @param {Object} gesture
 */
// soft delete hardcoded gestures
function softDelete(gesture) {
  // confirm
  if (!confirm(`Delete ${gesture.word}`)) return;

  const deletedIDs = JSON.parse(localStorage.getItem(LS_DELETE_IDS) || "[]");
  if (!deletedIDs.includes(gesture.id)) {
    deletedIDs.push(gesture.id);
    localStorage.setItem(LS_DELETE_IDS, JSON.stringify(deletedIDs));
  }

  renderDictionary();
  populatedCategoryFilter();
}

/**
 *
 * @param {Object} gesture
 * @returns {HTMLElement}
 */
// create gesture card
function createGestureCard(gesture) {
  const card = document.createElement("div");
  card.className = "gesture-card";
  // card id
  card.dataset.gestureID = gesture.id;

  // upper part (word & delete buttion)
  const top = document.createElement("div");
  top.className = "gesture-card-top";

  const wordEl = document.createElement("div");
  wordEl.className = "gesture-card-word";
  wordEl.textContent = gesture.word;

  const delBtn = document.createElement("button");
  delBtn.className = "btn-danger";
  delBtn.textContent = "X";
  delBtn.style.cssText = "padding:2px 8px;font-size:10px;flex-shrink:0";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    softDelete(gesture);
  });

  top.appendChild(wordEl);
  top.appendChild(delBtn);

  // tag part
  const tags = document.createElement("div");
  tags.className = "gesture-card-tags";

  // category
  const cat = document.createElement("span");
  cat.className = "gesture-card-badge";
  cat.textContent = (gesture.category || "Uncategorized").toUpperCase();
  tags.appendChild(cat);

  // frame count
  if (gesture.keyframes?.length) {
    const frameNum = document.createElement("span");
    frameNum.className = "gesture-card-badge";
    frameNum.textContent = `${gesture.keyframes.length} FRAMES`;
    tags.appendChild(frameNum);
  } else {
    tags.appendChild(document.createElement("span"));
  }

  // was going to do user created gestures, but rn everthing is hardcoded
  tags.appendChild(document.createElement("span"));

  card.appendChild(top);
  card.appendChild(tags);

  // jump to detail page
  card.addEventListener("click", () => openDetail(gesture));

  return card;
}

// populate category
function populatedCategoryFilter() {
  const gestures = getVisibleGestures();
  const cat = new Set(gestures.map((g) => g.category).filter(Boolean));
  while (elFilterCat.options.length > 1) elFilterCat.remove(1);

  cat.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c.toUpperCase();
    elFilterCat.appendChild(opt);
  });
}

// render dictionary
function renderDictionary() {
  let gestures = getVisibleGestures();

  // search
  const query = elSearchInput.value.trim().toLowerCase();
  if (query) {
    gestures = gestures.filter(
      (g) =>
        g.word.toLowerCase().includes(query) ||
        (g.meaning && g.meaning.toLowerCase().includes(query)),
    );
  }

  // filter by category
  const cat = elFilterCat.value;
  if (cat) {
    gestures = gestures.filter((g) => g.category === cat);
  }

  // sort
  gestures = [...gestures];

  const sortMode = elSortSelect.value;
  if (sortMode === "alpha-asc") {
    gestures = gestures.sort((a, b) => a.word.localeCompare(b.word));
  } else if (sortMode === "alpha-desc") {
    gestures = gestures.sort((a, b) => b.word.localeCompare(a.word));
  } else if (sortMode === "date-new") {
    gestures = gestures.sort(
      (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
    );
  } else if (sortMode === "frames-high") {
    gestures = gestures.sort(
      (a, b) => (b.keyframes?.length || 0) - (a.keyframes?.length || 0),
    );
  }

  // if empty
  if (gestures.length === 0) {
    elEmptyState.classList.remove("hidden");
    elGestureList.innerHTML = "";
    return;
  }
  elEmptyState.classList.add("hidden");

  // render
  elGestureList.innerHTML = "";
  gestures.forEach((g) => elGestureList.appendChild(createGestureCard(g)));
}

elFilterCat.addEventListener("change", renderDictionary);
elSearchInput.addEventListener("input", renderDictionary);
elSortSelect.addEventListener("change", renderDictionary);

renderDictionary();
populatedCategoryFilter();

// reset data (recover deleted gestures)
function resetData() {
  if (!confirm("Reset all deleted gestures?")) return;
  localStorage.removeItem(LS_DELETE_IDS);
  renderDictionary();
}

elResetDataButton.addEventListener("click", () => resetData());

// detail page

/**  *
 * the global bounding box for signs that move hands around without changing the gesture
 * @param {Object} gesture
 * @return {{minX, maxX, minY, maxY} | null}
 */
function globalBoundingBox(gesture) {
  const xs = [];
  const ys = [];
  gesture.keyframes.forEach((kf) => {
    [kf.leftHand, kf.rightHand].forEach((hand) => {
      if (!hand) return;
      hand.forEach((pt) => {
        xs.push(pt.x);
        ys.push(pt.y);
      });
    });
  });

  if (xs.length === 0) return null;

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/**
 *
 * @param {Object} gesture
 */
function openDetail(gesture) {
  animGesture = gesture;
  animFrameIdx = 0;
  animPlaying = true;
  animBbox = globalBoundingBox(gesture);

  // title row
  elDetailWord.textContent = gesture.word;
  elDetailMeaning.textContent = gesture.meaning || "";
  elDetailDesc.textContent = gesture.description || "";

  // tags
  elDetailMetaRow.innerHTML = "";
  [
    gesture.category,
    gesture.difficulty,
    gesture.numHands === 2 ? "TWO-HANDED" : "ONE-HANDED",
  ]
    .filter(Boolean)
    .forEach((tag) => {
      const t = document.createElement("span");
      t.className = "gesture-card-badge";
      t.textContent = tag.toUpperCase();
      elDetailMetaRow.appendChild(t);
    });

  // trail
  const maxTrail = gesture.keyframes?.length || 0;
  elAnimTrail.max = maxTrail;
  elAnimTrail.value = 0;
  elTrailMaxLabel.textContent = `max: ${maxTrail}`;

  // panel slides in
  elDetailPanel.classList.remove("hidden");

  requestAnimationFrame(() => {
    elDetailPanel.classList.add("open");
    elDetailCanvas.width = elDetailCanvas.clientWidth;
    elDetailCanvas.height = elDetailCanvas.clientHeight;
    startAnimation();
  });

  // grey left area
  if (!overlayEl) {
    overlayEl = document.createElement("div");
    overlayEl.className = "detail-open-overlay";
    overlayEl.addEventListener("click", closeDetailPanel);
    document.body.appendChild(overlayEl);
  }

  elAnimPlayPause.textContent = "⏸ PAUSE";
}

function closeDetailPanel() {
  stopAnimation();
  elDetailPanel.classList.remove("open");
  // hide the panel after transition, also make it a one time listener
  elDetailPanel.addEventListener(
    "transitionend",
    () => {
      elDetailPanel.classList.add("hidden");
    },
    { once: true },
  );

  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }

  animGesture = null;
  animBbox = null;
}

elDetailClose.addEventListener("click", closeDetailPanel);

// canvas animation
function startAnimation() {
  stopAnimation();

  // if no data
  if (!animGesture?.keyframes?.length) {
    detailCtx.clearRect(0, 0, elDetailCanvas.width, elDetailCanvas.height);
    detailCtx.fillStyle = "#888";
    detailCtx.font = "11px IBM Plex Mono";
    detailCtx.fillText("No landmark data", 20, elDetailCanvas.height / 2);
    elDetailFrame.textContent = "NO DATA";
    return;
  }

  const intervalMs = Math.round(1000 / getAnimFps());

  animTimerID = setInterval(() => {
    if (!animPlaying) return;
    drawFrame(animFrameIdx);
    animFrameIdx = (animFrameIdx + 1) % animGesture.keyframes.length;
    elDetailFrame.textContent = `FRAME ${animFrameIdx + 1} / ${animGesture.keyframes.length}`;
  }, intervalMs);
}

function stopAnimation() {
  if (animTimerID !== null) {
    clearInterval(animTimerID);
    animTimerID = null;
  }
}

// get speed
function getAnimFps() {
  const sliderVal = parseInt(elAnimSpeed.value);
  const minFps = 1;
  const maxFps = 8 * 2;
  return minFps + ((sliderVal - 1) / 9) * (maxFps - minFps);
}

// pause/play
elAnimPlayPause.addEventListener("click", () => {
  animPlaying = !animPlaying;
  elAnimPlayPause.textContent = animPlaying ? "⏸ PAUSE" : "▶ PLAY";
});

// changing speed
elAnimSpeed.addEventListener("input", () => {
  if (animGesture) startAnimation();
});

// trail
elAnimTrail.addEventListener("input", () => {
  const max = parseInt(elAnimTrail.max) || 0;
  const val = parseInt(elAnimTrail.value) || 0;
  if (val < 0) {
    elAnimTrail.value = 0;
  }
  if (val > max) {
    elAnimTrail.value = max;
  }
});

// make a function that converts landmark coordinates to canvas pixel coordinates in a global bounding box
function makeConverter(bbox, W, H) {
  const PAD = 0.1;

  const rangeX = bbox.maxX - bbox.minX || 0.1;
  const rangeY = bbox.maxY - bbox.minY || 0.1;

  return function converter(pt) {
    const nx = (pt.x - bbox.minX) / rangeX;
    const ny = (pt.y - bbox.minY) / rangeY;

    return {
      px: PAD * W + nx * W * (1 - 2 * PAD),
      py: PAD * W + ny * W * (1 - 2 * PAD),
      pz: pt.z,
    };
  };
}

// draw one hand, left hand is a bit lighter
function drawHand(landmarks, masterAlpha, converter, isLeft) {
  const baseLightness = isLeft ? 0.3 : 0.0;

  HAND_CONNECTIONS.forEach(([a, b]) => {
    const p1 = converter(landmarks[a]);
    const p2 = converter(landmarks[b]);
    // avg depth
    const avgZ = (landmarks[a].z + landmarks[b].z) / 2;

    const L = Math.max(0, Math.min(0.8, baseLightness + (avgZ + 0.1) * 3));
    const color = `hsl(0, 0%, ${Math.round(L * 100)}%)`;

    detailCtx.beginPath();
    detailCtx.moveTo(p1.px, p1.py);
    detailCtx.lineTo(p2.px, p2.py);
    detailCtx.strokeStyle = color;
    detailCtx.lineWidth = 1.5;
    detailCtx.globalAlpha = masterAlpha * (0.55 + (1 - L) * 0.45);

    detailCtx.stroke();
  });

  landmarks.forEach((pt, idx) => {
    const { px, py, pz } = converter(pt);

    // closer = larger
    const size = Math.max(2, Math.min(8, 3.5 + -pz * 25));
    const L = Math.max(0, Math.min(0.8, baseLightness + (pz + 0.1) * 3));
    const color = `hsl(0, 0%, ${Math.round(L * 100)}%)`;

    detailCtx.beginPath();
    detailCtx.arc(px, py, size, 0, Math.PI * 2);
    detailCtx.fillStyle = color;
    detailCtx.globalAlpha = masterAlpha;
    detailCtx.fill();
  });

  detailCtx.globalAlpha = 1;
}

// draw a frame
function drawFrame(frameIdx) {
  const W = elDetailCanvas.width;
  const H = elDetailCanvas.height;

  detailCtx.clearRect(0, 0, W, H);

  if (!animBbox) return;

  const converter = makeConverter(animBbox, W, H);
  const total = animGesture.keyframes.length;

  // trail
  const trailLength = Math.min(
    Math.max(0, parseInt(elAnimTrail.value) || 0),
    total,
  );

  for (let t = trailLength; t >= 1; t--) {
    // loop
    const trailIdx = (frameIdx - t + total) % total;
    const trailKf = animGesture.keyframes[trailIdx];

    // older trails ligher
    const alpha = 0.06 + ((trailLength - t) / Math.max(trailLength, 1)) * 0.22;

    if (trailKf.rightHand) {
      drawHand(trailKf.rightHand, alpha, converter, false);
    }
    if (trailKf.leftHand) {
      drawHand(trailKf.leftHand, alpha, converter, true);
    }
  }
  // current frame
  const kf = animGesture.keyframes[frameIdx];
  if (!kf) return;

  if (kf.rightHand) {
    drawHand(kf.rightHand, 1.0, converter, false);
  }
  if (kf.leftHand) {
    drawHand(kf.leftHand, 1.0, converter, true);
  }
}
