/* FunFusion — Minimal frontend-only implementation
   Contains: navigation, quiz, meme viewer, simple chatbot, snake game
*/

// --------- NAVIGATION ----------
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');
function showView(id){
  views.forEach(v => v.id === id ? v.classList.remove('hidden') : v.classList.add('hidden'));
  navBtns.forEach(b => b.dataset.view === id ? b.classList.add('active') : b.classList.remove('active'));
  window.scrollTo(0,0);
}
navBtns.forEach(b => b.addEventListener('click', ()=> showView(b.dataset.view)));
function navigateTo(v){ showView(v); }

// ---------- Username ----------
const usernameInput = document.getElementById('username');
const saveNameBtn = document.getElementById('saveNameBtn');
const savedNameText = document.getElementById('savedNameText');
let USER = localStorage.getItem('funfusion_user') || '';
if(USER) { savedNameText.textContent = `Saved name: ${USER}`; usernameInput.value = USER; }
saveNameBtn.onclick = () => {
  const v = usernameInput.value.trim();
  if(v){ localStorage.setItem('funfusion_user', v); USER = v; savedNameText.textContent = `Saved name: ${v}`;}
}

// ------------- QUIZ ---------------
const quizContainer = document.getElementById('quizContainer');
const startQuizBtn = document.getElementById('startQuizBtn');
const restartQuizBtn = document.getElementById('restartQuizBtn');
const quizResult = document.getElementById('quizResult');

const QUESTIONS = [
  {q:"When your code throws an error, your reaction:", options:["Ignore it","Google furiously","Cry a little","Refactor everything"], a:1},
  {q:"Your ideal break during study is:", options:["15-min memes","Long nap","Deep focus music","Scroll reddit for 2 hours"], a:0},
  {q:"Pick a favorite snack:", options:["Chips","Fruit","Coffee","Instant noodles"], a:3},
  {q:"If someone asks for notes last minute, you:", options:["Share immediately","Say 'later'","Sell them (jk)","Help but complain"], a:3},
  {q:"Your debugging style:", options:["Print statements","Rubber ducking","Panic and restart","Ask a friend"], a:0},
  {q:"Which describes you best:", options:["Chill","Sarcastic","Ambitious","Lost"], a:1},
  {q:"If AI takes over, you will:", options:["Learn it","Panic","Celebrate","Become irrelevant"], a:0}
];

let qIndex = 0, qScore = 0;

function startQuiz(){
  qIndex = 0; qScore = 0; quizResult.classList.add('hidden'); restartQuizBtn.classList.add('hidden');
  renderQuestion();
}
function renderQuestion(){
  const q = QUESTIONS[qIndex];
  quizContainer.innerHTML = `
    <div>
      <h3>Q${qIndex+1}. ${q.q}</h3>
      <div id="opts"></div>
    </div>
  `;
  const opts = document.getElementById('opts');
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.style.margin = "6px";
    btn.onclick = ()=> { handleAnswer(i); };
    opts.appendChild(btn);
  });
}
function handleAnswer(choice){
  const correct = QUESTIONS[qIndex].a;
  if(choice === correct) qScore++;
  qIndex++;
  if(qIndex >= QUESTIONS.length){
    finishQuiz();
  } else renderQuestion();
}
function finishQuiz(){
  const name = USER || "Student";
  let tone = "";
  if(qScore <= 2) tone = `${name}, you're on the 'confused & charming' package — maybe more memes, less panic.`;
  else if(qScore <= 4) tone = `${name}, solid effort. You’re the kind of person who knows *just enough* to look confident.`;
  else tone = `${name}, wow — debugging wizard level unlocked! Teach the class, take pizza.`;
  quizResult.textContent = `Score: ${qScore}/${QUESTIONS.length} — ${tone}`;
  quizResult.classList.remove('hidden');
  restartQuizBtn.classList.remove('hidden');
  // store result
  const hist = JSON.parse(localStorage.getItem('funfusion_quiz_history')||'[]');
  hist.push({name, score:qScore, date:new Date().toISOString()});
  localStorage.setItem('funfusion_quiz_history', JSON.stringify(hist));
}
startQuizBtn.addEventListener('click', startQuiz);
restartQuizBtn.addEventListener('click', startQuiz);

// ------------- MEME VIEWER --------------
const memeImg = document.getElementById('memeImg');
const memeTitle = document.getElementById('memeTitle');
const nextMemeBtn = document.getElementById('nextMemeBtn');
const downloadMemeBtn = document.getElementById('downloadMemeBtn');

