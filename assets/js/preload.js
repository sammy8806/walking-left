var Preload = function(game) {
    this.game = game;
};

Preload.prototype.preload = function() {

    this.text = game.add.text(16, 16, 'loading 0%');
    this.text.anchor.set(0);
    this.text.font = 'Arial';
    this.text.fontWeight = 'bold';
    this.text.fontSize = 24;
    this.text.fill = '#ffffff';
    this.text.alpha = 0.5;

    this.preloadBar = game.add.sprite(0, 0, null);
    this.preloadBar.alpha = 0.5;

    var preloadGraphic = game.add.graphics(0, 0);
    preloadGraphic.lineStyle(10, 0xffffff, 1);
    preloadGraphic.moveTo(0, 0);
    preloadGraphic.lineTo(game.width, 0);

    this.preloadBar.addChild(preloadGraphic);
    this.preloadBar.scale.x = 0; // set the bar to the beginning position

    game.load.onFileComplete.add(fileComplete, this);

    game.load.atlasJSONHash('player', 'assets/img/player.png', 'assets/img/player.json');
    game.load.image('ground', 'assets/img/street.png');
    game.load.image('sky', 'assets/img/sky.png');

    //game.load.audio('drums', 'assets/drums2.mp3');
    //game.load.audio('kick', 'assets/kick.wav');
    //game.load.audio('snare', 'assets/snare.wav');
    //game.load.audio('splash', 'assets/splash.wav');
    //game.load.audio('crash', 'assets/crash2.wav');
    //game.load.audio('bgmusic', ['assets/wind2.mp3']);

};

function fileComplete() {
    console.log("fileComplete", game.load.progress);
    this.preloadBar.scale.x = game.load.progress * 0.01;
    this.text.setText("loading "+game.load.progress+"%");
}

Preload.prototype.create = function() {
    console.log('Starting Intro');
    game.state.start("Intro");
};

Preload.prototype.update = function() {
    console.log(game.load.progress);
};