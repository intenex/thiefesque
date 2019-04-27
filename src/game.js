import { Display } from 'rot-js';

class Game {
    constructor() {
        this.display = null;
    }

    init() {
        this.display = new Display(); // holy shit this works reading the source is always a winning strategy wow
        document.body.appendChild(this.display.getContainer());
    }
}

export default Game;