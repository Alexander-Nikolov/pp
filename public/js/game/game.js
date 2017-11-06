var phinalphase = phinalphase || {};

phinalphase.Game = function () {
};

phinalphase.deltaTime = 0;
phinalphase.isHost = false;
phinalphase.hostUpd = 0;

// Useful functions to keep the code more "DRY"
phinalphase.putDeltaSpeed = function (speed) {
    return (speed * phinalphase.game.time.physicsElapsed) * phinalphase.game.time.fps;
};

phinalphase.fixedSprite = function (x, y, sprite, scale) {
    var fixedSprite = phinalphase.game.add.sprite(x, y, sprite);
    fixedSprite.scale.setTo(scale);
    fixedSprite.fixedToCamera = true;

    return fixedSprite;
};

phinalphase.fixedText = function (x, y, text, font, color, align) {
    var fixedText = this.game.add.text(x, y, text, {
        font: font,
        fill: color,
        align: align
    });
    fixedText.fixedToCamera = true;
    return fixedText;
};

phinalphase.updateObjects = function (newplayer, id, updateGames, respawnObjects) {
    objectsForServer = [];
    phinalphase.Game.objectMap.forEach(function (object, index) {
        var isAlive = object.alive;
        if (respawnObjects) {
            isAlive = true;
            object.revive();
        }
        objectsForServer[index] = {
            x: object.x,
            y: object.y,
            currentPos: object.currentPos,
            respawn: isAlive
        }
    });

    if (updateGames) {
        //the host updates the objects for everyone else
        Client.syncObjects(objectsForServer);
    } else {
        Client.updateServerObjects({objects: objectsForServer, newplayer: newplayer, id: id});
    }
};

//Functions that handle the data recieved from the server
/**
 * adds new player to the game, it can be another player that joins the game at some point
 * or yourself (main). This player can be host.
 * @param {object} player
 * @param {boolean} main
 * @param {boolean} host
 * @param {number} timer
 */
phinalphase.Game.addNewPlayer = function (player, main, host, timer) {
    if (player.x == 0 && phinalphase.spawns.children) {
        var spawnCoor = Math.floor(Math.random() * phinalphase.spawns.children.length);
        player.x = phinalphase.spawns.children[spawnCoor].x;
        player.y = phinalphase.spawns.children[spawnCoor].y;
    }
    phinalphase.Game.playerMap[player.id] = new phinalphase.Player(player);

    if (main) {
        phinalphase.matchTime = timer;
        if (host) {
            phinalphase.isHost = true;
        }
        phinalphase.playerID = player.id;
        phinalphase.game.camera.follow(phinalphase.Game.playerMap[player.id]);
        phinalphase.game.camera.deadzone = new Phaser.Rectangle(300, 200, 200, 150);

        var player = phinalphase.Game.playerMap[phinalphase.playerID];
        Client.sync(player.x, player.y);
    }
};

// uses information from server to build the map for the new player
phinalphase.Game.createMapFromServer = function (objectsFromServer) {
    var tiles = [
        ['cifiSheet', 'gameTiles']
    ];

    var layers = [
        ['backgroundLayer', 'background'],
        ['backgroundLayer2', 'background2'],
        ['blockedLayer', 'block']
    ];

    var objects = [
        ["spikes", "objects", "spikes"],
        ["spawn", "spawns", "spawns"],
        ["platform", "objects", "platforms"],
        ["saw", "objects", "saws"],
        ["potionH", "objects", "potionsH"],
        ["potionP", "objects", "potionsP"],
        ["potionE", "objects", "potionsE"],
        ["box", "objects", "boxs"],
        ["toxic", "objects", "toxic"],
        ["spikes", "objects", "spikes"]
    ];

    phinalphase.createMap('scifiArena', tiles, layers, objects);
    if (objectsFromServer) {
        objectsFromServer.forEach(function (serverObject, index) {
            Object.keys(serverObject).forEach(function (key) {
                phinalphase.Game.objectMap[index][key] = serverObject[key];
            });
        });
    } else {
        phinalphase.updateObjects(true);
    }
    Client.startGame();

    phinalphase.players = phinalphase.game.add.group();
    Client.createPlayer();
    this.healthContainer = phinalphase.fixedSprite(10, 10, 'healthContainer', 0.5);
    this.healthbar = phinalphase.fixedSprite(74, 26, 'healthbar', 0.5);
    this.healthbarWidth = this.healthbar.width;
    this.energyContainer = phinalphase.fixedSprite(10, 80, 'energyContainer', 0.4);
    this.energybar = phinalphase.fixedSprite(60, 93, 'energybar', 0.4);
    this.energybarWidth = this.energybar.width;
    this.kills = phinalphase.fixedSprite(270, 15, 'kills', 0.06);
    this.killsText = phinalphase.fixedText(315, 35, "__", "20px Arial", "#AAA", "center");
    this.deaths = phinalphase.fixedSprite(265, 70, 'deaths', 0.05);
    this.deathsText = phinalphase.fixedText(315, 85, "__", "20px Arial", "#AAA", "center");
}.bind(phinalphase.Game);

