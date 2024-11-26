import { CONFIG } from '../config/gameConfig.js';
import { Cowboy } from '../models/cowboy.js';
import { GameView } from '../views/gameView.js';
import { AudioService } from '../services/audioService.js';
import { ImageService } from '../services/imageService.js';

export class GameController {
    constructor(canvas) {
        this.canvas = canvas;
        this.imageService = new ImageService();
        this.audioService = new AudioService();
        this.initialize();
    }

    async initialize() {
        try {
            const images = await this.imageService.preloadImages();
            this.gameView = new GameView(this.canvas, images);
            this.showIntro();
        } catch (error) {
            console.error('Error inicializando el juego:', error);
        }
    }

    showIntro() {
        this.gameView.drawIntro();
        this.setupIntroListeners();
    }

    setupIntroListeners() {
        const handleIntroClick = (event) => {
            const playButton = this.gameView.getPlayButton();
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (playButton && 
                x >= playButton.x && 
                x <= playButton.x + playButton.width &&
                y >= playButton.y && 
                y <= playButton.y + playButton.height) {
                
                this.canvas.removeEventListener('click', handleIntroClick);
                this.initializeGame();
                this.startGame();
            }
        };

        this.canvas.addEventListener('click', handleIntroClick);
    }

    initializeGame() {
        this.cowboys = {
            left: new Cowboy('Left', CONFIG.cowboys.startPositions.left),
            right: new Cowboy('Right', CONFIG.cowboys.startPositions.right)
        };
        
        this.isGameStarted = false;
        this.countdownText = CONFIG.countdown.initial;
        this.setupWorkers();
        this.setupEventListeners();
    }

    setupWorkers() {
        try {
            this.terminateWorkers();
            this.timerWorker = new Worker('js/workers/timerWorker.js');
            this.inputWorker = new Worker('js/workers/inputWorker.js');
            this.scoreWorker = new Worker('js/workers/scoreWorker.js');
            this.setupWorkerListeners();
        } catch (error) {
            console.error('Error inicializando workers:', error);
            this.terminateWorkers();
        }
    }

    terminateWorkers() {
        if (this.timerWorker) {
            this.timerWorker.terminate();
            this.timerWorker = null;
        }
        if (this.inputWorker) {
            this.inputWorker.terminate();
            this.inputWorker = null;
        }
        if (this.scoreWorker) {
            this.scoreWorker.terminate();
            this.scoreWorker = null;
        }
    }

    setupWorkerListeners() {
        this.timerWorker.onmessage = (event) => {
            this.countdownText = event.data.time.toFixed(2);
            this.gameView.drawGame(this.cowboys, this.countdownText);

            if (event.data.time <= 0) {
                if (this.cowboys.left.shotTime === null && this.cowboys.right.shotTime === null) {
                    this.cowboys.left.lose();
                    this.cowboys.right.lose();
                    this.gameView.drawGame(this.cowboys, this.countdownText);
                    setTimeout(() => {
                        this.endGame('¡Ambos jugadores pierden por no disparar!');
                    }, 500);
                }
                this.endGame();
            }
        };

        this.inputWorker.onmessage = (event) => {
            const cowboy = event.data.player === 'left' ? this.cowboys.left : this.cowboys.right;
            if (!cowboy.shotTime) {
                cowboy.shoot(this.countdownText);
                this.scoreWorker.postMessage({ 
                    player: event.data.player, 
                    time: cowboy.shotTime 
                });
            }
        };

        this.scoreWorker.onmessage = (event) => {
            if (event.data.winner) {
                this.handleGameResult(event.data);
            }
        };
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    handleKeydown(event) {
        if (!this.isGameStarted) return;

        if (event.key === 'w') {
            this.inputWorker.postMessage({ player: 'left', time: this.countdownText });
        } else if (event.key === 'p') {
            this.inputWorker.postMessage({ player: 'right', time: this.countdownText });
        }
    }

    startGame() {
        this.isGameStarted = true;
        this.cowboys.left.reset();
        this.cowboys.right.reset();
        this.gameView.drawGame(this.cowboys, this.countdownText);
        this.audioService.playBackground();
        this.timerWorker.postMessage({ action: 'start' });
        this.scoreWorker.postMessage({ action: 'reset' });
    }

    handleGameResult(result) {
        const winner = result.winner;
        const loser = winner === 'left' ? 'right' : 'left';
        
        this.cowboys[loser].lose();
        this.gameView.drawGame(this.cowboys, this.countdownText);
        
        let message;
        if (this.cowboys.left.shotTime === null && this.cowboys.right.shotTime === null) {
            message = '¡Ambos jugadores pierden por no disparar!';
            this.cowboys.left.lose();
            this.cowboys.right.lose();
        } else if (this.cowboys[loser].shotTime === null) {
            message = `¡Jugador ${winner === 'left' ? 'Izquierda' : 'Derecha'} gana! (El otro no disparó)`;
        } else {
            const winnerTime = Math.abs(this.cowboys[winner].shotTime);
            const loserTime = Math.abs(this.cowboys[loser].shotTime);
            message = `¡Jugador ${winner === 'left' ? 'Izquierda' : 'Derecha'} gana! (${winnerTime.toFixed(2)} vs ${loserTime.toFixed(2)})`;
        }
        
        setTimeout(() => {
            this.endGame(message);
        }, 500);
    }

    endGame(resultMessage = '') {
        this.isGameStarted = false;
        this.audioService.pauseBackground();
        
        if (resultMessage) {
            this.gameView.drawEndGame(resultMessage);
        }

        if (this.timerWorker) {
            this.timerWorker.postMessage({ action: 'stop' });
        }

        setTimeout(() => {
            this.terminateWorkers();
            this.setupEventListenersForRestart();
        }, 100);
    }

    setupEventListenersForRestart() {
        const handleRestart = () => {
            this.canvas.removeEventListener('click', handleRestart);
            this.showIntro();
        };

        this.canvas.addEventListener('click', handleRestart);
    }
} 