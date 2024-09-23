let countdown = 3.00;
let timerInterval;

self.onmessage = (event) => {
    if (event.data.action === 'start') {
        countdown = 3.00; // Reiniciar el conteo
        timerInterval = setInterval(() => {
            countdown -= 0.01;
            if (countdown < 0) countdown = 0; // Evitar valores negativos
            self.postMessage({ time: countdown });

            if (countdown <= 0) {
                clearInterval(timerInterval);
            }
        }, 10); // Actualización cada 10 ms
    }
};


console.log("worker timer good")