var phinalphase = phinalphase || {};

phinalphase.Boot = function () {};
phinalphase.Boot.prototype = {
    preload: function () {
        this.load.image('preloadbar', '/assets/GUI/preload.png');
    },

    create: function () {
        this.game.stage.backgroundColor = '#000';
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.state.start('Preload');
    }
};