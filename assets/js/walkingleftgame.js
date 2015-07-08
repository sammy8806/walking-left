BasicGame.Game = function (game) {
    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    this.zombies = null;
    this.boxes = null;
    this.player = null;
    this.playerGroup = null;
    this.platforms = null;

    this.level = 1;
    this.playerBullets = 30;
    this.playerHealth = 100;

    this.bulletFireRate = 60 * 2; // shots per 60 seconds

    // Internals
    this.nextShotAt = 0;
    this.bullets = 3;

    this.instructions = null;
    this.instructionsExpire = null;
    this.playerTurned = false;

    this.nextZombieAt = 0;
    this.zombieDelay = 3000; // in msec

    this.nextHealthkitAt = 0;
    this.healthkitDelay = 6000; // in msec
    this.heathkitPossibility = 20; // in percent
    this.medkits = null;

    this.hudZombieCounter = null;

    this.gun = null;
};

//
//BasicGame.Game.weapon = function() {
//    this.gun = function() {
//        //Phaser.Group.call(this, )
//    }
//};

BasicGame.Game.prototype.preload = function () {

};

BasicGame.Game.prototype.create = function () {
    this.time.advancedTiming = true;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.platforms = game.add.group();
    this.platforms.enableBody = true;

    this.playerGroup = game.add.group();
    this.playerGroup.enableBody = true;

    // var background = game.add.tileSprite(0, 0, this.game.width, game.world.height - 50, 'ground');

    for (var i = 0; i < Math.ceil(game.world.width / 50); i++) {
        ground = this.platforms.create(i * 50, game.world.height - 50, 'ground');
        ground.body.immovable = true;
    }

    this.loadPlayer();
    this.loadZombies();
    this.loadHealthkits();

    this.boxes = game.add.group();
    this.boxes.enableBody = true;
    this.boxes.physicsBodyType = Phaser.Physics.ARCADE;
    this.generateRandomEnvElements();

    this.bulletPool = this.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(100, 'projectile');
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);

    // game.physics.arcade.moveToObject(zombie, player);

    this.game.camera.follow(this.player);
    this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    this.game.camera.focusOnXY(0, 0);

    this.displayHUD();
    this.displayEntryMessage();
};

//game.physics.arcade.modeToObject(Zomibie,Player);  sorgt dafür, das sich der this.zombie dem spieler nähert
BasicGame.Game.prototype.render = function () {
    //game.debug.bodyInfo(this.player, 30, 30);
};

BasicGame.Game.prototype.update = function () {
    this.game.physics.arcade.collide(this.medkits, this.boxes);
    this.game.physics.arcade.collide(this.medkits, this.platforms);

    this.game.physics.arcade.collide(this.player, this.platforms);
    this.game.physics.arcade.collide(this.player, this.boxes);

    this.game.physics.arcade.collide(this.zombies, this.platforms);
    this.game.physics.arcade.collide(this.zombies, this.boxes);

    this.game.physics.arcade.collide(this.boxes, this.platforms);

    this.cursors = game.input.keyboard.createCursorKeys();

    //  Reset the players velocity (movement)
    this.player.body.velocity.x = 0;

    var playerBaseRunVelocity = 190;
    var playerBaseJumpVelocity = 280;

    if (this.cursors.left.isDown) {
        this.playerTurned = true;
        this.player.body.velocity.x = -playerBaseRunVelocity + playerBaseRunVelocity * (this.level / 100);
        this.player.animations.play('walk_left');
    }
    else if (this.cursors.right.isDown) {
        this.playerTurned = false;
        this.player.body.velocity.x = playerBaseRunVelocity + playerBaseRunVelocity * (this.level / 100);
        this.player.animations.play('walk_right');
    } else {
        this.player.animations.stop();
    }

    //  Allow the player to jump if they are touching the ground.
    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.body.velocity.y = -playerBaseJumpVelocity;
    }

    this.physics.arcade.overlap(
        this.bulletPool, this.zombies, this.zombieHitWithGun, null, this
    );
    this.physics.arcade.overlap(
        this.player, this.zombies, this.playerHit, null, this
    );

    this.physics.arcade.overlap(
        this.player, this.medkits, this.playerHealthkit, null, this
    );

    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.fire();
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.Z)) {
        this.spawnZombie();
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.M)) {
        this.spawnHealthkit();
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.L)) {
        this.level++;
    }

    if (this.instructions.exists && this.time.now > this.instructionsExpire) {
        this.instructions.destroy();
    }

    if (this.nextZombieAt < this.time.now && this.zombies.countDead() > 0) {
        this.nextZombieAt = this.time.now + this.zombieDelay;
        this.spawnZombie();
    }

    if (this.nextHealthkitAt < this.time.now && this.zombies.countDead() > 0) {
        this.nextHealthkitAt = this.time.now + this.healthkitDelay;
        var rnd = Math.random();
        if (this.heathkitPossibility / 100 >= rnd) {
            var medkit = this.spawnHealthkit();
            console.log('hk (' + this.heathkitPossibility + ' ; ' + rnd + ') at (' + medkit.x + ',' + medkit.y + ')');
        } else {
            console.log('no hk (' + this.heathkitPossibility + ' ; ' + rnd + ')');
        }
    }

    this.updateHUD();
};

