var phinalphase = phinalphase || {};

phinalphase.TiledGroups = [];
//Factory method for groups of objects that come from Tiled
phinalphase.TiledGroupMaker = function () {
    this.createGroup = function (usability) {
        var group;

        switch (usability) {
            case "movable":
                group = new phinalphase.TiledGroupPushable();
                break;
            case "static":
                group = new phinalphase.TiledGroupStatic();
                break;
            case "damage":
                group = new phinalphase.TiledGroupDamage();
                break;
            case "damageMoving":
                group = new phinalphase.TiledGroupMovingDamage();
                break;
            case "movingPlatform":
                group = new phinalphase.TiledGroupMovingPlatform();
                break;
            case "consumable":
                group = new phinalphase.TiledGroupConsumable();
                break;
            default:
                group = new phinalphase.TiledGroup();
        }
        return group;
    }
};

phinalphase.groupCreator = new phinalphase.TiledGroupMaker();

phinalphase.TiledGroup = function () {
    Phaser.Group.call(this, phinalphase.game);
    this.enableBody = true;
    phinalphase.TiledGroups.push(this);
};

phinalphase.TiledGroup.prototype = Object.create(Phaser.Group.prototype);
phinalphase.TiledGroup.prototype.constructor = phinalphase.TiledGroup;

phinalphase.TiledGroup.prototype.updatable = function () {
    if (this.childrenUpdates) {
        this.childrenUpdates();
    }

    if (this.collidePlayer) {
        phinalphase.game.physics.arcade.collide(phinalphase.players, this, function (player, object) {
            this.collidePlayer(player, object);
        }, null, this);
    }
    if (this.collideLayer) {
        phinalphase.game.physics.arcade.collide(phinalphase.game.collLayer, this, function (layer, object) {
            this.collideLayer(object, layer);
        }, null, this);
    }
    if (this.overlapPlayer) {
        phinalphase.game.physics.arcade.overlap(phinalphase.players, this, function (player, object) {
            this.overlapPlayer(player, object);
        }, null, this);
    }
};
phinalphase.TiledGroupPushable = function () {
    phinalphase.TiledGroup.call(this);
};

phinalphase.TiledGroupPushable.prototype = Object.create(phinalphase.TiledGroup.prototype);
phinalphase.TiledGroupPushable.prototype.constructor = phinalphase.TiledGroupPushable;
phinalphase.TiledGroupPushable.prototype.childrenUpdates = function () {
    this.children.forEach(function (obj) {
        phinalphase.game.world.wrap(obj, 0, true);
        if (!obj.colided) {
            obj.body.immovable = true;
        } else {
            obj.body.immovable = false;
        }
        obj.colided = false;
        if (obj.body.velocity.y > 300) {
            obj.falling = true;
        } else {
            obj.falling = false;
        }

    });
};

phinalphase.TiledGroupPushable.prototype.collidePlayer = function (player, object) {
    if (object.body.touching.right || object.body.touching.left) {
        object.colided = true;
    }

    if (object.falling && player.body.touching.up) {
        player.getHitted({damage: 100});
    }
};

phinalphase.TiledGroupPushable.prototype.collideLayer = function (layer, object) {
    if (object.body.blocked.left || object.body.blocked.right) {
        object.colided = false;
    }
    if (object.falling) {
        phinalphase.game.camera.shake(0.01, 500);
    }
};

phinalphase.TiledGroupPushable.prototype.overlapPlayer = function (object, player) {
    object.colided = false;
};

phinalphase.TiledGroupDamage = function () {
    phinalphase.TiledGroup.call(this);
};

phinalphase.TiledGroupDamage.prototype = Object.create(phinalphase.TiledGroup.prototype);
phinalphase.TiledGroupDamage.prototype.constructor = phinalphase.TiledGroupDamage;
phinalphase.TiledGroupDamage.prototype.childrenUpdates = null;
phinalphase.TiledGroupDamage.prototype.collidePlayer = null;
phinalphase.TiledGroupDamage.prototype.collideLayer = null;

