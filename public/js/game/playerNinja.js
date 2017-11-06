var phinalphase = phinalphase || {};

var animNinja = {
    idle: ['idle', 'Idle_', 0, 11, '', 3, 15, 0, 0],
    run: ['run', 'Run_', 0, 12, '', 3, 15, 0, 0],
    jumpStart: ['jumpStart', 'Jump Start_', 0, 11, '', 3, 15, 0, 0],
    jumpAir: ['jumpAir', 'Jump On Air_', 0, 0, '', 3, 15, 0, 0],
    jumpFall: ['jumpFall', 'Jump Fall_', 0, 0, '', 3, 15, 0, 0],
    attack: ['attack1', 'Attack_', 0, 13, '', 3, 20, -11, 0],
    hurt: ['hurt', 'Hurt_', 0, 11, '', 3, 20, 0, 0],
    death: ['death', 'Death_', 0, 19, '', 3, 20, -10, 0],
    block: ['block', 'Block Parry_', 0, 19, '', 3, 20, 0, 0]
};

var skillsNinja = [
    {
        type: 'aurabuff',
        enerReq: 30,
        key: 'popAura',
        frame: 'pop_explosion0001',
        cooldown: 20,
        userAnim: animNinja.block[0],
        stop: true,
        duration: 10,
        anim: ['pop', 'pop_explosion', 1, 18, '', 4, 15],
        effects: 'that.speed += 100',
        afterEffects: 'that.speed -= 100'
    },
    {
        type: 'proj',
        enerReq: 10,
        key: 'fireball',
        frame: 'fireball',
        cooldown: 10,
        userAnim: animNinja.block[0],
        stop: true,
        dmg: 10,
        enemyCollide: `
        (function(enemy){
            enemy.body.velocity.x = 0;            
            enemy.body.velocity.y = -400;
        }.bind(this))(enemy);
            `,
        bullet: {
            number: 1,
            speed: 500,
            scaleX: 0.3,
            scaleY: 0.3,
            repeat: true
        },
        offsetX: 0,
        offsetY: -30
    },
    {
        type: 'melee',
        enerReq: 10,
        key: undefined,
        frame: undefined,
        cooldown: 0,
        userAnim: animNinja.attack[0],
        stop: false,
        dmg: 20,
        enemyCollide: `
        (function(enemy){
            enemy.body.velocity.x = 0;          
        }.bind(this))(enemy);
        `,
        weapon: {
            offsetX: 50,
            offsetY: -30,
            height: 60,
            width: 50
        }
    },
    {
        type: 'block',
        enerReq: 0,
        key: undefined,
        frame: undefined,
        cooldown: 0,
        userAnim: animNinja.block[0],
        stop: false,
        bonusDefense: 5
    }
];

phinalphase.playerNinja = {
    x: 0,
    y: 0,
    key: 'playerNinja',
    frame: 'Idle_000',
    gravity: 1000,
    jumpHeight: -700,
    speed: 300,
    energyRegen: 0.1,
    defense: 0,
    anim: animNinja,
    skills: skillsNinja
};

