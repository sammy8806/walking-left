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
    this.playerBullets = 20; // Get this at spawn
    this.playerHealth = 100;

    this.bulletFireRateBase = 60 * 2; // shots per 60 seconds
    this.debugMode = false;

    // Internals
    this.nextShotAt = 0;
    this.bullets = 0;

    this.message = null;
    this.messageExpire = null;
    this.playerTurned = false;

    this.nextZombieAt = 0;
    this.zombieDelay = 3000; // in msec

    this.nextHealthkitAt = 0;
    this.healthkitDelay = 6000; // in msec
    this.heathkitPossibility = 20; // in percent
    this.medkits = null;

    this.nextAmmukitAt = 0;
    this.ammukitDelay = 6000; // in msec
    this.ammukitPossibility = 40; // in percent
    this.ammukits = null;

    this.hudZombieCounter = null;
    this.hudHealthbar = null;

    this.gun = null;

    this.isEnded = false;
    this.bgmusic = null;
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
    this.bgmusic = game.add.audio('bg');
    this.bgmusic.play();

    this.time.advancedTiming = true;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    var background = game.add.tileSprite(0, -50, this.game.world.width, this.game.world.height, 'sky');

    this.platforms = game.add.group();
    this.platforms.enableBody = true;

    this.playerGroup = game.add.group();
    this.playerGroup.enableBody = true;

    for (var i = 0; i < Math.ceil(game.world.width / 50); i++) {
        ground = this.platforms.create(i * 50, game.world.height - 50, 'ground');
        ground.body.immovable = true;
    }

    this.bullets = this.playerBullets;

    this.loadPlayer();
    this.loadZombies();
    this.loadHealthkits();
    this.loadAmmukits();

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

    this.game.camera.follow(this.player);
    this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 390, 300);
    this.game.camera.focusOnXY(0, 0);

    this.displayHUD();

    this.showMessage('Use Arrow Keys to Move, Press Z to Fire\nTapping/clicking does both', 3);
};

//game.physics.arcade.modeToObject(Zomibie,Player);  sorgt dafür, das sich der this.zombie dem spieler nähert
BasicGame.Game.prototype.render = function () {
    //game.debug.bodyInfo(this.player, 30, 30);
};

BasicGame.Game.prototype.update = function () {
    if (this.isEnded)
        return;

    this.game.physics.arcade.collide(this.medkits, this.boxes);
    this.game.physics.arcade.collide(this.medkits, this.platforms);

    this.game.physics.arcade.collide(this.ammukits, this.boxes);
    this.game.physics.arcade.collide(this.ammukits, this.platforms);

    this.game.physics.arcade.collide(this.player, this.platforms);
    this.game.physics.arcade.collide(this.player, this.boxes);

    this.game.physics.arcade.collide(this.zombies, this.platforms);
    this.game.physics.arcade.collide(this.zombies, this.boxes);
    this.game.physics.arcade.collide(this.zombies, this.zombies);

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
        var audio = this.playAudio('jump');
        audio.volume = 0.8;
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

    this.physics.arcade.overlap(
        this.player, this.ammukits, this.playerAmmukit, null, this
    );

    if (this.input.keyboard.isDown(Phaser.Keyboard.Z) && this.debugMode) {
        this.spawnZombie();
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.M) && this.debugMode) {
        this.spawnHealthkit();
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.A) && this.debugMode) {
        this.spawnAmmukit();
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.L) && this.debugMode) {
        this.level++;
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.fire();
    }

    if (this.message.exists && this.time.now > this.messageExpire) {
        this.message.destroy();
    }

    if (this.nextZombieAt < this.time.now && this.zombies.countDead() > 0) {
        this.nextZombieAt = this.time.now + this.zombieDelay;
        this.spawnZombie();
    }

    if (this.nextHealthkitAt < this.time.now && this.medkits.countDead() > 0) {
        this.nextHealthkitAt = this.time.now + this.healthkitDelay;
        var rnd = Math.random();
        if (this.heathkitPossibility / 100 >= rnd) {
            var medkit = this.spawnHealthkit();
            console.log('hk (' + this.heathkitPossibility + ' ; ' + rnd + ') at (' + medkit.x + ',' + medkit.y + ')');
        } else {
            console.log('no hk (' + this.heathkitPossibility + ' ; ' + rnd + ')');
        }
    }

    if (this.nextAmmukitAt < this.time.now && this.ammukits.countDead() > 0) {
        this.nextAmmukitAt = this.time.now + this.ammukitDelay;
        var rnd = Math.random();
        if (this.ammukitPossibility / 100 >= rnd) {
            var ammukit = this.spawnAmmukit();
            console.log('hk (' + this.ammukitPossibility + ' ; ' + rnd + ') at (' + ammukit.x + ',' + ammukit.y + ')');
        } else {
            console.log('no hk (' + this.ammukitPossibility + ' ; ' + rnd + ')');
        }
    }

    if (this.player.x > this.level * 1200) {
        this.playAudio('levelUp');
        this.level++;
    }

    if (this.level > 100) {
        this.showMessage("Congratz for clearing the Game ;-)", 10);
        this.playAudio('gameWon');
        this.isEnded = true;
    }

    this.updateHUD();
};

