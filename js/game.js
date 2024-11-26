import { GameController } from './controllers/gameController.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    new GameController(canvas);
});