phinalphase.Game.addOldPlayer = function (player) {
    phinalphase.Game.playerMap[player.id] = new phinalphase.Player(player);
};

phinalphase.Game.removePlayer = function (id) {
    if(phinalphase.Game.playerMap[id].usernameText) {
        phinalphase.Game.playerMap[id].usernameText.destroy();
    }
    if (phinalphase.Game.playerMap[id]) {
        phinalphase.Game.playerMap[id].destroy();
    }
    if (phinalphase.Game.playerMap[id]) {
        delete phinalphase.Game.playerMap[id];
    }
};

phinalphase.Game.playerAct = function (id, act, cause) {
    if (!phinalphase.Game.playerMap) {
        return;
    }
    phinalphase.Game.playerMap[id].act(act, cause);
};

phinalphase.Game.syncPlayer = function (id, x, y) {
    if (!phinalphase.Game.playerMap) {
        return;
    }
    var player = phinalphase.Game.playerMap[id];

    if (player) {
        var oldX = player.x;
        var oldY = player.y;

        player.x = x;
        player.y = y;
        if (player.body.embedded) {
            player.x = oldX;
            player.y = oldY;
        }
    }
};

phinalphase.Game.syncObjects = function (data) {
    if (!phinalphase.Game.objectMap) {
        return;
    }
    phinalphase.Game.objectMap.forEach(function (object, index) {

        object.x = data[index].x;
        object.y = data[index].y;
        if (object.currentPos) {
            object.currentPos = data[index].currentPos;
        }

        if (data[index].respawn) {
            object.revive();
        } else {
            object.kill();
        }
    }, this);
};

phinalphase.Game.updateServerInfo = function (id) {
    var player = phinalphase.Game.playerMap[phinalphase.playerID];
    player.updatePlayer();

    var updatedPlayer = {
        x: player.x,
        y: player.y,
        health: player.health,
        energy: player.energy,
        isInAir: player.isInAir,
        busy: player.busy,
        canAttackAgain: player.canAttackAgain,
        alive: player.alive,
        isFlinched: player.isFlinched,
        canBeHitted: player.canBeHitted,
        changingOffset: player.changingOffset,
        energyRegen: player.energyRegen,
        defense: player.defense,
        gravity: player.body.gravity.y,
        jumpHeight: player.jumpHeight,
        speed: player.speed,
        oldCropX: player.oldCropX,
        oldCropY: player.oldCropY,
        kills: player.kills,
        deaths: player.deaths,
        score: player.score
    };
    Client.sendUpdatesPlayer(updatedPlayer);
    if (phinalphase.isHost) {
        phinalphase.updateObjects(false, id);
    }
};

phinalphase.Game.updatePlayer = function (id) {
    if (!phinalphase.Game.playerMap) {
        return;
    }
    var player = phinalphase.Game.playerMap[id];
    player.updatePlayer();
};

phinalphase.Game.getScore = function () {
    phinalphase.game.matchTimerText.setText('00:00');

    phinalphase.game.endText = phinalphase.fixedText(400, 250, "The Match Ended", "40px Arial", "#AAA", "center");
    phinalphase.game.endText.anchor.setTo(0.5);
    setTimeout(function () {
        phinalphase.game.paused = true;
    }, 300);

    var player = phinalphase.Game.playerMap[phinalphase.playerID];
    Client.sendScore({kills: player.kills, deaths: player.deaths, score: player.score});
};