BasicGame.Game.prototype.quitGame = function () {
    this.state.start('MainMenu');
};

BasicGame.Game.prototype.playerHealthkit = function (player, healthkit) {
    this.playerHealth += 40;
    healthkit.kill();
    this.playAudio('pickup');
};

BasicGame.Game.prototype.playerAmmukit = function (player, ammukit) {
    this.bullets += 10 + (3 * this.level);
    ammukit.kill();
    this.playAudio('pickup');
};

BasicGame.Game.prototype.playerHit = function (player, enemy) {
    if (player.alive) {
        this.playerHealth -= 15;
        player.body.velocity.x = -1400;

        if (this.playerHealth <= 0) {
            var killedPlayer = this.add.sprite(player.x, player.y, 'player');
            player.kill();
            this.bgmusic.stop();

            game.add.audio('gameLost').play();

            this.showMessage("Congratz for NOT clearing the Game :(", 10);

            killedPlayer.anchor.setTo(0.5, 0.5);
            killedPlayer.animations.add('die', [
                "dying_1.png",
                "dying_2.png"
            ], 2);
            killedPlayer.play('die', 2);

            this.isEnded = true;
        } else {
            this.playAudio('playerHit');
        }
    }
};

BasicGame.Game.prototype.zombieHitWithGun = function (bullet, enemy) {
    bullet.kill();
    enemy.kill();
};