BasicGame.Game.prototype.quitGame = function () {
    this.state.start('MainMenu');
};

BasicGame.Game.prototype.playerHealthkit = function (player, healthkit) {
    this.playerHealth += 40;
    healthkit.kill();
};

BasicGame.Game.prototype.playerHit = function (player, enemy) {
    if (player.alive) {
        this.playerHealth -= 15;
        player.body.velocity.x = -800;

        if (this.playerHealth <= 0) {
            var killedPlayer = this.add.sprite(player.x, player.y, 'player');
            player.kill();
            killedPlayer.anchor.setTo(0.5, 0.5);
            killedPlayer.animations.add('die', [
                "dying_1.png",
                "dying_2.png"
            ], 2);
            killedPlayer.play('die', 2);
        }
    }
};

BasicGame.Game.prototype.zombieHitWithGun = function (bullet, enemy) {
    bullet.kill();
    enemy.kill();
};

BasicGame.Game.prototype.loadPlayer = function () {
    //return this.loadPlayerAt(32, game.world.height - 150);
    return this.loadPlayerWithGunAt(32, game.world.height - 150);
};

BasicGame.Game.prototype.loadPlayerAt = function (x, y) {
    var player = this.game.add.sprite(x, y, 'player', 'stay_right.png');

    player.animations.add('walk_right', [
        "stay_right.png",
        "run_right_1.png",
        "stay_right.png",
        "run_right_2.png"
    ], 10);
    player.animations.add('walk_left', [
        "stay_left.png",
        "run_left_1.png",
        "stay_left.png",
        "run_left_2.png"
    ], 10);

    this.game.physics.arcade.enable(player);

    player.body.bounce.y = 0.15;
    player.body.gravity.y = 600;
    player.body.collideWorldBounds = true;
    player.anchor.setTo(0.5, 0.5);

    return player;
};

BasicGame.Game.prototype.loadPlayerWithGunAt = function (x, y) {
    var player = this.loadPlayerAt(0, 0);
    this.player = player;
    this.playerGroup.add(player);

    var gun = this.game.add.sprite(0, 0, 'gun');
    this.playerGroup.add(gun);

    return player;
};

BasicGame.Game.prototype.loadZombies = function () {
    this.zombies = this.add.group();
    this.zombies.enableBody = true;
    this.zombies.physicsBodyType = Phaser.Physics.ARCADE;
    this.zombies.createMultiple(100, 'zombie');
    this.zombies.setAll('anchor.x', 0.5);
    this.zombies.setAll('anchor.y', 0.5);
    this.zombies.setAll('outOfBoundsKill', false);
    this.zombies.setAll('checkWorldBounds', true);

    this.zombies.forEach(function (zombie) {
        zombie.animations.add('run_left', [
            'stay_left.png',
            'run_left.png',
            'stay_left.png',
            'run_left.png'
        ]);

        zombie.animations.add('run_right', [
            'stay_right.png',
            'run_right.png',
            'stay_right.png',
            'run_right.png'
        ]);
    });
};

BasicGame.Game.prototype.spawnZombie = function () {
    var zombie = this.zombies.getFirstExists(false);
    if (zombie == undefined)
        return;

    zombie.reset(
        this.rnd.integerInRange(this.player.x + 20, this.player.x + 600),
        0
    );
    zombie.play('run_left');
    zombie.body.bounce.y = 0.2;
    zombie.body.gravity.y = 600;
    zombie.body.velocity.x = this.level * -3 + -15;
};


