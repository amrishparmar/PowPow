
PowPow.Game = function (game) {

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

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

var player;
var platforms;

var keys;


PowPow.Game.prototype = {

    preload: function() {
        this.load.image('city', 'images/maps/city/city.jpg');
        this.load.image('ground', 'images/maps/city/city_platform.png');
        this.load.image('player', 'images/player.png');
    },

    create: function () {
        this.add.tileSprite(0, 0, 1600, 1000, 'city');
        this.world.setBounds(0, 0, 1600, 1000);
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        platforms = this.add.group();
        platforms.enableBody = true;
        var ground = platforms.create(0, this.world.height - 64, 'ground');
        ground.scale.setTo(4.5, 2);
        ground.body.immovable = true;
        
        var ledge = platforms.create(-150, 400, 'ground');
        ledge.body.immovable = true;
    
        ledge = platforms.create(240, 615, 'ground');
        ledge.body.immovable = true;
    
        ledge = platforms.create(500, 250, 'ground');
        ledge.body.immovable = true;
    
        ledge = platforms.create(700, 750, 'ground');
        ledge.body.immovable = true;
        
        ledge = platforms.create(900, 500, 'ground');
        ledge.body.immovable = true;
        
        ledge = platforms.create(1300, 700, 'ground');
        ledge.body.immovable = true;
        
        ledge = platforms.create(1500, 300, 'ground');
        ledge.body.immovable = true;
        
        player = this.add.sprite(32, this.world.height - 150, 'player');
        this.physics.arcade.enable(player);
        
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 600;
        player.body.collideWorldBounds = true;
        
        keys = this.input.keyboard.addKeys({ 
            'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D 
        });
        
        this.camera.follow(player);

    },

    update: function () {
        this.physics.arcade.collide(player, platforms);
        
        player.body.velocity.x = 0;
        
        if (keys.left.isDown) {
            player.body.velocity.x = -300;
        }
        else if (keys.right.isDown) {
            player.body.velocity.x = 300;
        }
        else {
            // player.animations.stop();
        }
        
        if (keys.up.isDown && player.body.touching.down) {
            player.body.velocity.y = -600;
        }
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};
