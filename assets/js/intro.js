var Intro = function (game) {
    this.game = game;
};

Intro.prototype.preload = function () {
};

Intro.prototype.create = function () {

    var ground = this.createGround();
    ground.visible = false;

    var t = game.add.text(250, 150, 'The Walking XXX');
    t.anchor.set(0);
    t.font = 'Arial';
    t.fontWeight = 'bold';
    t.fontSize = 48;
    t.fill = '#ffffff';
    t.alpha = 0.5;

    t.alpha = 0.1;
    var tw = game.add.tween(t);
    tw.to({alpha: 1.0}, 500, "Linear", true);

    var line = this.createText("A walking Character", 400, 250, 24);
    line.alpha = 0.5;
    line.fill = '#998851';
    this.line = line;
    this.line.bx = line.x;
    this.line.by = line.y;
    this.line.phase = 0;

    var pressSpace = this.createText("? press any key to continue ?", 400, 580, 16);
    pressSpace.alpha = 0.5;
    pressSpace.fill = '#998851';
    pressSpace.visible = false;

    pressSpace.alpha = 0.5;
    var ta1 = game.add.tween(pressSpace);
    ta1.to({alpha: 1.0}, 500, "Linear", true, 0, -1);
    ta1.yoyo(true);

    game.time.events.add(Phaser.Timer.SECOND * 5, function () {
        pressSpace.visible = true;
    });

    //SoundPlayer.init(game);
    //SoundPlayer.playBackgroundMusic();
    //SoundPlayer.playDrums();

    game.input.keyboard.addCallbacks(this, null, function () {
        game.input.keyboard.addCallbacks(this, null, null, null);
        console.log('Starting Menu');
        this.game.state.start("Menu");
    }, null);

    this.gameStartTime = game.time.now;
};

Intro.prototype.createText = function (text, x, y, size) {
    var txt = this.game.add.text(x, y, text);
    txt.anchor.set(0.5);
    txt.align = 'center';
    txt.font = 'Arial';
    txt.fontWeight = 'bold';
    txt.fontSize = size;
    txt.fill = '#ffffff';
    txt.alpha = 1;

    return txt;
};

Intro.prototype.animateLine = function () {

    this.line.scale.x = 1;
    this.line.scale.y = 1;
    var tw1 = game.add.tween(this.line.scale);
    tw1.to({x: 1.2, y: 1.2}, 100, "Linear", true);
    var tw2 = game.add.tween(this.line.scale);
    tw2.to({x: 1, y: 1}, 100, "Linear", false);

    tw1.chain(tw2);

    this.line.angle = this.game.rnd.between(-5, 5);

};

Intro.frameCount = 0;
Intro.startTime = 0;

Intro.prototype.update = function () {

    this.line.x = this.line.bx + this.game.rnd.between(-1, 1);
    this.line.y = this.line.by + this.game.rnd.between(-1, 1);

    ++Intro.frameCount;
    if (++Intro.frameCount == 1) {
        Intro.startTime = game.time.now;
    }

    var runningTime = game.time.now - Intro.startTime;

    //this.line.angle = this.game.rnd.between(-2,2);
};

Intro.prototype.render = function () {
};

Intro.prototype.createGround = function () {

    ground = game.add.group();
    ground.enableBody = true;

    for (var i = 0; i < Math.ceil(game.world.width / 50); i++) {
        g = ground.create(i * 50, game.world.height - 50, 'ground');
        g.body.immovable = true;
    }

    return ground;

};



