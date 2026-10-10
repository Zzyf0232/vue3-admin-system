// ========== 游戏配置 ==========
const GRID_SIZE = 20;
const GRID_COUNT = 20;
const CANVAS_SIZE = GRID_SIZE * GRID_COUNT;
const INITIAL_SPEED = 150;
const SPEED_STEP = 10;
const MIN_SPEED = 50;

// ========== 游戏状态 ==========
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
let gameSpeed = INITIAL_SPEED;
let level = 1;
let gameTimer = null;
let isPlaying = false;
let isPaused = false;

// ========== 初始化 ==========
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  document.getElementById('highScore').textContent = highScore;
  document.addEventListener('keydown', handleKeyDown);
  document.getElementById('startBtn').addEventListener('click', startGame);
  document.querySelectorAll('.dir-btn').forEach(btn => {
    btn.addEventListener('touchstart', e => { e.preventDefault(); changeDirection(btn.dataset.dir); });
    btn.addEventListener('click', () => changeDirection(btn.dataset.dir));
  });
  drawIdle();
});

function handleKeyDown(e) {
  const key = e.key.toLowerCase();
  if (e.key === ' ') { e.preventDefault(); if (isPlaying) togglePause(); return; }
  const keyMap = { 'arrowup':'up','w':'up','arrowdown':'down','s':'down','arrowleft':'left','a':'left','arrowright':'right','d':'right' };
  const dir = keyMap[key];
  if (dir) { e.preventDefault(); if (!isPlaying && !isPaused) { startGame(); } changeDirection(dir); }
}

function changeDirection(dir) {
  const opposite = { up:'down', down:'up', left:'right', right:'left' };
  if (dir !== opposite[direction]) { nextDirection = dir; }
}

function startGame() {
  snake = [{x:8,y:10},{x:7,y:10},{x:6,y:10}];
  direction = 'right'; nextDirection = 'right';
  score = 0; gameSpeed = INITIAL_SPEED; level = 1;
  isPlaying = true; isPaused = false;
  updateScore(); spawnFood();
  document.getElementById('overlay').classList.add('hidden');
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(gameLoop, gameSpeed);
}

function togglePause() {
  isPaused = !isPaused;
  const overlay = document.getElementById('overlay');
  if (isPaused) {
    document.getElementById('overlayTitle').textContent = '游戏暂停';
    document.getElementById('overlayText').textContent = '按空格键继续游戏';
    document.getElementById('startBtn').textContent = '继续游戏';
    overlay.classList.remove('hidden');
    if (gameTimer) clearInterval(gameTimer);
  } else {
    overlay.classList.add('hidden');
    gameTimer = setInterval(gameLoop, gameSpeed);
  }
}

function gameLoop() {
  if (isPaused) return;
  direction = nextDirection;
  const head = { ...snake[0] };
  switch (direction) {
    case 'up': head.y--; break;
    case 'down': head.y++; break;
    case 'left': head.x--; break;
    case 'right': head.x++; break;
  }
  if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) { gameOver(); return; }
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) { gameOver(); return; }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10; updateScore(); spawnFood();
    if (score % 50 === 0 && score > 0) { levelUp(); }
  } else { snake.pop(); }
  draw();
}

function levelUp() {
  level++;
  gameSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (level - 1) * SPEED_STEP);
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(gameLoop, gameSpeed);
  document.getElementById('level').textContent = level;
}

function spawnFood() {
  let valid = false;
  while (!valid) {
    food = { x: Math.floor(Math.random() * GRID_COUNT), y: Math.floor(Math.random() * GRID_COUNT) };
    valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
  }
}

function gameOver() {
  isPlaying = false;
  if (gameTimer) clearInterval(gameTimer);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    document.getElementById('highScore').textContent = highScore;
  }
  document.getElementById('overlayTitle').textContent = '游戏结束';
  document.getElementById('overlayText').textContent = `本局得分：${score}  |  最高分：${highScore}`;
  document.getElementById('startBtn').textContent = '再玩一次';
  document.getElementById('overlay').classList.remove('hidden');
}

function updateScore() { document.getElementById('score').textContent = score; }

function draw() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_COUNT; i++) {
    ctx.beginPath(); ctx.moveTo(i*GRID_SIZE,0); ctx.lineTo(i*GRID_SIZE,CANVAS_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*GRID_SIZE); ctx.lineTo(CANVAS_SIZE,i*GRID_SIZE); ctx.stroke();
  }
  drawFood(); drawSnake();
}

function drawFood() {
  const px = food.x * GRID_SIZE, py = food.y * GRID_SIZE;
  const cx = px + GRID_SIZE/2, cy = py + GRID_SIZE/2;
  const radius = GRID_SIZE/2 - 2;
  ctx.shadowColor = '#e74c3c'; ctx.shadowBlur = 15;
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.arc(cx-3, cy-3, radius/3, 0, Math.PI*2); ctx.fill();
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    const px = seg.x * GRID_SIZE, py = seg.y * GRID_SIZE;
    if (i === 0) {
      ctx.shadowColor = '#4ecca3'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#4ecca3';
      roundRect(ctx, px+1, py+1, GRID_SIZE-2, GRID_SIZE-2, 6); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1a1a2e';
      let eye1, eye2;
      switch (direction) {
        case 'right': eye1={x:px+13,y:py+5}; eye2={x:px+13,y:py+12}; break;
        case 'left': eye1={x:px+4,y:py+5}; eye2={x:px+4,y:py+12}; break;
        case 'up': eye1={x:px+4,y:py+4}; eye2={x:px+13,y:py+4}; break;
        case 'down': eye1={x:px+4,y:py+13}; eye2={x:px+13,y:py+13}; break;
      }
      ctx.beginPath(); ctx.arc(eye1.x,eye1.y,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(eye2.x,eye2.y,3,0,Math.PI*2); ctx.fill();
    } else {
      const alpha = 1 - (i/snake.length)*0.5;
      ctx.fillStyle = `rgba(78,204,163,${alpha})`;
      roundRect(ctx, px+1, py+1, GRID_SIZE-2, GRID_SIZE-2, 4); ctx.fill();
    }
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x+radius, y);
  ctx.arcTo(x+width, y, x+width, y+height, radius);
  ctx.arcTo(x+width, y+height, x, y+height, radius);
  ctx.arcTo(x, y+height, x, y, radius);
  ctx.arcTo(x, y, x+width, y, radius);
  ctx.closePath();
}

function drawIdle() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_COUNT; i++) {
    ctx.beginPath(); ctx.moveTo(i*GRID_SIZE,0); ctx.lineTo(i*GRID_SIZE,CANVAS_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*GRID_SIZE); ctx.lineTo(CANVAS_SIZE,i*GRID_SIZE); ctx.stroke();
  }
  const idleSnake = [{x:8,y:10},{x:7,y:10},{x:6,y:10}];
  for (const seg of idleSnake) {
    const px = seg.x*GRID_SIZE, py = seg.y*GRID_SIZE;
    ctx.fillStyle = 'rgba(78,204,163,0.3)';
    roundRect(ctx, px+1, py+1, GRID_SIZE-2, GRID_SIZE-2, 4); ctx.fill();
  }
  ctx.fillStyle = 'rgba(231,76,60,0.3)';
  ctx.beginPath();
  ctx.arc(14*GRID_SIZE+GRID_SIZE/2, 10*GRID_SIZE+GRID_SIZE/2, GRID_SIZE/2-2, 0, Math.PI*2);
  ctx.fill();
}
