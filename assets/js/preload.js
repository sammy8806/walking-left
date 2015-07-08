BasicGame.Preloader = function (game) {
    this.background = null;
    this.preloadBar = null;
    this.ready = false;
};

var worldBounds = {x:0, y:0, width: 20*800, height: 600};

BasicGame.Preloader.prototype.preload = function() {

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
    game.load.atlasJSONHash('zombie', 'assets/img/zombie.png', 'assets/img/zombie.json');

    game.load.image('ground', 'assets/img/street.png');
    game.load.image('sky', 'assets/img/sky.png');

    game.load.image('box', 'assets/sprites/objects/box.png');
    game.load.image('barrel', 'assets/sprites/objects/barrel.png');
    game.load.image('gun', 'assets/sprites/objects/gun.png');
    game.load.image('gun_icon', 'assets/sprites/objects/gun_icon.png');
    game.load.image('medkit', 'assets/sprites/objects/medkit.png');
    game.load.image('projectile', 'assets/sprites/objects/projectile.png');
    game.load.image('sword', 'assets/sprites/objects/sword.png');
    game.load.image('healthbar', 'assets/sprites/objects/healthbar.png');

    //game.load.audio('drums', 'assets/drums2.mp3');
    //game.load.audio('kick', 'assets/kick.wav');
    //game.load.audio('snare', 'assets/snare.wav');
    //game.load.audio('splash', 'assets/splash.wav');
    //game.load.audio('crash', 'assets/crash2.wav');
    //game.load.audio('bgmusic', ['assets/wind2.mp3']);

    game.load.audio('playerHit', 'assets/sounds/Hit_Hurt30.wav');
    game.load.audio('jump', 'assets/sounds/Jump8.wav');
    game.load.audio('pickup', 'assets/sounds/Pickup_Coin6.wav');
    game.load.audio('levelUp', 'assets/sounds/Powerup8.wav');
    game.load.audio('gameLost', 'assets/sounds/Randomize113.wav');
    game.load.audio('bg', ['assets/sounds/bodenstaendig_2000_in_rock_4bit.ogg']);
    //game.load.audio('', 'assets/sounds/');
};

function fileComplete() {
    console.log("fileComplete", game.load.progress);
    this.preloadBar.scale.x = game.load.progress * 0.01;
    this.text.setText("loading "+game.load.progress+"%");
}

BasicGame.Preloader.prototype.create = function() {
    //	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
    this.preloadBar.cropEnabled = false;

    console.log('Starting Menu');
    game.state.start("Menu");

    //console.log('Starting MyGame');
    //game.state.start("MyGame");
};

BasicGame.Preloader.prototype.update = function() {
    console.log(game.load.progress);

    //if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
    //{
    //    this.ready = true;
    //    this.state.start('MainMenu');
    //}
};