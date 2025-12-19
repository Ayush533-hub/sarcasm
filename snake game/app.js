// ---------- NAVIGATION ----------
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');

function navigateTo(id){
  views.forEach(v=>v.id===id?v.classList.remove('hidden'):v.classList.add('hidden'));
  navBtns.forEach(b=>b.dataset.view===id?b.classList.add('active'):b.classList.remove('active'));
}

// ---------- SNAKE GAME ----------
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const levelEl = document.getElementById('level');
const startBtn = document.getElementById('startGameBtn');

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;

let snake, food, dir, score, level, speed;
let obstacles=[];
let gameRunning=false;
let lastTime=0;

// 🔊 Sounds
const sounds={
  eat:new Audio('sounds/eat.mp3'),
  gameover:new Audio('sounds/gameover.mp3'),
  levelup:new Audio('sounds/levelup.mp3')
};
function playSound(s){
  sounds[s].currentTime=0;
  sounds[s].play();
}

// 🎮 Reset
function resetGame(){
  snake=[{x:10,y:10}];
  dir={x:1,y:0};
  score=0;
  level=1;
  speed=6;
  scoreEl.textContent=0;
  levelEl.textContent=1;
  highscoreEl.textContent=localStorage.getItem('snake_high')||0;
  generateObstacles();
  placeFood();
}

// 🍎 Food
function placeFood(){
  let valid = false;

  while(!valid){
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };

    // check snake collision
    const onSnake = snake.some(s => s.x === food.x && s.y === food.y);

    // check obstacle collision
    const onObstacle = obstacles.some(o => o.x === food.x && o.y === food.y);

    if(!onSnake && !onObstacle){
      valid = true;
    }
  }
}


// 🧱 Obstacles
function generateObstacles(){
  obstacles=[];
  if(level>=2){
    for(let i=5;i<15;i++) obstacles.push({x:i,y:10});
  }
  if(level>=3){
    for(let i=3;i<17;i++){
      obstacles.push({x:i,y:5});
      obstacles.push({x:i,y:15});
    }
  }
}

// 🎨 Draw
function draw(){
  ctx.fillStyle='#071426';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // food
  ctx.fillStyle='#ffcc00';
  ctx.shadowColor='#ffcc00';
  ctx.shadowBlur=10;
  ctx.beginPath();
  ctx.arc(food.x*CELL+CELL/2,food.y*CELL+CELL/2,7,0,Math.PI*2);
  ctx.fill();
  ctx.shadowBlur=0;

  // obstacles
  ctx.fillStyle='#ff4d4d';
  obstacles.forEach(o=>{
    ctx.fillRect(o.x*CELL,o.y*CELL,CELL,CELL);
  });

  // snake
  snake.forEach((s,i)=>{
    ctx.fillStyle=i===0?'#00ffa2':`rgba(0,255,160,${1-i/snake.length})`;
    ctx.beginPath();
    ctx.roundRect(s.x*CELL+1,s.y*CELL+1,CELL-2,CELL-2,6);
    ctx.fill();
  });
}

// 🚀 Step
function step(){
  const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};

  if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS) return gameOver();
  if(obstacles.some(o=>o.x===head.x&&o.y===head.y)) return gameOver();
  if(snake.some(s=>s.x===head.x&&s.y===head.y)) return gameOver();

  snake.unshift(head);

  if(head.x===food.x&&head.y===food.y){
    score+=10;
    scoreEl.textContent=score;
    playSound('eat');

    if(score%50===0){
      level++;
      speed++;
      levelEl.textContent=level;
      playSound('levelup');
      generateObstacles();
    }
    placeFood();
  }else{
    snake.pop();
  }
}

// ❌ Game Over
function gameOver(){
  playSound('gameover');
  gameRunning=false;
  if(score>(localStorage.getItem('snake_high')||0)){
    localStorage.setItem('snake_high',score);
  }
  alert('Game Over!');
}

// 🔁 Loop
function loop(time){
  if(!gameRunning) return;
  if(time-lastTime>1000/speed){
    step();
    draw();
    lastTime=time;
  }
  requestAnimationFrame(loop);
}

// 🎮 Controls
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp'&&dir.y===0)dir={x:0,y:-1};
  if(e.key==='ArrowDown'&&dir.y===0)dir={x:0,y:1};
  if(e.key==='ArrowLeft'&&dir.x===0)dir={x:-1,y:0};
  if(e.key==='ArrowRight'&&dir.x===0)dir={x:1,y:0};
});

// ▶️ Start button FIXED
startBtn.onclick=()=>{
  if(gameRunning) return;
  gameRunning=true;
  resetGame();
  lastTime=0;
  requestAnimationFrame(loop);
};
