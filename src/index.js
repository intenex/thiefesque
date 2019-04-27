import Game from './game.js'; // amazing your webpack setup is working so great

const game = new Game();

document.addEventListener("DOMContentLoaded", () => {
  game.init();
});