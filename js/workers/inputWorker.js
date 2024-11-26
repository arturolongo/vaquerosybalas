self.onmessage = (event) => {
    try {
        const { player, time } = event.data;
        if (!player || time === undefined) {
            console.error('Datos de disparo inválidos');
            return;
        }
        self.postMessage({ player, time });
    } catch (error) {
        console.error('Error en Input Worker:', error);
    }
};

console.log("Input Worker iniciado ✓");