phinalphase.TiledGroupDamage.prototype.overlapPlayer = function (player, object) {
    player.body.velocity.y -= 10;
    player.act('STRIKED', object);
};

phinalphase.TiledGroupMoving = function () {
    phinalphase.TiledGroup.call(this);
};

phinalphase.TiledGroupMoving.prototype = Object.create(phinalphase.TiledGroup.prototype);
phinalphase.TiledGroupMoving.prototype.constructor = phinalphase.TiledGroupMoving;
phinalphase.TiledGroupMoving.prototype.childrenUpdates = function () {
    this.children.forEach(function (object) {
        if (object.spin) {
            object.angle += object.spin;
        }
        if (object.maxPos > object.currentPos && object.direction1) {
            var speed = phinalphase.putDeltaSpeed(object.speed);
            object[object.way] += speed;
            object.currentPos += speed;
        } else {

            object.direction1 = false;
            var speed = phinalphase.putDeltaSpeed(object.speed);
            object[object.way] -= speed;
            object.currentPos -= speed;
            if (object.currentPos <= 0) {
                object.direction1 = true;
            }
        }
    }, this);
};

phinalphase.TiledGroupMoving.prototype.collidePlayer = null;
phinalphase.TiledGroupMoving.prototype.collideLayer = null;
phinalphase.TiledGroupMoving.prototype.overlapPlayer = null;

phinalphase.TiledGroupMovingDamage = function () {
    phinalphase.TiledGroupMoving.call(this);
};

phinalphase.TiledGroupMovingDamage.prototype = Object.create(phinalphase.TiledGroupMoving.prototype);
phinalphase.TiledGroupMovingDamage.prototype.constructor = phinalphase.TiledGroupMovingDamage;
phinalphase.TiledGroupMovingDamage.prototype.collidePlayer = null;
phinalphase.TiledGroupMovingDamage.prototype.collideLayer = null;
phinalphase.TiledGroupMovingDamage.prototype.overlapPlayer = function (player, object) {
    phinalphase.TiledGroupDamage.prototype.overlapPlayer.call(this, player, object);
};

phinalphase.TiledGroupStatic = function () {
    phinalphase.TiledGroup.call(this);
};

phinalphase.TiledGroupStatic.prototype = Object.create(phinalphase.TiledGroup.prototype);
phinalphase.TiledGroupStatic.prototype.constructor = phinalphase.TiledGroupStatic;
phinalphase.TiledGroupStatic.prototype.childrenUpdates = null;
phinalphase.TiledGroupStatic.prototype.collideLayer = null;
phinalphase.TiledGroupStatic.prototype.overlapPlayer = null;

phinalphase.TiledGroupMovingPlatform = function () {
    phinalphase.TiledGroupMoving.call(this);
};

phinalphase.TiledGroupMovingPlatform.prototype = Object.create(phinalphase.TiledGroupMoving.prototype);
phinalphase.TiledGroupMovingPlatform.prototype.constructor = phinalphase.TiledGroupMovingPlatform;

phinalphase.TiledGroupMovingPlatform.prototype.collidePlayer = function (player, object) {
    if (object.direction1) {
        player[object.way] += phinalphase.putDeltaSpeed(object.speed);
    } else {
        player[object.way] -= phinalphase.putDeltaSpeed(object.speed);
    }
};

phinalphase.TiledGroupMovingPlatform.prototype.collideLayer = null;
phinalphase.TiledGroupMovingPlatform.prototype.overlapPlayer = null;

phinalphase.TiledGroupConsumable = function () {
    phinalphase.TiledGroupMoving.call(this);
};

phinalphase.TiledGroupConsumable.prototype = Object.create(phinalphase.TiledGroupMoving.prototype);
phinalphase.TiledGroupConsumable.prototype.constructor = phinalphase.TiledGroupConsumable;
phinalphase.TiledGroupConsumable.prototype.collidePlayer = null;
phinalphase.TiledGroupConsumable.prototype.collideLayer = null;

