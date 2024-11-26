let scores = {
    left: null,
    right: null
};

function resetScores() {
    scores = {
        left: null,
        right: null
    };
}

self.onmessage = (event) => {
    try {
        if (event.data.action === 'reset') {
            resetScores();
            return;
        }

        const { player, time } = event.data;
        if (!player || time === undefined) return;

        scores[player] = time;

        if (scores.left !== null && scores.right !== null) {
            const leftDiff = Math.abs(scores.left);
            const rightDiff = Math.abs(scores.right);
            
            self.postMessage({
                winner: leftDiff < rightDiff ? 'left' : 'right',
                scores: {...scores}
            });
        }
    } catch (error) {
        console.error('Error en Score Worker:', error);
    }
};

console.log("Score Worker iniciado ✓");
