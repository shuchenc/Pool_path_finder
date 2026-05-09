let canvas;

// Drawing element collections
const balls       = [], balls2      = [];
const points      = [], points2     = [];
const lines       = [], lines2      = [];
const corBalls    = [], corBalls2   = [];
const corLines    = [], corLines2   = [];

const allElems = [balls, balls2, points, points2, lines, lines2, corBalls, corBalls2, corLines, corLines2];

// Interaction state
let mode = 0;                        // 0=free 1=anchor 2=corres-points 3=corres-lines
let lineClicks  = [[], []];
let lineClicks2 = [[], []];
let clicked     = false;
let hComputed   = false;

const CORNER_LABELS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];

// Homography matrices (numeric.js plain arrays)
let A    = numeric.rep([8, 9], 0);
let H    = numeric.rep([3, 3], 1);
let invH = numeric.rep([3, 3], 1);

// --- p5.js lifecycle ---

function setup() {
    canvas = createCanvas(840, 320);
    background('rgba(200,200,200,0.2)');
    const iframe = document.getElementById('existing-iframe-example');
    const rect = iframe.getBoundingClientRect();
    canvas.position(rect.left + window.scrollX + 4, rect.top + window.scrollY + 4);
    loadImage('images/PoolTableReferenceTop.jpg', img => image(img, 660, 0, 180, 320));
    updateCanvasInteractivity();
}

function draw() {
    for (const group of allElems) {
        for (const elem of group) elem.display();
    }
}

function mousePressed() {
    const oX = mouseX;
    const oY = mouseY;

    if (mode === 1) {
        handleAnchorClick(oX, oY);
    } else if (mode === 2) {
        handleCorresPointClick(oX, oY);
    } else if (mode === 3) {
        handleCorresLineClick(oX, oY);
    }
}

// --- Mode handlers ---

function handleAnchorClick(oX, oY) {
    // Phase 1: collect all 4 video corners first (enforces consistent ordering)
    if (points.length < 4 && inVideoArea(oX, oY)) {
        const p = new Ball(oX, oY, 3, color(points.length * 60));
        points.push(p);
        if (points.length === 2) lines.push(new Line(points[0].x, points[0].y, points[1].x, points[1].y, color(100, 0, 0)));
        if (points.length === 4) lines.push(new Line(points[2].x, points[2].y, points[3].x, points[3].y, color(0, 100, 0)));
    // Phase 2: collect corresponding 4 reference corners in the same order
    } else if (points.length >= 4 && points2.length < 4 && inReferenceArea(oX, oY)) {
        const p = new Ball(oX, oY, 1, color(points2.length * 60));
        points2.push(p);
        if (points2.length === 2) lines2.push(new Line(points2[0].x, points2[0].y, points2[1].x, points2[1].y, color(100, 0, 0)));
        if (points2.length === 4) lines2.push(new Line(points2[2].x, points2[2].y, points2[3].x, points2[3].y, color(0, 100, 0)));
    }
    updateModeUI();
}

function handleCorresPointClick(oX, oY) {
    const col = color(random(0, 255), random(0, 255), random(0, 255), 50);
    if (inVideoArea(oX, oY)) {
        const c2 = applyH(H, oX, oY);
        corBalls.push(new Ball(oX, oY, 3, col));
        corBalls2.push(new Ball(c2[0], c2[1], 4, col));
    } else if (inReferenceArea(oX, oY)) {
        const c1 = applyH(invH, oX, oY);
        corBalls.push(new Ball(c1[0], c1[1], 3, col));
        corBalls2.push(new Ball(oX, oY, 4, col));
    }
}

function handleCorresLineClick(oX, oY) {
    if (inVideoArea(oX, oY)) {
        const mapped = applyH(H, oX, oY);
        if (!clicked) {
            lineClicks[0]  = [oX, oY];
            lineClicks2[0] = mapped;
            clicked = true;
        } else {
            lineClicks[1]  = [oX, oY];
            lineClicks2[1] = mapped;
            clicked = false;
            pushLinePair();
        }
    } else if (inReferenceArea(oX, oY)) {
        const mapped = applyH(invH, oX, oY);
        if (!clicked) {
            lineClicks2[0] = [oX, oY];
            lineClicks[0]  = mapped;
            clicked = true;
        } else {
            lineClicks2[1] = [oX, oY];
            lineClicks[1]  = mapped;
            clicked = false;
            pushLinePair();
        }
    }
    updateHelpText();
}

function pushLinePair() {
    corLines.push(new Line(lineClicks[0][0],  lineClicks[0][1],  lineClicks[1][0],  lineClicks[1][1],  color(0, 200, 0)));
    corLines2.push(new Line(lineClicks2[0][0], lineClicks2[0][1], lineClicks2[1][0], lineClicks2[1][1], color(0, 0, 200)));
}

// --- Homography computation ---

