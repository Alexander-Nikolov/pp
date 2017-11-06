var phinalphase = phinalphase || {};

phinalphase.MainMenu = function () {};
phinalphase.MainMenu.prototype = {
    create: function () {
        this.game.stage.backgroundColor = '#000';
        this.background = this.game.add.sprite(0, 0, 'menuBG');
        this.background.scale.setTo(0.5);
        phinalphase.selectedChar = 0;

        this.ninjaLogo = this.game.add.sprite(220, 180, 'ninjaLogo');
        this.ninjaLogo.scale.setTo(0.15);
        this.copLogo = this.game.add.sprite(490, 190, 'copLogo');
        this.copLogo.scale.setTo(0.15);

        this.createButtonSwitch = function (varName, coorX, coorY, picName, selectedChar, isSelected) {
            this[varName] = this.game.add.button(coorX, coorY, picName, function () {
                this.buttons.children.forEach(function (btn) {
                    btn.frame = 1;
                }, this);
                if (this[varName].frame === 1) {
                    this[varName].frame = 0;
                } else {
                    this[varName].frame = 1;
                }
                phinalphase.selectedChar = selectedChar;
            }, this);
            if (isSelected) {
                this[varName].frame = 0;
            } else {
                this[varName].frame = 1;
            }
            this[varName].scale.setTo(0.2);

            this.buttons.add(this[varName]);
            return this[varName];
        }.bind(this);

        this.buttons = this.game.add.group();

        this.createButtonSwitch("char1Btn", 250, 300, "buttonOnOff", 0, true);
        this.createButtonSwitch("char2Btn", 500, 300, "buttonOnOff", 1);

        this.button = this.game.add.button(this.game.world.centerX - 40, 450, 'playButton', function () {
            this.button.frame = 1;
            this.state.start('Game');
        }, this);

        this.button.onInputOver.add(function () {
            this.button.frame = 1;
        }, this);
        this.button.onInputOut.add(function () {
            this.button.frame = 0;
        }, this);
        this.button.scale.setTo(0.4);
    }
};