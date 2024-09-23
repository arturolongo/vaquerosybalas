let leftScore = 0;
let rightScore = 0;

self.onmessage = function(event) {
    const { action, player, time } = event.data;

    if (action === 'reset') {
        leftScore = 0;
        rightScore = 0;
    } else if (action === 'update') {
        if (player === 'left') {
            leftScore += time;
        } else if (player === 'right') {
            rightScore += time;
        }
    }

    // Enviar la puntuación actual al hilo principal si es necesario
    self.postMessage({ leftScore, rightScore });
};

console.log("Worker de sonido iniciado");