phinalphase.Game.prototype = {
    preload: function () {
        this.game.forceSingleUpdate = false;
        this.game.stage.disableVisibilityChange = true;
        this.game.time.advancedTiming = true;
    },

    create: function () {
        // player and object maps
        phinalphase.Game.playerMap = {};
        phinalphase.Game.objectMap = [];
        //array used for updating via functions
        this.game.updatables = [];

        //background music
        var backgroundMusic1 = new buzz.sound("/assets/Sound/bgmusic", {
            formats: ["mp3"],
            preload: true,
            autoplay: true,
            loop: true,
            volume: 40
        });

        //creating the new player
        Client.newPlayer([phinalphase.playerNinja, phinalphase.playerCop]);

        //all players and spells have world wrap
        this.game.updatables.push(function () {
            phinalphase.players.children.forEach(function (p) {
                phinalphase.game.world.wrap(p, 0, true);
                p.skills.forEach(function (skill) {
                    if (skill instanceof phinalphase.Projectile) {
                        skill.weapon.bullets.children.forEach(function (b) {
                            phinalphase.game.world.wrap(b, 0, true);
                        }, this);
                    }
                }, this);
            }, this);
        }.bind(this));

        //update all groups with objects from Tiled
        this.game.updatables.push(function () {
            phinalphase.TiledGroups.forEach(function (grp) {
                grp.updatable();
            }, this);
        }.bind(this));

        //add timer
        phinalphase.game.time.events.add(2000, function () {
            phinalphase.game.matchTimer = this.time.create(false);
            phinalphase.game.matchTimer.add(phinalphase.matchTime || 20000, null, this);
            phinalphase.game.matchTimer.start();
            phinalphase.game.matchTimerText = phinalphase.fixedText(450, 20, "__", "20px Arial", "#AAA", "center");
        }.bind(this));
    },

    update: function () {
        if (phinalphase.game.matchTimer) {
            var min = Math.floor((phinalphase.game.matchTimer.duration / 1000) / 60);
            if (min.toString().length <= 1) {
                min = '0' + min;
            }
            var sec = Math.floor((phinalphase.game.matchTimer.duration / 1000) % 60);
            if (sec.toString().length <= 1) {
                sec = '0' + sec;
            }

            if (phinalphase.game.matchTimerText.text != '00:00') {
                phinalphase.game.matchTimerText.setText(min + ':' + sec);
            }
        }

        if (phinalphase.isHost) {
            phinalphase.updateObjects(false, undefined, true, false);
            phinalphase.hostUpd++;
        }

        var player = phinalphase.Game.playerMap[phinalphase.playerID];
        if (player) {
            this.game.updatables.forEach(function (f) {
                f();
            }, this);

            player.updatePlayer();
            Client.update();

            if (phinalphase.Game.killsText && phinalphase.Game.deathsText) {
                phinalphase.Game.killsText.setText(player.kills);
                phinalphase.Game.deathsText.setText(player.deaths);

                if (player.health / 100 <= 0) {
                    phinalphase.Game.healthbar.width = 0;
                } else {
                    phinalphase.Game.healthbar.width = phinalphase.Game.healthbarWidth * (player.health / 100);
                }
                if (player.energy / 100 <= 0) {
                    phinalphase.Game.energybar.width = 0;
                } else {
                    phinalphase.Game.energybar.width = phinalphase.Game.energybarWidth * (player.energy / 100);
                }
            }

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                Client.sendAct('RIGHT');
                player.act('RIGHT');
            } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                Client.sendAct('LEFT');
                player.act('LEFT');
            } else if (!player.isInAir) {
                Client.sendAct();
                player.act();
            }
            if (player.body.velocity.y > 200 && player.isInAir) {
                Client.sendAct('FALL');
                player.act('FALL');
            }
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP) && !player.isInAir) {
                Client.sendAct('UP');
                player.act('UP');
            }
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
                Client.sendAct('SKILL', 0);
                player.act('SKILL', 0);
            }
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                Client.sendAct('SKILL', 1);
                player.act('SKILL', 1);
            }
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.E)) {
                Client.sendAct('SKILL', 2);
                player.act('SKILL', 2);
            }
            if (this.game.input.keyboard.isDown(Phaser.Keyboard.R)) {
                Client.sendAct('SKILL', 3);
                player.act('SKILL', 3);
            }
        }
    }
};