function getH() {
    if (points.length < 4 || points2.length < 4) {
        alert('Not enough points selected!');
        return;
    }
    A = numeric.rep([8, 9], 0);
    for (let r = 0; r < 4; r++) {
        const x = points[r].x, y = points[r].y;
        const xp = points2[r].x, yp = points2[r].y;
        A[2*r]   = [-x, -y, -1,  0,  0,  0, x*xp, y*xp, xp];
        A[2*r+1] = [ 0,  0,  0, -x, -y, -1, x*yp, y*yp, yp];
    }
    const aTrans = numeric.transpose(A);
    const { U: hs } = numeric.svd(aTrans);
    H = [
        [hs[0][7], hs[1][7], hs[2][7]],
        [hs[3][7], hs[4][7], hs[5][7]],
        [hs[6][7], hs[7][7], hs[8][7]],
    ];
    invH = numeric.inv(H);
    hComputed = true;

    // DEBUG — remove before shipping
    console.group('Homography debug');
    console.log('Video points (src):');
    points.forEach((p, i) => console.log(`  [${i}] video  (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`));
    console.log('Reference points (dst):');
    points2.forEach((p, i) => console.log(`  [${i}] ref    (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`));
    console.log('H =', H.map(r => r.map(v => v.toFixed(6))));
    console.log('Reprojection check (src → H → should equal dst):');
    points.forEach((p, i) => {
        const mapped = applyH(H, p.x, p.y);
        const dst = points2[i];
        console.log(`  [${i}] mapped (${mapped[0].toFixed(1)}, ${mapped[1].toFixed(1)})  expected (${dst.x.toFixed(1)}, ${dst.y.toFixed(1)})  err=(${(mapped[0]-dst.x).toFixed(2)}, ${(mapped[1]-dst.y).toFixed(2)})`);
    });
    console.groupEnd();

    updateModeUI();
}

// --- Helpers ---

function applyH(mat, x, y) {
    const v = numeric.dotMMsmall(mat, [[x], [y], [1]]);
    return [v[0][0] / v[2][0], v[1][0] / v[2][0]];
}

function inVideoArea(x, y)     { return x >= 0 && x <= 640 && y >= 0 && y <= 320; }
function inReferenceArea(x, y) { return x >= 660 && x <= 840 && y >= 0 && y <= 320; }

function chooseAnchor()  { points.length = 0; points2.length = 0; hComputed = false; mode = 1; updateModeUI(); }
function corres_points() { mode = 2; updateModeUI(); }
function corres_lines()  { mode = 3; updateModeUI(); }

function clearALL() {
    clear();
    background('rgba(200,200,200,0.2)');
    loadImage('images/PoolTableReferenceTop.jpg', img => image(img, 660, 0, 180, 320));
    for (const group of allElems) group.length = 0;
    clicked = false;
    hComputed = false;
    mode = 0;
    updateModeUI();
}

function updateCanvasInteractivity() {
    if (canvas) canvas.elt.style.pointerEvents = mode === 0 ? 'none' : 'auto';
}

function updateModeUI() {
    const labels = ['Free', 'Select Anchors', 'Corres-points', 'Corres-lines'];
    const label = document.getElementById('mode-label');
    if (label) label.textContent = `Mode: ${labels[mode]}`;

    const badge = document.getElementById('h-badge');
    if (badge) badge.className = hComputed ? 'h-badge' : 'h-badge hidden';

    const modeButtons = [null, 'btn-select-anchor', 'btn-corres-points', 'btn-corres-lines'];
    document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
    if (modeButtons[mode]) document.getElementById(modeButtons[mode])?.classList.add('active');

    updateCanvasInteractivity();
    updateHelpText();
}

function updateHelpText() {
    const el = document.getElementById('help-text');
    if (!el) return;
    el.className = 'help-text';

    if (mode === 0) {
        el.textContent = 'Free mode — click the video to play/pause. Select a mode above to begin.';
    } else if (mode === 1) {
        if (hComputed) {
            el.className = 'help-text success';
            el.textContent = '✓ Homography computed! Switch to Corres-points or Corres-lines to verify the mapping.';
        } else if (points.length < 4) {
            el.textContent = `Step 1 of 2 — Click the ${CORNER_LABELS[points.length]} corner of the pool table on the VIDEO (${points.length}/4 done).`;
        } else if (points2.length < 4) {
            el.textContent = `Step 2 of 2 — Click the ${CORNER_LABELS[points2.length]} corner of the pool table on the REFERENCE image in the same clockwise order (${points2.length}/4 done).`;
        } else {
            el.textContent = 'All 4 anchor pairs selected — click "Get H" to compute the homography.';
        }
    } else if (mode === 2) {
        if (!hComputed) {
            el.className = 'help-text warning';
            el.textContent = '⚠ Homography not computed yet — select anchors first, then click "Get H".';
        } else {
            el.className = 'help-text success';
            el.textContent = '✓ H computed — click any point on the VIDEO or REFERENCE image to see its mapped counterpart.';
        }
    } else if (mode === 3) {
        if (!hComputed) {
            el.className = 'help-text warning';
            el.textContent = '⚠ Homography not computed yet — select anchors first, then click "Get H".';
        } else if (clicked) {
            el.className = 'help-text success';
            el.textContent = '✓ H computed — click the second endpoint to complete the line.';
        } else {
            el.className = 'help-text success';
            el.textContent = '✓ H computed — click a first endpoint on either image to start a line.';
        }
    }
}

function go_get() {
    const raw = document.getElementById('yourtextfield').value.trim();

    const watchMatch = raw.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    const shortMatch = raw.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    const embedMatch = raw.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
    const bareId     = /^[A-Za-z0-9_-]{11}$/.test(raw) ? raw : null;
    const videoId    = (watchMatch || shortMatch || embedMatch || [null, bareId])[1];

    document.getElementById('existing-iframe-example').src = videoId
        ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=1`
        : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(raw)}`;
}

// --- Bootstrap ---

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-form').addEventListener('submit', e => { e.preventDefault(); go_get(); });
    document.getElementById('btn-select-anchor').addEventListener('click', chooseAnchor);
    document.getElementById('btn-get-h').addEventListener('click', getH);
    document.getElementById('btn-corres-points').addEventListener('click', corres_points);
    document.getElementById('btn-corres-lines').addEventListener('click', corres_lines);
    document.getElementById('btn-clear').addEventListener('click', clearALL);
    updateHelpText();
});
