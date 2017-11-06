var phinalphase = phinalphase || {};
phinalphase.game = new Phaser.Game(800, 600, Phaser.AUTO, '');
phinalphase.game.state.add('Boot', phinalphase.Boot);
phinalphase.game.state.add('Preload', phinalphase.Preload);
phinalphase.game.state.add('MainMenu', phinalphase.MainMenu);
phinalphase.game.state.add('Game', phinalphase.Game);
phinalphase.game.state.start('Boot');