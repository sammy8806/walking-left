var line1;
var line2;

var Menu = function(game) {
    this.game = game;
};

Menu.prototype.preload = function() {
};

Menu.prototype.create = function() {

    this.ground = this.createGround();
    this.doll = this.createDoll();

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

Menu.prototype.createText = function(text, x, y, size) {

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

Menu.prototype.update = function() {

    this.updateBeacon();

};

Menu.prototype.updateBeacon = function() {

    var ct = game.time.now - this.gameStartTime;

};

Menu.prototype.render = function() {
};

Menu.prototype.createGround = Intro.prototype.createGround;

Menu.prototype.createSpriteRect = function(x,y,w,h,color) {

    var bodySprite = game.add.sprite(x,y);
    var g = game.add.graphics(0,0);
    g.beginFill(color);
    g.drawRect(-w*0.5, -h*0.5, w, h);
    g.endFill();
    bodySprite.addChild(g);

    return bodySprite;

};


Menu.prototype.createDoll = function() {



};




