const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let images = {};
let cowboyLeft, cowboyRight;
let countdownText;
let isGameStarted = false;
let leftShotTime = null;
let rightShotTime = null;
let winnerText;
let playButton;

// Workers
let timerWorker = new Worker('js/workers/timerWorker.js');
let inputWorker = new Worker('js/workers/inputWorker.js');
let scoreWorker = new Worker('js/workers/scoreWorker.js');

let audio = new Audio('assets/sounds/background.mp3');

function preloadImages(sources, callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(sources).length;

    for (const src in sources) {
        images[src] = new Image();
        images[src].src = sources[src];
        images[src].onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
                callback();
            }
        };
    }
}

function start() {
    const sources = {
        logo: 'assets/images/logo.png',
        background: 'assets/images/background.png',
        cowboyLeftPrepared: 'assets/images/cowboy_left/prepared.png',
        cowboyLeftWalking: 'assets/images/cowboy_left/walking.png',
        cowboyLeftShooting: 'assets/images/cowboy_left/shooting.png',
        cowboyLeftLosing: 'assets/images/cowboy_left/losing.png',
        cowboyRightPrepared: 'assets/images/cowboy_right/prepared.png',
        cowboyRightWalking: 'assets/images/cowboy_right/walking.png',
        cowboyRightShooting: 'assets/images/cowboy_right/shooting.png',
        cowboyRightLosing: 'assets/images/cowboy_right/losing.png',
    };

    preloadImages(sources, drawIntro);
}

function drawIntro() {
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    
    const logoWidth = 700;  
    const logoHeight = 350; 
    
    ctx.drawImage(images.logo, (canvas.width - logoWidth) / 2, 100, logoWidth, logoHeight);
    
    playButton = { x: (canvas.width - 200) / 2, y: 400, width: 200, height: 50 };

    ctx.fillStyle = 'white';
    ctx.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);
    ctx.fillStyle = 'black';
    ctx.fillText('Jugar', playButton.x + 80, playButton.y + 30);

    canvas.removeEventListener('click', handlePlayButtonClick);
    canvas.addEventListener('click', handlePlayButtonClick);
}

function handlePlayButtonClick(event) {
    const { offsetX, offsetY } = event;
    if (offsetX > playButton.x && offsetX < playButton.x + playButton.width &&
        offsetY > playButton.y && offsetY < playButton.y + playButton.height) {
        startGame();
    }
}

function startGame() {
    leftShotTime = null;
    rightShotTime = null;
    winnerText = '';
    isGameStarted = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

    cowboyLeft = { image: 'cowboyLeftPrepared', x: 200, y: 400 };
    cowboyRight = { image: 'cowboyRightPrepared', x: 880, y: 400 };
    countdownText = { time: 3.00 };

    timerWorker.postMessage({ action: 'start' });
    
    // Iniciar el worker de puntuación
    scoreWorker.postMessage({ action: 'reset' });

    audio.loop = true; // Configurar para que se reproduzca en bucle
    audio.play(); // Iniciar la música de fondo

    timerWorker.onmessage = (event) => {
        countdownText.time = event.data.time.toFixed(2);
        drawGame();

        if (event.data.time <= 0) {
            endGame();
        }
    };

    inputWorker.onmessage = (event) => {
        if (event.data.player === 'left' && leftShotTime === null) {
            leftShotTime = countdownText.time;
            cowboyLeft.image = 'cowboyLeftShooting';
            scoreWorker.postMessage({ player: 'left', time: leftShotTime });
        } else if (event.data.player === 'right' && rightShotTime === null) {
            rightShotTime = countdownText.time;
            cowboyRight.image = 'cowboyRightShooting';
            scoreWorker.postMessage({ player: 'right', time: rightShotTime });
        }
    };

    document.removeEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleKeydown);

    setTimeout(() => {
        cowboyLeft.image = 'cowboyLeftWalking';
        cowboyRight.image = 'cowboyRightWalking';
        cowboyLeft.x += 50;
        cowboyRight.x -= 50;
    }, 1000);

    drawGame();
}

function handleKeydown(event) {
    if (event.key === 'w' && isGameStarted) {
        inputWorker.postMessage({ player: 'left', time: countdownText.time });
    } else if (event.key === 'p' && isGameStarted) {
        inputWorker.postMessage({ player: 'right', time: countdownText.time });
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(images[cowboyLeft.image], cowboyLeft.x, cowboyLeft.y, 270, 270);
    ctx.drawImage(images[cowboyRight.image], cowboyRight.x, cowboyRight.y, 270, 270);

    ctx.fillStyle = 'black';
    ctx.font = '40px Arial'; // Aumentar el tamaño del texto del contador
    ctx.fillText(countdownText.time, 620, 50);
}

function endGame() {
    isGameStarted = false;
    audio.pause(); // Pausar la música al terminar el juego

    let leftTime = Math.abs(leftShotTime - 0);
    let rightTime = Math.abs(rightShotTime - 0);

    if (leftShotTime === null && rightShotTime === null) {
        winnerText = 'Empate: Nadie disparó';
        cowboyLeft.image = 'cowboyLeftLosing';
        cowboyRight.image = 'cowboyRightLosing';
    } else if (leftShotTime === null) {
        winnerText = 'Jugador Derecha Ganó (Izquierda no disparó)';
        cowboyLeft.image = 'cowboyLeftLosing';
    } else if (rightShotTime === null) {
        winnerText = 'Jugador Izquierda Ganó (Derecha no disparó)';
        cowboyRight.image = 'cowboyRightLosing';
    } else if (leftTime < rightTime) {
        winnerText = 'Jugador Izquierda disparó más cerca de 0';
        cowboyRight.image = 'cowboyRightLosing';
    } else if (rightTime < leftTime) {
        winnerText = 'Jugador Derecha disparó más cerca de 0';
        cowboyLeft.image = 'cowboyLeftLosing';
    } else {
        winnerText = 'Empate: Ambos dispararon al mismo tiempo';
        cowboyLeft.image = 'cowboyLeftLosing';
        cowboyRight.image = 'cowboyRightLosing';
    }

    drawGame();

    setTimeout(() => {
        ctx.fillStyle = 'black';
        ctx.font = '40px Josefin Sans';
        
        const winnerTextWidth = ctx.measureText(winnerText).width;
        ctx.fillText(winnerText, (canvas.width - winnerTextWidth) / 2, canvas.height / 2);

        ctx.font = '30px Josefin Sans';
        const playAgainText = 'Haz click para jugar otra vez';
        const playAgainTextWidth = ctx.measureText(playAgainText).width;
        ctx.fillText(playAgainText, (canvas.width - playAgainTextWidth) / 2, canvas.height / 2 + 50);

        canvas.addEventListener('click', () => {
            start(); // Reiniciar el juego
        }, { once: true });
    }, 1000);
}

start();
