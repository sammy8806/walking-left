BasicGame.Game = function (game) {
    var weapon = {};

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
    this.zombieDelay = 3000;

    this.hudZombieCounter = null;
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
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.platforms = game.add.group();
    this.platforms.enableBody = true;

    // var background = game.add.tileSprite(0, 0, this.game.width, game.world.height - 50, 'ground');

    for (var i = 0; i < Math.ceil(game.world.width / 50); i++) {
        ground = this.platforms.create(i * 50, game.world.height - 50, 'ground');
        ground.body.immovable = true;
}

    this.loadPlayer();
    this.loadZombies();

    this.boxes = game.add.group();
    this.boxes.enableBody = true;
    this.generateBox(100, game.world.height - 100);

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
    this.game.physics.arcade.collide(this.boxes, this.platforms);

    this.game.physics.arcade.collide(this.player, this.platforms);
    this.game.physics.arcade.collide(this.player, this.boxes);

    this.game.physics.arcade.collide(this.zombies, this.platforms);
    this.game.physics.arcade.collide(this.zombies, this.boxes);

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

    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.fire();
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.Z)) {
        this.spawnZombie();
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

    this.updateHUD();

};

BasicGame.Game.prototype.quitGame = function () {
    this.state.start('MainMenu');
};

BasicGame.Game.prototype.playerHit = function(player, enemy) {
    if(player.alive) {
        this.playerHealth -= 15;
        player.body.velocity.x = -800;

        if(this.playerHealth <= 0) {
            var killedPlayer = this.add.sprite(player.x, player.y, 'player');
            player.kill();
            killedPlayer.anchor.setTo(0.5, 0.5);
            killedPlayer.animations.add('die', [
                "dying_1.png",
                "dying_2.png",
                "dying_2.png"
            ], 10);
            killedPlayer.play('die', 15);
        }
    }
};

BasicGame.Game.prototype.zombieHitWithGun = function (bullet, enemy) {
    bullet.kill();
    enemy.kill();
};

BasicGame.Game.prototype.loadPlayer = function () {
    //  This sprite is using a texture atlas for all of its animation data
    this.player = this.game.add.sprite(32, game.world.height - 150, 'player', 'stay_right.png');
    //player.scale.setTo(2, 2);

    // add animation phases
    this.player.animations.add('walk_right', [
        "stay_right.png",
        "run_right_1.png",
        "stay_right.png",
        "run_right_2.png"
    ], 10);
    this.player.animations.add('walk_left', [
        "stay_left.png",
        "run_left_1.png",
        "stay_left.png",
        "run_left_2.png"
    ], 10);

    this.game.physics.arcade.enable(this.player);

    this.player.body.bounce.y = 0.15;
    this.player.body.gravity.y = 600;
    this.player.body.collideWorldBounds = true;
    this.player.anchor.setTo(0.5, 0.5);

    return this.player;
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
            'run_left.png'  ,
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
        if(zombie == undefined)
            return;

        zombie.reset(
            //this.player.x + Math.random() * (game.world.width - this.player.x),
            //this.player.x + Math.random() * (this.player.x),
            this.rnd.integerInRange(this.player.x + 20, this.player.x + 600),
            //Math.random() * game.world.height - this.player.y
            505
        );
        zombie.play('run_left');
        zombie.body.bounce.y = 0.2;
        zombie.body.gravity.y = 30;
        zombie.body.velocity.x = this.level * -3 + -15;
};

BasicGame.Game.prototype.generateBox = function (x, y) {
    var box = this.boxes.create(x, y, 'box');
    box.enableBody = true;

    this.game.physics.enable(box, Phaser.Physics.ARCADE);
    box.body.collideWorldBounds = true;
    box.body.immovable = true;

    box.body.gravity.y = 0;

    return box;
};

BasicGame.Game.prototype.fire = function () {
    if (!this.player.alive || this.nextShotAt > this.time.now) {
        return;
    }

    if (this.bulletPool.countDead() === 0) {
        return;
    }

    if(this.bullets > 0)
        this.bullets--;
    else
        return;

    this.nextShotAt = this.time.now + (1000 * 60 / this.bulletFireRate);
    console.log({now: this.time.now, next: this.nextShotAt});

    var bullet = this.bulletPool.getFirstExists(false);
    bullet.reset(this.player.x + (this.playerTurned ? -1 : 1) * 15, this.player.y);
    bullet.body.velocity.x = (this.playerTurned ? -1 : 1) * 500;
    bullet.anchor.setTo(0.5, 0.5);
    bullet.scale.setTo(4, 4);
};

BasicGame.Game.prototype.displayHUD = function () {
    this.hud = this.add.group();

    this.hudZombieCounter = this.add.text(660,500, '', {font: '16px monospace', fill: '#fff'});
    this.hudZombieCounter.fixedToCamera = true;
    this.hudBulletCounter = this.add.text(660,520, '', {font: '16px monospace', fill: '#fff'});
    this.hudBulletCounter.fixedToCamera = true;

    this.hudHealthText = this.add.text(660,540, '', {font: '16px monospace', fill: '#fff'});
    this.hudHealthText.fixedToCamera = true;

    this.hud.add(this.hudZombieCounter);
};

BasicGame.Game.prototype.updateHUD = function () {
    this.hudZombieCounter.text = 'Zombies: ' +  this.zombies.countLiving();
    this.hudBulletCounter.text = 'Bullets: ' + this.bullets;
    this.hudHealthText.text = 'Health: ' + this.playerHealth;
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