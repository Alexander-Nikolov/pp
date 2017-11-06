var phinalphase = phinalphase || {};

var animCop = {
    idle: ['idle', 'Idle_', 0, 11, '', 3, 15, 0, 0],
    run: ['run', 'Run_', 0, 13, '', 3, 15, -8, 0],
    jumpStart: ['jumpStart', 'Jump Start_', 0, 19, '', 3, 25, 0, 0],
    jumpAir: ['jumpAir', 'Jump On Air_', 0, 0, '', 3, 15, 0, 0],
    jumpFall: ['jumpFall', 'Jump Fall_', 0, 0, '', 3, 15, 0, 0],
    attack: ['shoot', 'Shoot_', 0, 14, '', 3, 20.2, 0, 0],
    hurt: ['hurt', 'Hurt_', 0, 9, '', 3, 20, 0, 0],
    death: ['death', 'Death_', 0, 14, '', 3, 20, -10, 0],
    flyIdle: ['flyIdle', 'Jetpack Idle_', 0, 11, '', 3, 25, 0, 0],
    flyForward: ['flyForward', 'Jetpack Fly Forward_', 0, 11, '', 3, 25, 0, 0],
    flyShoot: ['flyShoot', 'Jetpack Fly Shoot_', 0, 11, '', 3, 25, 0, 0],
    flyHurt: ['flyHurt', 'Jetpack Fly Hurt_', 0, 9, '', 3, 25, 0, 0],
    knockback: ['knockback', 'Knockback_', 0, 15, '', 3, 25, -5, 0]
};

var skillsCop = [
    {
        type: 'proj',
        enerReq: 10,
        key: 'bullet',
        frame: 'bullet',
        cooldown: 2,
        userAnim: animCop.attack[0],
        stop: false,
        dmg: 10,
        enemyCollide: '',
        bullet: {
            number: 30,
            speed: 750,
            scaleX: 0.1,
            scaleY: 0.1,
        },
        offsetX: 10,
        offsetY: -30
    },
    {
        type: 'melee',
        enerReq: 10,
        key: undefined,
        frame: undefined,
        cooldown: 0,
        userAnim: animCop.knockback[0],
        stop: false,
        dmg: 5,
        enemyCollide: `
            (function(enemy){
                enemy.body.velocity.y = -200;
                if (this.user.scale.x > 0) {
                    enemy.body.velocity.x = 300;
                } else {
                    enemy.body.velocity.x = -300;
                }
            }.bind(this))(enemy);
        `,
        weapon: {
            offsetX: 30,
            offsetY: -30,
            height: 20,
            width: 20
        }
    },
    {
        type: 'special',
        enerReq: 0.5,
        key: undefined,
        frame: undefined,
        cooldown: 0,
        userAnim: animCop.flyIdle[0],
        stop: false,
        special: ` (function(that) {
        if (!that.checkEnergy()) {
            return;
        }
        phinalphase.sounds.playerCop.jetpack.play();
        that.user.play(that.userAnim);
        that.user.body.velocity.y -= 23;
        })(this)`
    },

    {
        type: 'special',
        enerReq: 100,
        key: 'splash',
        frame: ['splash', 'groundup', 1, 30, '', 4, 35],
        cooldown: 0,
        userAnim: animCop.jumpFall[0],
        stop: false,
        special: `(function(that) {
            if (!that.user.isInAir) {
                return;
            }
            if (!that.checkEnergy()) {
                return;
            }
            that.user.act('FALL');
            that.user.busy = true;
            var oldJumpHeight = that.user.jumpHeight
            that.user.jumpHeight = -900;

            that.user.body.velocity.y = 900;

            if (that.splash == undefined) {
                that.splash = phinalphase.game.make.sprite(0, that.user.height / 2, that.key);
                that.damage = 30;
                that.splash.aura = false;
                that.splash.anchor.setTo(0.5, 1);
                that.splash.scale.setTo(0.5, 0.5);
                that.splash.name = that.frame[0];
                phinalphase.game.physics.arcade.enable(that.splash);
                that.splash.animations.add(that.frame[0], Phaser.Animation.generateFrameNames(that.frame[1], that.frame[2], that.frame[3], that.frame[4], that.frame[5]), that.frame[6]);
                that.user.addChild(that.splash);
                that.splash.kill();
            }


            var collideFunction = function () {
                phinalphase.game.physics.arcade.overlap(phinalphase.players, that.splash, function (aura, enemy) {
                    if (that.user == enemy) {
                        return;
                    }
                    enemy.act('STRIKED', that);
                }, null, that);
            }.bind(that);
            phinalphase.game.updatables.push(collideFunction);


            var theSplash = function () {
                if (!that.user.isInAir) {
                    that.splash.revive();
                    that.splash.aura = true;
                    that.user.jumpHeight = oldJumpHeight;
                    that.user.busy = false;

                    that.splash.animations.currentAnim.loop = false;
                    that.splash.animations.currentAnim.onComplete.add(function () {
                        that.splash.kill();
                        that.splash.aura = false;
                        that.splash.animations.currentAnim.onComplete._bindings.pop();
                        phinalphase.game.updatables.splice(phinalphase.game.updatables.indexOf(collideFunction), 1);
                    }, that);
                    phinalphase.game.updatables.splice(phinalphase.game.updatables.indexOf(theSplash), 1);
                }
            }.bind(that);

            phinalphase.game.updatables.push(theSplash);
        })(this)`
    }
];

phinalphase.playerCop = {
    x: 0,
    y: 0,
    key: 'playerCop',
    frame: 'Idle_000',
    gravity: 1000,
    jumpHeight: -600,
    speed: 300,
    energyRegen: 0.1,
    defense: 5,
    anim: animCop,
    skills: skillsCop
};
