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
const speedSelect = document.getElementById('speedSelect');
const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const startBtn = document.getElementById('startBtn');
const homeBtn = document.getElementById('homeBtn');

let score = 0;
let cactusScore = 0;
let highScore = Number(
    localStorage.getItem('dinoHighScore_' + speedSelect.value)
) || 0;
let gameRunning = false;
let isPaused = false;
let pausedAt = 0;
let obstacles = [];
let lastSpawn = 0;
let nextSpawnTime = 0;
let animationId;
let startTime = 0;
let timerInterval;
let cactusSpeed = 5;
let initialSpeed = 5;
let maximumSpeed = 20;

// DOUBLE JUMP VARIABLES

let dinoY = 35;
let dinoVelocity = 0;
let gravity = 0.55;
let jumpPower = 13;
let jumpCount = 0;
const maximumJumps = 2;

highScoreDisplay.textContent = highScore;;

// GAME SPEED SETTINGS

const speedModes = {

    slow: {
        initial: 3,
        maximum: 30
    },

    normal: {
        initial: 7,
        maximum: 50
    },

    fast: {
        initial: 15,
        maximum: 100
    }

};

// CHANGE GAME SPEED

speedSelect.addEventListener('change', function () {

    const selectedSpeed = speedSelect.value;

    // Change game speed
    initialSpeed = speedModes[selectedSpeed].initial;
    maximumSpeed = speedModes[selectedSpeed].maximum;

    cactusSpeed = initialSpeed;

    // Load high score for selected speed
    highScore = Number(
        localStorage.getItem('dinoHighScore_' + selectedSpeed)
    ) || 0;

    highScoreDisplay.textContent = highScore;

});

// DINO DOUBLE JUMP

function jump() {

    if (!gameRunning || isPaused || jumpCount >= maximumJumps) {
        return;
    }

    jumpCount++;

    // Give the dinosaur upward force
    dinoVelocity = jumpPower;

    jumpSound.currentTime = 0;
    jumpSound.play();

}

// DINO MOVEMENT PHYSICS

function updateDino() {

    dinoY += dinoVelocity;

    dinoVelocity -= gravity;

    // Keep dinosaur above the ground
    if (dinoY <= 35) {

        dinoY = 35;

        dinoVelocity = 0;

        jumpCount = 0;

    }

    dino.style.bottom = dinoY + 'px';

}


// PC KEYBOARD CONTROLS

document.addEventListener('keydown', function (event) {

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

// MOBILE JUMP BUTTON

jumpBtn.addEventListener('pointerdown', function (event) {

    event.preventDefault();

    if (!gameRunning || isPaused) {
        return;
    }

    jump();

});

// CREATE CACTUS

function createObstacle(offset = 0) {
    const cactus = document.createElement('div');

    cactus.classList.add('obstacle');
    cactus.textContent = '🌵';

    gameArea.appendChild(cactus);

    obstacles.push({
        element: cactus,
        x: gameArea.clientWidth + offset,
        scored: false
    });

}

// CREATE RANDOM OBSTACLES
function spawnObstacles(timestamp) {

    if (timestamp >= nextSpawnTime) {

        let cactusCount = 1;

        let elapsedTime = (Date.now() - startTime) / 1000;

        // After 40 seconds, randomly create 1, 2 or 3 cacti
        if (elapsedTime >= 20) {
            cactusCount = Math.floor(Math.random() * 3) + 1;
        }

        // Create the cacti
        for (let i = 0; i < cactusCount; i++) {
            createObstacle(i * 45);
        }

        // Random distance between obstacle groups
        let randomDelay = Math.floor(Math.random() * 1000) + 900;
 
        nextSpawnTime = timestamp + randomDelay;
    }
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

    updateJumpButton();

}

// TIMER

function startTimer(reset = true) {

    if (reset) {
        startTime = Date.now();
    }

    clearInterval(timerInterval);

    timerInterval = setInterval(function () {

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

        // Save high score for current game speed
        localStorage.setItem(
            'dinoHighScore_' + speedSelect.value,
            highScore
        );

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

// CONTROL JUMP BUTTON VISIBILITY

function updateJumpButton() {

    if (gameRunning && !isPaused) {
        jumpBtn.hidden = false;
    } else {
        jumpBtn.hidden = true;
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
    updateJumpButton();

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

    document.body.classList.remove('paused');

    pauseBtn.textContent = 'Pause';

    animationId = requestAnimationFrame(gameLoop);
    updateJumpButton();

}

// GAME LOOP

function gameLoop(timestamp) {

    if (!gameRunning || isPaused) {
        return;
    }

    // CREATE RANDOM OBSTACLES

    spawnObstacles(timestamp);

    // UPDATE DINOSAUR PHYSICS

    updateDino();

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

// START GAME FROM HOMEPAGE

function startGame() {

    homeScreen.hidden = true;
    gameScreen.hidden = false;

    restartGame();

}

// RESTART GAME
backgroundSound.pause();
backgroundSound.currentTime = 0;
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

    // RESET DINOSAUR POSITION

    dinoY = 35;
    dinoVelocity = 0;
    jumpCount = 0;

    dino.style.bottom = '35px';

 lastSpawn = 0;
nextSpawnTime = 0;

    gameRunning = true;

    clearInterval(timerInterval);
    isPaused = false;
    updateJumpButton();

    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';

    document.body.classList.remove('paused');
    startTimer();

    animationId = requestAnimationFrame(gameLoop);
    backgroundSound.currentTime = 0;
    // backgroundSound.play();

}

// EVENT LISTENERS

restartBtn.addEventListener('click', function () {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play();

    restartGame();
});

pauseBtn.addEventListener('click', function () {

    buttonClickSound.currentTime = 0;
    buttonClickSound.play();

    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }

});

startBtn.addEventListener('click', function () {

    buttonClickSound.currentTime = 0;
    buttonClickSound.play();

    startGame();

});

homeBtn.addEventListener('click', function() {

    buttonClickSound.currentTime = 0;
    buttonClickSound.play();

    returnHome();

});

// HOME PAGE BACKGROUND MUSIC

function playHomeMusic() {
    backgroundSound.volume = 0.1;
    backgroundSound.play().catch(function() {
        console.log('Waiting for user interaction to play music.');
    });
}

// START GAME

function startGame() {

    // Stop home page music
    backgroundSound.pause();
    backgroundSound.currentTime = 0;

    homeScreen.hidden = true;
    gameScreen.hidden = false;

    restartGame();

}

// RETURN TO HOME PAGE

function returnHome() {

    // Stop the game
    gameRunning = false;
    isPaused = false;

    cancelAnimationFrame(animationId);
    clearInterval(timerInterval);

    // Remove all obstacles
    obstacles.forEach(function(obstacle) {
        obstacle.element.remove();
    });

    obstacles = [];

    // Reset dinosaur
    dinoY = 35;
    dinoVelocity = 0;
    jumpCount = 0;
    dino.style.bottom = '35px';

    // Reset controls
    pauseBtn.textContent = 'Pause';
    pauseBtn.disabled = false;
    restartBtn.hidden = true;

    document.body.classList.remove('paused');

    updateJumpButton();

    // Show homepage
    gameScreen.hidden = true;
    homeScreen.hidden = false;
    playHomeMusic();
}

// INITIAL GAME SETTINGS

backgroundSound.volume = 1;

gameRunning = false;
isPaused = false;

homeScreen.hidden = false;
gameScreen.hidden = true;

updateJumpButton();

// Play music on homepage
playHomeMusic();