BasicGame.Game.prototype.loadPlayer = function () {
    // return this.loadPlayerAt(32, game.world.height - 150);
    return this.loadPlayerWithGunAt(32, game.world.height - 150);
    // return this.player = new BasicGame.Player(game.world.centerX, game.world.centerY, this.game);
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
        this.rnd.integerInRange(this.player.x + 50, this.player.x + 700),
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

BasicGame.Game.prototype.loadAmmukits = function () {
    this.ammukits = this.add.group();
    this.ammukits.enableBody = true;
    this.ammukits.physicsBodyType = Phaser.Physics.ARCADE;
    this.ammukits.createMultiple(100, 'gun_icon');
    this.ammukits.setAll('anchor.x', 0.5);
    this.ammukits.setAll('anchor.y', 0.5);
    this.ammukits.setAll('outOfBoundsKill', false);
    this.ammukits.setAll('checkWorldBounds', true);
};

BasicGame.Game.prototype.spawnHealthkit = function () {
    var medkit = this.medkits.getFirstExists(false);
    if (medkit == undefined)
        return;

    medkit.reset(
        this.rnd.integerInRange(this.player.x + 20, this.player.x + 600),
        0
    );
    medkit.body.bounce.y = 0.2;
    medkit.body.gravity.y = 400;

    return medkit;
};

BasicGame.Game.prototype.spawnAmmukit = function () {
    var ammukit = this.ammukits.getFirstExists(false);
    if (ammukit == undefined)
        return;

    ammukit.reset(
        this.rnd.integerInRange(this.player.x + 20, this.player.x + 600),
        0
    );
    ammukit.body.bounce.y = 0.2;
    ammukit.body.gravity.y = 400;

    return ammukit;
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

    if (this.bullets > 0) {
        this.bullets--;
        this.playAudio("shoot");
    }
    else
        return;

    this.nextShotAt = this.time.now + (1000 * 60 / ( this.bulletFireRateBase * ( this.level * 0.4)));

    var bullet = this.bulletPool.getFirstExists(false);
    bullet.reset(this.player.x + (this.playerTurned ? -1 : 1) * 15, this.player.y);
    bullet.body.velocity.x = (this.playerTurned ? -1 : 1) * 500;
    bullet.anchor.setTo(0.5, 0.5);
    bullet.scale.setTo(4, 4);
};

BasicGame.Game.prototype.displayHUD = function () {
    this.hud = this.add.group();
    this.hud.fixedToCamera = true;

    this.hudBulletCounter = this.add.text(30, 52, '', {font: '20px monospace', fill: '#fff'});
    this.hudHealthText = this.add.text(30, 30, '', {font: '20px monospace', fill: '#fff'});
    this.hudLevel = this.add.text(660, 480, '', {font: '16px monospace', fill: '#fff'});

    var keyText = this.add.text(this.camera.width - 120, 40, 'Jump\t[Space]', {
        font: '16px monospace',
        fill: '#fff',
        align: 'right'
    });

    this.hudHealthbar = this.add.group();
    this.hud.add(this.hudHealthbar);
    this.hud.add(this.hudBulletCounter);
    this.hud.add(this.hudHealthText);
    this.hud.add(this.hudLevel);
    this.hud.add(keyText);

    if (this.debugMode) {
        this.hudZombieCounter = this.add.text(660, 500, '', {font: '16px monospace', fill: '#fff'});
        this.hudFpsCounter = this.add.text(this.camera.width - 80, 20, '', {
            font: '16px monospace',
            fill: '#fff',
            align: 'right'
        });
        this.hudDebugText = this.add.text(this.camera.width - 120, 100, 'MedKit\t[M]\nAmmu\t[A]\nZombie\t[T]\nLevel\t[L]', {
            font: '16px monospace',
            fill: '#fff',
            align: 'right'
        });

        this.hud.add(this.hudZombieCounter);
        this.hud.add(this.hudFpsCounter);
        this.hud.add(this.hudDebugText);
    }
};

BasicGame.Game.prototype.updateHUD = function () {

    this.hudBulletCounter.text = 'Bullets: ' + this.bullets;
    this.hudHealthText.text = 'Health: ' + this.playerHealth;
    this.hudLevel.text = 'Level: ' + this.level;

    if (this.debugMode) {
        this.hudZombieCounter.text = 'Zombies: ' + this.zombies.countLiving();
        this.hudFpsCounter.text = "FPS: " + this.game.time.fps;
    }

    // TODO: Performance Killer
    //this.hudHealthbar = this.add.group();
    //var g = game.add.graphics(25, 7);
    //g.beginFill(0xff0000);
    //g.drawRect(0, 0, 120, 22);
    //g.endFill();
    //this.hudHealthbar.addChild(g);
    //
    //this.hudHealthbar.create(0, 0, 'healthbar');
    //this.hudHealthbarContent = game.add.group();
    //this.hudHealthbar.add(this.hudHealthbarContent);
};

BasicGame.Game.prototype.showMessage = function (message, expire) {
    if (message == undefined) {
        expire = 1000;
    }
    this.message = this.add.text(400, 500,
        message,
        {font: '20px monospace', fill: '#fff', align: 'center'}
    );
    this.message.anchor.setTo(0.5, 0.5);
    this.message.fixedToCamera = true;
    this.messageExpire = this.time.now + expire * 1000;
};

BasicGame.Game.prototype.playAudio = function (name) {
    var audio = game.add.audio(name);
    audio.play();
    return audio;
};
