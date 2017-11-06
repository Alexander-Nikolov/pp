//Game sounds
phinalphase.sounds = {
    all: {
        heal: new buzz.sound("/assets/Sound/spell3", {
            formats: ["wav"],
            preload: true,
            volume: 60
        }),
        die: new buzz.sound("/assets/Sound/player/die", {
            formats: ["wav"],
            volume: 60,
            preload: true
        })
    },

    playerNinja: {
        run: new buzz.sound("/assets/Sound/footstep09", {
            formats: ["ogg"],
            volume: 20,
            preload: true
        }),
        jump: new buzz.sound("/assets/Sound/jump", {
            formats: ["mp3"],
            volume: 60,
            preload: true
        }),
        melee: new buzz.sound("/assets/Sound/sword", {
            formats: ["wav"],
            volume: 60,
            preload: true
        }),
        hurt: new buzz.sound("/assets/Sound/pain2", {
            formats: ["wav"],
            volume: 60,
            preload: true
        }),
        buff: new buzz.sound("/assets/Sound/teleport", {
            formats: ["wav"],
            volume: 60,
            preload: true
        })
    },

    playerCop: {
        run: new buzz.sound("/assets/Sound/footstep04", {
            formats: ["ogg"],
            volume: 20,
            preload: true
        }),
        noenergy: new buzz.sound("/assets/Sound/powerDrain", {
            formats: ["ogg"],
            preload: true
        }),
        jetpack: new buzz.sound("/assets/Sound/jetpack", {
            formats: ["mp3"],
            volume: 30,
            preload: true
        }),
        hurt: new buzz.sound("/assets/Sound//player/pain", {
            formats: ["wav"],
            volume: 30,
            preload: true
        }),
        shoot: new buzz.sound("/assets/Sound/launches/iceball", {
            formats: ["wav"],
            preload: true
        }),
        jump: new buzz.sound("/assets/Sound/jump", {
            formats: ["mp3"],
            preload: true,
            volume: 60
        }),
        fall: new buzz.sound("/assets/Sound/falling", {
            formats: ["ogg"],
            preload: true,
            volume: 60
        }),
        melee: new buzz.sound("/assets/Sound/meleCop", {
            formats: ["wav"],
            preload: true,
            volume: 60
        })
    }
};

phinalphase.sounds.playerCop.shoot.setSpeed(2.2);
phinalphase.sounds.playerNinja.melee.setSpeed(0.8);