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

    this.zombies = null; this.zombieArr = [];
    this.boxes = null;
    this.player = null;
    this.platforms = null;

    this.level = 1;
};

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

    this.zombies = game.add.group();
    this.zombies.enableBody = true;
    this.loadZombie(180, game.world.height - 150);

    this.boxes = game.add.group();
    this.boxes.enableBody = true;
    this.generateBox(100, game.world.height - 100);

    // game.physics.arcade.moveToObject(zombie, player);

    this.game.camera.follow(this.player);
    this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    this.game.camera.focusOnXY(0, 0);
};

//game.physics.arcade.modeToObject(Zomibie,Player);  sorgt dafür, das sich der this.zombie dem spieler nähert
BasicGame.Game.prototype.render = function () {
    game.debug.body(this.player);
    game.debug.body(this.zombies);
    game.debug.body(this.boxes);
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
        this.player.body.velocity.x = -playerBaseRunVelocity + playerBaseRunVelocity * (this.level/100);
        this.player.animations.play('walk_left');
    }
    else if (this.cursors.right.isDown) {
        this.player.body.velocity.x = playerBaseRunVelocity + playerBaseRunVelocity * (this.level/100);
        this.player.animations.play('walk_right');
    } else {
        this.player.animations.stop();
    }

    //  Allow the player to jump if they are touching the ground.
    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.body.velocity.y = -playerBaseJumpVelocity;
    }

    this.physics.arcade.overlap(
        this.player, this.zombies, this.zombieHitWithGun, null, this
    );


    if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.fire();
    }

    if(this.input.keyboard.isDown(Phaser.Keyboard.Z)) {
        this.loadZombie(Math.random() * game.world.width, Math.random() * game.world.height - 80);
    }



};

BasicGame.Game.prototype.quitGame = function (pointer) {
    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');
};

BasicGame.Game.prototype.zombieHitWithGun = function(bullet, enemy) {
    bullet.kill();
    enemy.kill();
};

BasicGame.Game.prototype.loadPlayer = function() {
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

BasicGame.Game.prototype.loadZombie = function(x, y) {
    var zombie = this.zombies.create(x, y, 'zombie', 'stay_left.png');
    zombie.enableBody = true;

    this.game.physics.enable(zombie, Phaser.Physics.ARCADE);

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

    zombie.body.collideWorldBounds = true;
    zombie.body.immovable = true;

    zombie.body.bounce.y = 0.2;
    zombie.body.gravity.y = 30;
    zombie.body.velocity.x = this.level * -15;
    zombie.anchor.setTo(0.5, 0.5);

    this.zombieArr[this.zombieArr.length +1] = zombie;

    zombie.animations.play('run_left');

    return this.zombies;
};

BasicGame.Game.prototype.generateBox = function(x, y) {
    var box = this.boxes.create(x, y, 'box');
    box.enableBody = true;

    this.game.physics.enable(box, Phaser.Physics.ARCADE);
    box.body.collideWorldBounds = true;
    box.body.immovable = true;

    box.body.gravity.y = 0;

    return box;
};
