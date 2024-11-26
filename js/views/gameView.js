export class GameView {
    constructor(canvas, images) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.images = images;
    }

    drawGame(cowboys, countdownText) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);
        
        if (cowboys && cowboys.left && cowboys.right) {
            this.drawCowboy(cowboys.left, 'Dispara con W');
            this.drawCowboy(cowboys.right, 'Dispara con P');
        }

        this.drawCountdown(countdownText);
    }

    drawCowboy(cowboy, instructionText) {
        if (this.images[cowboy.image]) {
            this.ctx.drawImage(
                this.images[cowboy.image],
                cowboy.x,
                cowboy.y,
                270,
                270
            );

            if (cowboy.state !== 'losing') {
                this.ctx.fillStyle = 'black';
                this.ctx.font = '24px Josefin Sans';
                const textWidth = this.ctx.measureText(instructionText).width;
                this.ctx.fillText(
                    instructionText,
                    cowboy.x + (270 - textWidth) / 2,
                    cowboy.y - 20
                );
            }
        } else {
            console.error(`Error: Imagen no encontrada: ${cowboy.image}`);
        }
    }

    drawCountdown(time) {
        this.ctx.fillStyle = 'black';
        this.ctx.font = '40px Arial';
        this.ctx.fillText(time, 620, 50);
    }

    drawEndGame(message) {
        this.ctx.fillStyle = 'black';
        this.ctx.font = '40px Josefin Sans';
        
        const messageWidth = this.ctx.measureText(message).width;
        this.ctx.fillText(message, (this.canvas.width - messageWidth) / 2, this.canvas.height / 2);

        this.ctx.font = '30px Josefin Sans';
        const playAgainText = 'Haz click para jugar otra vez';
        const playAgainWidth = this.ctx.measureText(playAgainText).width;
        this.ctx.fillText(playAgainText, (this.canvas.width - playAgainWidth) / 2, this.canvas.height / 2 + 50);
    }

    drawIntro() {
        // Dibuja el fondo
        this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);
        
        // Dibuja el logo
        const logoWidth = 700;  
        const logoHeight = 350;
        this.ctx.drawImage(
            this.images.logo, 
            (this.canvas.width - logoWidth) / 2, 
            100, 
            logoWidth, 
            logoHeight
        );
        
        // Dibuja el botón de jugar
        const playButton = {
            x: (this.canvas.width - 200) / 2,
            y: 400,
            width: 200,
            height: 50
        };

        // Guarda la referencia del botón para poder usarla en el controlador
        this.playButton = playButton;

        // Dibuja el botón
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);
        
        // Dibuja el texto del botón
        this.ctx.fillStyle = 'black';
        this.ctx.font = '30px Josefin Sans';
        const buttonText = 'Jugar';
        const textWidth = this.ctx.measureText(buttonText).width;
        this.ctx.fillText(
            buttonText, 
            playButton.x + (playButton.width - textWidth) / 2,
            playButton.y + 35
        );
    }

    getPlayButton() {
        return this.playButton;
    }

    // ... otros métodos de dibujo
} 