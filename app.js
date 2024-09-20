const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const pauseScoreDisplay = document.getElementById('pauseScore');
const landingPage = document.querySelector('.landing-page');
const gameContainer = document.querySelector('.game-container');
const highScoreCard = document.getElementById('highScoreCard');
const pauseCard = document.getElementById('pauseCard');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
// const fullscreenButton = document.getElementById('fullscreenButton');
const pauseButton = document.getElementById('pauseButton');
const exitButton = document.getElementById('exitButton');
const mobileControls = document.querySelector('.mobile-controls');
const snakeColorSelect = document.getElementById('snakeColor');
const foodColorSelect = document.getElementById('foodColor');

const gridSize = 20;
let tileCount;
let snake = [{x: 15, y: 15}];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let isPaused = false;
// let isFullScreen = false;
let gameSpeed = 100;
let snakeColor = '#e94560';
let foodColor = '#ff6b6b';

const eatSound = document.getElementById('eatSound');
const hitWallSound = document.getElementById('hitWallSound');
const moveSound = document.getElementById('moveSound');

function playEatSound() {
    eatSound.currentTime = 0;
    eatSound.play();
}

function playHitWallSound() {
    hitWallSound.currentTime = 0;
    hitWallSound.play();
}

function playMoveSound() {
    moveSound.currentTime = 0;
    moveSound.play();
}

function startGame() {
    landingPage.style.display = 'none';
    gameContainer.style.display = 'block';
    if (isMobile()) {
        mobileControls.style.display = 'block';
    }
    resetGame();
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
    if (!isPaused) {
        clearCanvas();
        moveSnake();
        drawSnake();
        drawFood();
        checkCollision();
        updateScore();
    }
}

function clearCanvas() {
    ctx.fillStyle = '#2a2a4e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        playEatSound();
        generateFood();
        increaseSpeed();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? snakeColor : shadeColor(snakeColor, -20);
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        if (index === 0) {
            ctx.fillStyle = 'white';
            ctx.fillRect((segment.x * gridSize) + 3, (segment.y * gridSize) + 3, 4, 4);
            ctx.fillRect((segment.x * gridSize) + 12, (segment.y * gridSize) + 3, 4, 4);
        }
    });
}

function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    ctx.arc((food.x * gridSize) + gridSize/2, (food.y * gridSize) + gridSize/2, gridSize/2 - 2, 0, 2 * Math.PI);
    ctx.fill();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        playHitWallSound();
        gameOver();
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            playHitWallSound();
            gameOver();
        }
    }
}

function gameOver() {
    clearInterval(gameInterval);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

function resetGame() {
    tileCount = canvas.width / gridSize;
    snake = [{x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2)}];
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 100;
    generateFood();
    updateScore();
    gameOverScreen.style.display = 'none';
}

function updateScore() {
    scoreElement.textContent = score;
}

// function toggleFullScreen() {
//     isFullScreen = !isFullScreen;
//     const container = document.querySelector('.container');

//     if (isFullScreen) {
//         if (container.requestFullscreen) {
//             container.requestFullscreen();
//         } else if (container.mozRequestFullScreen) { // Firefox
//             container.mozRequestFullScreen();
//         } else if (container.webkitRequestFullscreen) { // Chrome, Safari and Opera
//             container.webkitRequestFullscreen();
//         } else if (container.msRequestFullscreen) { // IE/Edge
//             container.msRequestFullscreen();
//         }
//         fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
//     } else {
//         if (document.exitFullscreen) {
//             document.exitFullscreen();
//         } else if (document.mozCancelFullScreen) { // Firefox
//             document.mozCancelFullScreen();
//         } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
//             document.webkitExitFullscreen();
//         } else if (document.msExitFullscreen) { // IE/Edge
//             document.msExitFullscreen();
//         }
//         fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
//     }

//     setTimeout(resizeGame, 100);
// }

function resizeGame() {
    const container = document.querySelector('.container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 50; // Subtract header height
    const size = Math.min(containerWidth, containerHeight);
    canvas.width = size;
    canvas.height = size;
    tileCount = Math.floor(size / gridSize);
    generateFood();
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseButton.innerHTML = '<i class="fas fa-play"></i>';
        pauseScoreDisplay.textContent = score;
        pauseCard.style.display = 'block';
    } else {
        pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        pauseCard.style.display = 'none';
    }
}

function exitGame() {
    clearInterval(gameInterval);
    gameContainer.style.display = 'none';
    landingPage.style.display = 'flex';
    mobileControls.style.display = 'none';
    resetGame();
}

function increaseSpeed() {
    if (gameSpeed > 50) {
        gameSpeed -= 2;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            // Left swipe
            if (dx === 0) { dx = -1; dy = 0; playMoveSound(); }
        } else {
            // Right swipe
            if (dx === 0) { dx = 1; dy = 0; playMoveSound(); }
        }
    } else {
        if (yDiff > 0) {
            // Up swipe
            if (dy === 0) { dx = 0; dy = -1; playMoveSound(); }
        } else {
            // Down swipe
            if (dy === 0) { dx = 0; dy = 1; playMoveSound(); }
        }
    }

    xDown = null;
    yDown = null;
}

function shadeColor(color, percent) {
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (isPaused) return;
    switch(e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; playMoveSound(); }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; playMoveSound(); }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; playMoveSound(); }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; playMoveSound(); }
            break;
    }
});

document.getElementById('playButton').addEventListener('click', startGame);
document.getElementById('highScoreButton').addEventListener('click', () => {
    highScoreDisplay.textContent = highScore;
    highScoreCard.style.display = 'block';
});
document.getElementById('closeHighScore').addEventListener('click', () => {
    highScoreCard.style.display = 'none';
});
document.getElementById('playAgainButton').addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
document.getElementById('resumeButton').addEventListener('click', togglePause);
// fullscreenButton.addEventListener('click', toggleFullScreen);
exitButton.addEventListener('click', exitGame);
window.addEventListener('resize', resizeGame);

// Mobile controls
document.getElementById('upButton').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = -1; playMoveSound(); } });
document.getElementById('downButton').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = 1; playMoveSound(); } });
document.getElementById('leftButton').addEventListener('click', () => { if (dx === 0) { dx = -1; dy = 0; playMoveSound(); } });
document.getElementById('rightButton').addEventListener('click', () => { if (dx === 0) { dx = 1; dy = 0; playMoveSound(); } });

// Touch controls
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

// Color customization
snakeColorSelect.addEventListener('change', (e) => {
    snakeColor = e.target.value;
});

foodColorSelect.addEventListener('change', (e) => {
    foodColor = e.target.value;
});

// // Fullscreen change listeners
// document.addEventListener('fullscreenchange', resizeGame);
// document.addEventListener('webkitfullscreenchange', resizeGame);
// document.addEventListener('mozfullscreenchange', resizeGame);
// document.addEventListener('MSFullscreenChange', resizeGame);

// Initialize the game
resizeGame();
generateFood();