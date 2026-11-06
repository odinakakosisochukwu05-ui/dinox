const dino = document.getElementById('dino');
const gameArea = document.querySelector('.game-area');
const scoreDisplay = document.getElementById('score');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart');
const jumpSound = document.getElementById('jumpSound');
const gameOverSound = document.getElementById('gameOverSound');
const backgroundSound = document.getElementById('backgroundSound');
const buttonClickSound = document.getElementById('buttonClickSound');
const highScoreDisplay = document.getElementById('highScore');
const cactusScoreDisplay = document.getElementById('cactusScore');
const pauseBtn = document.getElementById('pause');
const jumpBtn = document.getElementById('jumpBtn');

let score = 0;
let cactusScore = 0;
let highScore = Number(localStorage.getItem('dinoHighScore')) || 0;

let gameRunning = true;
let isPaused = false;
let pausedAt = 0;
let obstacles = [];
let lastSpawn = 0;
let animationId;

let startTime = 0;
let timerInterval;
let cactusSpeed = 5;

const initialSpeed = 10;
const maximumSpeed = 30;

highScoreDisplay.textContent = highScore;;

// DINO JUMP

function jump() {
if (!gameRunning || isPaused || dino.classList.contains('jump')) {
        return;
    }
    jumpSound.currentTime = 0;
    jumpSound.play();
    dino.classList.add('jump');

    setTimeout(function () {
        dino.classList.remove('jump');
    }, 600);

}


// PC KEYBOARD CONTROLS

document.addEventListener('keydown', function(event) {

    if (event.code === 'Space') {

        event.preventDefault();

        if (!gameRunning) {
            restartGame();
            return;
        }

        jump();
    }

});


// MOBILE CONTROLS

gameArea.addEventListener('click', function (event) {

    if (event.target.classList.contains('obstacle')) {
        return;
    }

    jump();

});

// MOBILE JUMPBTN

jumpBtn.addEventListener('click',function(){
    jump();
})


// CREATE CACTUS

function createObstacle() {

    const cactus = document.createElement('div');

    cactus.classList.add('obstacle');
    cactus.textContent = '🌵';

    gameArea.appendChild(cactus);

    obstacles.push({
        element: cactus,
        x: gameArea.clientWidth
    });

}


// GAME OVER

function gameOver() {

    gameRunning = false;
    clearInterval(timerInterval);
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    backgroundSound.pause();
    backgroundSound.currentTime = 0;

    message.textContent = 'GAME OVER! 💥';

    restartBtn.hidden = false;
    pauseBtn.disabled = true;
document.body.classList.add('paused');

}

// TIMER

function startTimer(reset = true) {

    if (reset) {
        startTime = Date.now();
    }

    clearInterval(timerInterval);

    timerInterval = setInterval(function() {

        if (!gameRunning || isPaused) {
            return;
        }

        score = Math.floor((Date.now() - startTime) / 200);

        scoreDisplay.textContent = score;

    }, 200);

}


// HIGH SCORE

function updateHighScore() {

    cactusScore++;

    cactusScoreDisplay.textContent = cactusScore;

    if (cactusScore > highScore) {

        highScore = cactusScore;

        highScoreDisplay.textContent = highScore;

        localStorage.setItem('dinoHighScore', highScore);

    }

}

function updateCactusSpeed() {

    // Get the time the current game has been running
    let elapsedTime = (Date.now() - startTime) / 1000;

    // Repeat the speed cycle every 90 seconds
    let cycleTime = elapsedTime % 90;

    // First 30 seconds: normal speed
    if (cycleTime < 30) {

        cactusSpeed = initialSpeed;

    }

    // Next 30 seconds: gradually increase
    else if (cycleTime < 60) {

        let progress = (cycleTime - 30) / 30;

        cactusSpeed = initialSpeed + (maximumSpeed - initialSpeed) * progress;

    }

    // Last 30 seconds: gradually decrease
    else {

        let progress = (cycleTime - 60) / 30;

        cactusSpeed = maximumSpeed - (maximumSpeed - initialSpeed) * progress;

    }

}

// PAUSE GAME

function pauseGame() {

    if (!gameRunning || isPaused) {
        return;
    }

    isPaused = true;

    pausedAt = Date.now();

    cancelAnimationFrame(animationId);

    clearInterval(timerInterval);

    backgroundSound.pause();

    document.body.classList.add('paused');

    pauseBtn.textContent = 'Play';

}


// RESUME GAME

function resumeGame() {

    if (!gameRunning || !isPaused) {
        return;
    }

    isPaused = false;

    // Adjust game time so the pause doesn't count
    startTime += Date.now() - pausedAt;

    startTimer(false);

    backgroundSound.play();

    document.body.classList.remove('paused');

    pauseBtn.textContent = 'Pause';

    animationId = requestAnimationFrame(gameLoop);

}

// GAME LOOP

function gameLoop(timestamp) {

   if (!gameRunning || isPaused) {
    return;
}

    // CREATE OBSTACLES
    if (timestamp - lastSpawn > 800) {
        createObstacle();
        lastSpawn = timestamp;
    }

    // MOVE OBSTACLES
    obstacles.forEach(function (obstacle) {

        updateCactusSpeed();

        obstacle.x -= cactusSpeed;
        obstacle.element.style.left = obstacle.x + 'px';

        // GET POSITIONS
        const dinoRect = dino.getBoundingClientRect();
        const cactusRect = obstacle.element.getBoundingClientRect();

        // COLLISION DETECTION
        if (
            dinoRect.right - 12 > cactusRect.left + 10 &&
            dinoRect.left + 12 < cactusRect.right - 10 &&
            dinoRect.bottom - 8 > cactusRect.top + 8 &&
            dinoRect.top + 8 < cactusRect.bottom - 8
        ) {
            gameOver();
            return;
        }

        // CHECK IF DINO HAS PASSED CACTUS
        if (!obstacle.scored && cactusRect.right < dinoRect.left) {

            obstacle.scored = true;

            updateHighScore();

        }

        // REMOVE CACTUS AFTER IT LEAVES THE SCREEN
        if (obstacle.x + obstacle.element.offsetWidth < 0) {
            obstacle.element.remove();
        }

    });

    // CLEAN UP REMOVED OBSTACLES
    obstacles = obstacles.filter(function (obstacle) {
        return obstacle.x + obstacle.element.offsetWidth > 0;
    });

    animationId = requestAnimationFrame(gameLoop);

} 


// RESTART GAME

function restartGame() {

    cancelAnimationFrame(animationId);

    obstacles.forEach(function (obstacle) {
        obstacle.element.remove();
    });

    obstacles = [];

    score = 0;

    scoreDisplay.textContent = score;

    cactusScore = 0;

cactusScoreDisplay.textContent = cactusScore;

    message.textContent = 'Press SPACE or tap to jump!';

    restartBtn.hidden = true;

    dino.classList.remove('jump');

    lastSpawn = 0;

    gameRunning = true;

    clearInterval(timerInterval);
    isPaused = false;

pauseBtn.disabled = false;
pauseBtn.textContent = 'Pause';

document.body.classList.remove('paused');
    startTimer();

    animationId = requestAnimationFrame(gameLoop);
    backgroundSound.currentTime = 0;
    backgroundSound.play();

}

restartBtn.addEventListener('click', function() {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play();

    restartGame();
});

pauseBtn.addEventListener('click', function() {

    buttonClickSound.currentTime = 0;
    buttonClickSound.play();

    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }

});


// START GAME

backgroundSound.volume = 0.1;
backgroundSound.play();

startTimer();

animationId = requestAnimationFrame(gameLoop); 
