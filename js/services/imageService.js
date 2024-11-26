import { CONFIG } from '../config/gameConfig.js';

export class ImageService {
    constructor() {
        this.images = {};
    }

    preloadImages() {
        const sources = CONFIG.images.sources;
        const promises = [];

        for (const [key, src] of Object.entries(sources)) {
            promises.push(this.loadImage(key, src));
        }

        return Promise.all(promises)
            .then(() => {
                return this.images;
            });
    }

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                resolve(img);
            };
            img.onerror = () => reject(`No se pudo cargar la imagen: ${src}`);
            img.src = src;
        });
    }

    getImage(key) {
        return this.images[key];
    }
} 