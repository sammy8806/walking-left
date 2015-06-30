WalkingLeftGame = function(game) {
    this.game = game;
};

WalkingLeftGame.prototype.preload = function() {

};

var platforms;

WalkingLeftGame.prototype.create = function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    platforms = game.add.group();
    platforms.enableBody = true;

    // var background = game.add.tileSprite(0, 0, this.game.width, game.world.height - 50, 'ground');

    for (var i = 0; i < Math.ceil(game.world.width / 50); i++) {
        ground = platforms.create(i * 50, game.world.height - 50, 'ground');
        ground.body.immovable = true;
    }

    //  This sprite is using a texture atlas for all of its animation data
    player = game.add.sprite(32, game.world.height - 150, 'player', 'stay_right.png');
    player.scale.setTo(2,2);

    // add animation phases
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

    game.physics.arcade.enable(player);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    game.camera.follow(player);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0)
};

WalkingLeftGame.prototype.render = function() {

};

WalkingLeftGame.prototype.update = function () {
    game.physics.arcade.collide(player, platforms);

    var cursors = game.input.keyboard.createCursorKeys();

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('walk_left');
    }
    else if (cursors.right.isDown) {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('walk_right');
    }
    else {
        //  Stand still
        player.animations.stop();
        player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -150;
    }
};