let currentMeme = null;
async function fetchMeme(){
  memeTitle.textContent = 'Loading...';
  memeImg.classList.add('hidden');
  try {
    const res = await fetch('https://meme-api.com/gimme');
    const data = await res.json();
    // check data.url
    currentMeme = data;
    memeImg.src = data.url;
    memeImg.onload = ()=> memeImg.classList.remove('hidden');
    memeTitle.textContent = `${data.title} — from /r/${data.subreddit}`;
  } catch(e){
    memeTitle.textContent = 'Failed to load meme. Try again.';
    console.error(e);
  }
}
nextMemeBtn.addEventListener('click', fetchMeme);
downloadMemeBtn.addEventListener('click', ()=> {
  if(currentMeme && currentMeme.url) window.open(currentMeme.url, '_blank');
});

// ------------- CHATBOT (rule-based) ------------
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');

function botReply(text){
  const t = text.toLowerCase();
  if(/hello|hi|hey/.test(t)) return "Hello human 👋. I have limited patience and unlimited sarcasm.";
  if(/how are you/.test(t)) return "I am a funbot — programmed to be frivolous and mildly sassy.";
  if(/meme|funny/.test(t)) return "You should check the Meme Viewer — I handpicked some spicy ones. 👉 Memes tab.";
  if(/joke/.test(t)) return "Why did the programmer quit his job? Because he didn't get arrays. 😅";
  if(/study|exam|project/.test(t)) return "Take a 5-min meme break, then study. Trust me (I don't actually study).";
  if(/name/.test(t)) return `You can set your name on Home — current: ${USER || 'Not set'}`;
  // fallback
  const fallbacks = [
    "Interesting. Tell me more (or don't).",
    "I may be sarcastic, but I'm here for you.",
    "That sounds like trouble. Want a meme?"
  ];
  return fallbacks[Math.floor(Math.random()*fallbacks.length)];
}
function appendMessage(text, who='bot'){
  const d = document.createElement('div');
  d.className = 'chat-msg ' + (who === 'bot' ? 'msg-bot' : 'msg-user');
  d.textContent = text;
  chatWindow.appendChild(d);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
sendChatBtn.addEventListener('click', ()=> {
  const txt = chatInput.value.trim();
  if(!txt) return;
  appendMessage(txt, 'user');
  chatInput.value = '';
  setTimeout(()=> appendMessage(botReply(txt), 'bot'), 500 + Math.random()*600);
});
chatInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') sendChatBtn.click(); });

// ------------- SNAKE GAME -------------
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const startGameBtn = document.getElementById('startGameBtn');

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;

let snake, food, dir, gameInterval, score, highscore;

function resetGame(){
  snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
  dir = {x:1,y:0};
  placeFood();
  score = 0;
  highscore = parseInt(localStorage.getItem('funfusion_highscore')||'0');
  scoreEl.textContent = score;
  highscoreEl.textContent = highscore;
  draw();
}
function placeFood(){
  food = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
  // ensure not on snake
  if(snake.some(s=> s.x===food.x && s.y===food.y)) placeFood();
}
function draw(){
  ctx.fillStyle = '#071426';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // food
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(food.x*CELL, food.y*CELL, CELL, CELL);
  // snake
  ctx.fillStyle = '#66ff99';
  snake.forEach((s,i)=> {
    ctx.fillRect(s.x*CELL, s.y*CELL, CELL-2, CELL-2);
  });
}
function step(){
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  // wall collision -> wrap-around (easier)
  if(head.x < 0) head.x = COLS-1;
  if(head.x >= COLS) head.x = 0;
  if(head.y < 0) head.y = ROWS-1;
  if(head.y >= ROWS) head.y = 0;
  // self collision?
  if(snake.some(s => s.x === head.x && s.y === head.y)){
    gameOver();
    return;
  }
  snake.unshift(head);
  if(head.x === food.x && head.y === food.y){
    score += 10;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}
function gameOver(){
  clearInterval(gameInterval);
  appendMessage("Game Over. Press Space or Start to play again.", 'bot');
  // update highscore
  if(score > highscore){
    localStorage.setItem('funfusion_highscore', score);
    highscore = score;
    highscoreEl.textContent = highscore;
    appendMessage(`New highscore: ${score}! Saved.`, 'bot');
  }
}
function startGame(){
  resetGame();
  clearInterval(gameInterval);
  gameInterval = setInterval(step, 120);
}
document.addEventListener('keydown', e=>{
  if(e.key === 'ArrowUp' && dir.y === 0){ dir = {x:0,y:-1}; }
  if(e.key === 'ArrowDown' && dir.y === 0){ dir = {x:0,y:1}; }
  if(e.key === 'ArrowLeft' && dir.x === 0){ dir = {x:-1,y:0}; }
  if(e.key === 'ArrowRight' && dir.x === 0){ dir = {x:1,y:0}; }
  if(e.code === 'Space'){ startGame(); }
});
startGameBtn.addEventListener('click', startGame);

// ---------- Initialize ----------
(function init(){
  showView('home');
  // preload a meme
  fetchMeme();
  // snake highscore
  highscoreEl.textContent = localStorage.getItem('funfusion_highscore') || 0;
})();
