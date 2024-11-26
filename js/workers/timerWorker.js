let countdownInterval = null;
let currentTime = 3.00;

function cleanup() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

self.onmessage = (event) => {
    if (event.data.action === 'start') {
        cleanup();
        currentTime = 3.00;
        
        countdownInterval = setInterval(() => {
            currentTime = Math.max(0, currentTime - 0.01);
            self.postMessage({ time: currentTime });
            
            if (currentTime <= 0) {
                cleanup();
            }
        }, 10);
    } else if (event.data.action === 'stop') {
        cleanup();
    }
};

console.log("Timer Worker iniciado ✓");