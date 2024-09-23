self.onmessage = (event) => {
    const { player, time } = event.data;
    self.postMessage({ player, time });
};


console.log("worker input good")