BasicGame.Game.prototype.loadHealthkits = function () {
    this.medkits = this.add.group();
    this.medkits.enableBody = true;
    this.medkits.physicsBodyType = Phaser.Physics.ARCADE;
    this.medkits.createMultiple(100, 'medkit');
    this.medkits.setAll('anchor.x', 0.5);
    this.medkits.setAll('anchor.y', 0.5);
    this.medkits.setAll('outOfBoundsKill', false);
    this.medkits.setAll('checkWorldBounds', true);
};

BasicGame.Game.prototype.spawnHealthkit = function () {
    var medkit = this.medkits.getFirstExists(false);
    if (medkit == undefined)
        return;

    medkit.reset(
        this.rnd.integerInRange(this.player.x + 20, this.player.x + 600),
        0
    );
    medkit.play('run_left');
    medkit.body.bounce.y = 0.2;
    medkit.body.gravity.y = 400;

    return medkit;
};

BasicGame.Game.prototype.generateRandomEnvElements = function () {
    var countBoxes = this.rnd.integerInRange(5, 80);
    var countBarrels = this.rnd.integerInRange(5, 80);

    this.boxes.createMultiple(countBoxes, 'box');
    this.boxes.createMultiple(countBarrels, 'barrel');
    this.boxes.setAll('anchor.x', 0.5);
    this.boxes.setAll('anchor.y', 1);
    this.boxes.setAll('body.immovable', true);
    this.boxes.setAll('outOfBoundsKill', false);
    this.boxes.setAll('checkWorldBounds', true);

    console.log({barr: countBarrels, box: countBoxes, sum: this.boxes.countDead()});

    this.boxes.forEach(function (box) {
        box.reset(
            this.rnd.integerInRange(0, this.world.width),
            //this.rnd.integerInRange(300, this.world.height - 50)
            this.world.height - 49
        );
    }, this)
};

BasicGame.Game.prototype.fire = function () {
    if (!this.player.alive || this.nextShotAt > this.time.now) {
        return;
    }

    if (this.bulletPool.countDead() === 0) {
        return;
    }

    if (this.bullets > 0)
        this.bullets--;
    else
        return;

    this.nextShotAt = this.time.now + (1000 * 60 / this.bulletFireRate);

    var bullet = this.bulletPool.getFirstExists(false);
    bullet.reset(this.player.x + (this.playerTurned ? -1 : 1) * 15, this.player.y);
    bullet.body.velocity.x = (this.playerTurned ? -1 : 1) * 500;
    bullet.anchor.setTo(0.5, 0.5);
    bullet.scale.setTo(4, 4);
};

BasicGame.Game.prototype.displayHUD = function () {
    this.hud = this.add.group();

    this.hudZombieCounter = this.add.text(660, 500, '', {font: '16px monospace', fill: '#fff'});
    this.hudZombieCounter.fixedToCamera = true;
    this.hudBulletCounter = this.add.text(660, 520, '', {font: '16px monospace', fill: '#fff'});
    this.hudBulletCounter.fixedToCamera = true;

    this.hudHealthText = this.add.text(660, 540, '', {font: '16px monospace', fill: '#fff'});
    this.hudHealthText.fixedToCamera = true;

    this.hudLevel = this.add.text(660, 480, '', {font: '16px monospace', fill: '#fff'});
    this.hudLevel.fixedToCamera = true;

    this.hudFpsCounter = this.add.text(20, 20, '', {font: '16px monospace', fill: '#fff'});
    this.hudFpsCounter.fixedToCamera = true;

    this.hud.add(this.hudZombieCounter);
};

BasicGame.Game.prototype.updateHUD = function () {
    this.hudZombieCounter.text = 'Zombies: ' + this.zombies.countLiving();
    this.hudBulletCounter.text = 'Bullets: ' + this.bullets;
    this.hudHealthText.text = 'Health: ' + this.playerHealth;
    this.hudLevel.text = 'Level: ' + this.level;

    this.hudFpsCounter.text = "FPS: " + this.game.time.fps;
};

BasicGame.Game.prototype.displayEntryMessage = function () {
    this.instructions = this.add.text(400, 500,
        'Use Arrow Keys to Move, Press Z to Fire\n' +
        'Tapping/clicking does both',
        {font: '20px monospace', fill: '#fff', align: 'center'}
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instructionsExpire = this.time.now + 1000;
};