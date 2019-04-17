var Game = {
    display: null,
    init: function() {
        this.display = new DeviceRotationRate.Display();
        document.body.appendChild(this.display.getContainer());
    }
};

module.exports = Game;