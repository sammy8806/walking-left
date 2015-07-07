BasicGame.MainMenu = function (game) {
    this.music = null;
    this.playButton = null;
};

BasicGame.MainMenu.prototype.preload = function() {
};

BasicGame.MainMenu.prototype.create = function() {

    this.ground = this.createGround();

    this.ground.alpha = 0;
    var tw1 = game.add.tween(this.ground);
    tw1.to({ alpha: 1.0 }, 1000, "Linear", true);

    var t = game.add.text(250, 150, 'The Walking XXX');
    t.anchor.set(0);
    t.font = 'Arial';
    t.fontWeight = 'bold';
    t.fontSize = 48;
    t.fill = '#ffffff';
    t.alpha = 0.5;

    this.gameStartTime = game.time.now;

    game.time.events.add(750, function() {
        game.input.keyboard.addCallbacks(this, null, function() {
            game.input.keyboard.addCallbacks(this, null, null, null);
            console.log('Starting MyGame');
            this.game.state.start("MyGame");
        }, null);
    });

};

BasicGame.MainMenu.prototype.createText = function(text, x, y, size) {

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

BasicGame.MainMenu.prototype.update = function() {

    this.updateBeacon();

};

BasicGame.MainMenu.prototype.updateBeacon = function() {
    var ct = game.time.now - this.gameStartTime;
};

BasicGame.MainMenu.prototype.render = function() {
};

BasicGame.MainMenu.prototype.createSpriteRect = function(x,y,w,h,color) {

    var bodySprite = game.add.sprite(x,y);
    var g = game.add.graphics(0,0);
    g.beginFill(color);
    g.drawRect(-w*0.5, -h*0.5, w, h);
    g.endFill();
    bodySprite.addChild(g);

    return bodySprite;
};

BasicGame.MainMenu.prototype.createGround = function () {

    ground = game.add.group();
    ground.enableBody = true;

    for (var i = 0; i < Math.ceil(game.world.width / 50); i++) {
        g = ground.create(i * 50, game.world.height - 50, 'ground');
        g.body.immovable = true;
    }

    return ground;

};