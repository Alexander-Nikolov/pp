var phinalphase = phinalphase || {};

//loading the game assets
phinalphase.Preload = function () {};
phinalphase.Preload.prototype = {
    preload: function () {
        //show loading screen
        this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
        this.preloadBar.anchor.setTo(0.5);
        this.load.setPreloadSprite(this.preloadBar);

        //load game assets
        //map
        this.load.image('toxic', '/assets/SpritesheetsАndTilesets/mainobjects/toxic.png');
        this.load.image('toxictop', '/assets/SpritesheetsАndTilesets/mainobjects/toxictop.png');
        this.load.image('box', '/assets/SpritesheetsАndTilesets/mainobjects/box.png');
        this.load.image('potionH', '/assets/SpritesheetsАndTilesets/mainobjects/pt1.png');
        this.load.image('potionE', '/assets/SpritesheetsАndTilesets/mainobjects/pt2.png');
        this.load.image('potionP', '/assets/SpritesheetsАndTilesets/mainobjects/pt3.png');
        this.load.image('spikes', '/assets/SpritesheetsАndTilesets/mainobjects/spike.png');
        this.load.image('platform', '/assets/SpritesheetsАndTilesets/mainobjects/platform.png');
        this.load.image('saw', '/assets/SpritesheetsАndTilesets/mainobjects/Saw.png');
        this.load.tilemap('scifiArena', '/assets/levels/1/cifi2.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('gameTiles', '/assets/SpritesheetsАndTilesets/cifi/Tiles/cifiSheet.png');

        //Players
        this.load.image('bullet', '/assets/images/bullet2.png');
        this.load.atlas('playerNinja', '/assets/images/Players/Swordsman/hero1.png', '/assets/images/Players/Swordsman/hero1.json');
        this.load.spritesheet('fireball', '/assets/images/Players/Swordsman/fireball.png', 333, 199);
        this.load.atlas('popAura', '/assets/images/Players/Swordsman/pop.png', '/assets/images/Players/Swordsman/pop.json');
        this.load.atlas('playerCop', '/assets/images/Players/Cop/hero2.png', '/assets/images/Players/Cop/hero2.json');
        this.load.atlas('splash', '/assets/images/Players/Cop/splash.png', '/assets/images/Players/Cop/splash.json');

        //user interface
        this.load.image('healthContainer', '/assets/GUI/healthContainer.png');
        this.load.image('healthbar', '/assets/GUI/healthbar.png');
        this.load.image('energyContainer', '/assets/GUI/energyContainer.png');
        this.load.image('energybar', '/assets/GUI/energybar.png');
        this.load.image('deaths', '/assets/GUI/deaths.png');
        this.load.image('kills', '/assets/GUI/kills.png');

        //MainMenu
        this.load.spritesheet('playButton', '/assets/GUI/play.png', 175, 175);
        this.load.image('menuBG', '/assets/GUI/menuBG.jpg');
        this.load.spritesheet('buttonOnOff', '/assets/GUI/onoff.png', 175, 175);
        this.load.image('ninjaLogo', '/assets/GUI/ninjaLogo.png');
        this.load.image('copLogo', '/assets/GUI/copLogo.png');
    },
    create: function () {
        this.state.start('MainMenu');
    }

};