phinalphase.TiledGroupConsumable.prototype.overlapPlayer = function (player, object) {
    switch (object.use) {
        case "heal":
            if (player.health == 100) {
                return;
            }
            player.health += object.heal;
            if (player.health > 100) {
                player.health = 100;
            }
            phinalphase.sounds.all.heal.play();
            break;
        case "poison":
            if (player == phinalphase.Game.playerMap[phinalphase.playerID]) {
                phinalphase.game.camera.shake(0.05, 2000);
                phinalphase.game.camera.flash(0xff0000, 2000);
            }

            player.getHitted(object);
            break;
        case "energy":
            if (player.energy == 100) {
                return;
            }
            player.energy += object.energy;
            if (player.energy > 100) {
                player.energy = 100;
            }
            break;
    }

    object.body.enable = false;
    object.kill();
    phinalphase.game.time.events.add(object.respawnTime * 1000, function () {
        this.revive();
        phinalphase.game.time.events.add(500, function () {
            this.body.enable = true;
        }.bind(this))
    }.bind(object));
};

phinalphase.TiledObject = function (groupName, x, y, rotation, width, height, properties, anchor, objPhysics) {

    if (properties.sprite == 'none') {
        var sprite = new Phaser.Sprite(phinalphase.game, x, y);
    } else {
        var sprite = new Phaser.Sprite(phinalphase.game, x, y, properties.sprite);
    }

    sprite.x = x;
    sprite.y = y;
    sprite.rotation = rotation;
    sprite.width = width;
    sprite.height = height;
    sprite.direction1 = true;

    Object.keys(properties).forEach(function (key) {
        sprite[key] = properties[key];
    });
    if (anchor) {
        sprite.anchor.setTo(anchor);
    }

    if (objPhysics) {
        phinalphase.game.physics.arcade.enable(sprite);
        sprite.body.gravity.y = objPhysics.gravity;
        sprite.body.drag.x = objPhysics.drag;
        sprite.body.immovable = objPhysics.immovable;
    }

    phinalphase[groupName].add(sprite);
    phinalphase.Game.objectMap.push(sprite);

    return sprite;
};

phinalphase.оbjectGroupFromTiled = function (type, map, layerName, groupName) {
    var res = [];

    map.objects[layerName].forEach(function (obj) {
        if (obj.properties.type === type) {
            res.push(obj);
        }
    });

    phinalphase[groupName] = phinalphase.groupCreator.createGroup(res[0].properties.usability);

    res.forEach(function (obj, index) {
        switch (obj.properties.usability) {
            case "movable":
                new phinalphase.TiledObject(groupName, obj.x, obj.y, obj.rotation, obj.width, obj.height, obj.properties, 0.5, {
                    gravity: 500,
                    drag: 3000
                });
                break;
            case "static":
                new phinalphase.TiledObject(groupName, obj.x, obj.y, obj.rotation, obj.width, obj.height, obj.properties, 0, {
                    immovable: true
                });
                break;
            case "damage":
                new phinalphase.TiledObject(groupName, obj.x, obj.y, obj.rotation, obj.width, obj.height, obj.properties);
                break;
            case "damageMoving":
                new phinalphase.TiledObject(groupName, obj.x, obj.y, obj.rotation, obj.width, obj.height, obj.properties, 0.5);
                break;
            case "movingPlatform":
                new phinalphase.TiledObject(groupName, obj.x, obj.y, obj.rotation, obj.width, obj.height, obj.properties, 0, {
                    immovable: true
                });
                break;
            case "consumable":
                new phinalphase.TiledObject(groupName, obj.x, obj.y, obj.rotation, obj.width, obj.height, obj.properties);
                break;
            default:
                new phinalphase.TiledObject(groupName, obj.x, obj.y, obj.rotation, obj.width, obj.height, obj.properties);
        }
    });
};