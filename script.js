const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60;
}
resizeCanvas();

let drawing = false;
let isErasing = false;
let lastX = 0, lastY = 0;

let history = [];
let redoStack = [];
const MAX_HISTORY = 30;

function saveState() {
  if (history.length >= MAX_HISTORY) history.shift();
  history.push(canvas.toDataURL());
  redoStack = [];
  updateButtons();
}

function restoreState(dataURL, callback) {
  const img = new Image();
  img.src = dataURL;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    if (callback) callback();
  };
}

function updateButtons() {
  undoBtn.disabled = history.length <= 1;
  redoBtn.disabled = redoStack.length === 0;
}

undoBtn.addEventListener('click', () => {
  if (history.length <= 1) return;
  redoStack.push(history.pop());
  restoreState(history[history.length - 1], updateButtons);
});

redoBtn.addEventListener('click', () => {
  if (redoStack.length === 0) return;
  const next = redoStack.pop();
  history.push(next);
  restoreState(next, updateButtons);
});

function drawLine(x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = isErasing ? '#ffffff' : colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.stroke();
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  drawLine(lastX, lastY, e.offsetX, e.offsetY);
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mouseup', () => {
  if (drawing) saveState();
  drawing = false;
});

canvas.addEventListener('mouseout', () => {
  if (drawing) saveState();
  drawing = false;
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  drawing = true;
  lastX = touch.clientX - rect.left;
  lastY = touch.clientY - rect.top;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  drawLine(lastX, lastY, x, y);
  lastX = x;
  lastY = y;
});

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  if (drawing) saveState();
  drawing = false;
});

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveState();
});

saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'sketch.png';
  link.href = canvas.toDataURL();
  link.click();
});

eraserBtn.addEventListener('click', () => {
  isErasing = !isErasing;
  eraserBtn.textContent = isErasing ? 'Draw' : 'Eraser';
});

window.addEventListener('resize', () => {
  resizeCanvas();
  history = [];
  redoStack = [];
  saveState();
  updateButtons();
});

saveState();