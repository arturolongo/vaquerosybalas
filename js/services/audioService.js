export class AudioService {
    constructor() {
        this.backgroundMusic = new Audio('assets/sounds/background.mp3');
        this.backgroundMusic.loop = true;
    }

    playBackground() {
        this.backgroundMusic.play()
            .catch(error => console.log('Error reproduciendo música:', error));
    }

    stopBackground() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }

    pauseBackground() {
        this.backgroundMusic.pause();
    }
} 