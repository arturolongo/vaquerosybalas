export class Cowboy {
    constructor(side, startPosition) {
        this.side = side;
        this.x = startPosition.x;
        this.y = startPosition.y;
        this.image = `cowboy${side}Prepared`;
        this.shotTime = null;
        this.state = 'prepared';
    }

    shoot(time) {
        if (this.shotTime === null) {
            this.shotTime = time;
            this.state = 'shooting';
            this.image = `cowboy${this.side}Shooting`;
        }
    }

    lose() {
        this.state = 'losing';
        this.image = `cowboy${this.side}Losing`;
        console.log(`Vaquero ${this.side} cambió a imagen:`, this.image);
    }

    reset() {
        this.shotTime = null;
        this.state = 'prepared';
        this.image = `cowboy${this.side}Prepared`;
    }
} 