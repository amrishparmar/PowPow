(function() {

  var GameScene = function(game) {
    // phaser properties
    this.game; //  a reference to the currently running game (Phaser.Game)
    this.add; //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera; //  a reference to the game camera (Phaser.Camera)
    this.cache; //  the game cache (Phaser.Cache)
    this.input; //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load; //  for preloading assets (Phaser.Loader)
    this.math; //  lots of useful common math operations (Phaser.Math)
    this.sound; //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage; //  the game stage (Phaser.Stage)
    this.time; //  the clock (Phaser.Time)
    this.tweens; //  the tween manager (Phaser.TweenManager)
    this.state; //  the state manager (Phaser.StateManager)
    this.world; //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics; //  the physics manager (Phaser.Physics)
    this.rnd; //  the repeatable random number generator (Phaser.RandomDataGenerator)
    this.world;

    this.kills;
    this.killsText = {};
    // our own properties
    this.weapons;
    this.weapons2;
    this.currentWeapon;
    this.playerHealthBar;

    // sounds
    this.shoot1;
    this.shootShotgun;
    this.reloadShotgun;
    this.fx;
    this.shotGunFx;
    this.reloadShotgunFx;
    this.grenade;
  };

  // Preload
  GameScene.prototype.preload = function() {

    // addon mine -----------
    this.load.image('city', 'assets/maps/city_bg.jpg');
    this.load.image('ground', 'assets/maps/city_platform.png');
    this.load.image('bullet', 'assets/images/bullet.png');
    this.load.image('shrapnel', 'assets/images/shrapnel.png');
    this.load.image('grenade', 'assets/images/grenade.png');
    // Player
    this.load.spritesheet('player', 'assets/sprites/metroid_sprite.png', 60, 48);
    // Fonts
    this.load.bitmapFont('default', 'assets/fonts/default.png', 'assets/fonts/default_desktop.xml');

    //handgun
    this.load.audio('shoot1', ['assets/sounds/sfx/shooting.wav']);
    this.load.audio('grenade', ['assets/sounds/sfx/grenade.wav']);

    //shotgun
    this.load.audio('shootShotgun', ['assets/sounds/sfx/shooting_2.wav']);
    this.load.audio('reloadShotgun', ['assets/sounds/sfx/shotgun_reload.wav']);

    // Disable pause on blur
    this.stage.disableVisibilityChange = true;
    this.game.pageAlignHorizontally = true;
    this.game.pageAlignVertically = true;
    this.game.scale.refresh();
  };


  var Bullet = function(game, key) {
    Phaser.Sprite.call(this, game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    this.anchor.set(0.5);

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;

    this.tracking = false;
    this.scaleSpeed = 0;
  };

  Bullet.prototype = Object.create(Phaser.Sprite.prototype);
  Bullet.prototype.constructor = Bullet;

  Bullet.prototype.fire = function(x, y, angle, speed, gx, gy, id) {
    gx = gx || 0;
    gy = gy || 0;

    this.reset(x, y);
    this.scale.set(1);
    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);
    this.angle = angle;
    this.body.gravity.set(gx, gy);
    this.id = id;
  };

  Bullet.prototype.update = function() {
    if (this.tracking) {
      this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }

    if (this.scaleSpeed > 0) {
      this.scale.x += this.scaleSpeed;
      this.scale.y += this.scaleSpeed;
    }
  };

  var Weapon = {};

  //////// Auto handgun ////////

  Weapon.AutoHG = function(game) {
    Phaser.Group.call(this, game, game.world, 'AutoHG', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1600;
    this.fireRate = 400;

    for (var i = 0; i < 16; ++i) {
      this.add(new Bullet(game, 'bullet'), true);

    }

    return this;
  };

  Weapon.AutoHG.prototype = Object.create(Phaser.Group.prototype);
  Weapon.AutoHG.prototype.constructor = Weapon.AutoHG;

  /* fire the AutoHG weapon */
  Weapon.AutoHG.prototype.fire = function(sourceX, sourceY, angle, id) {
    if (this.game.time.time < this.nextFire) {
      return;
    }
    var x = sourceX + 16;
    var y = sourceY + 16;

    game.fx.play();


    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 0, id);

    this.nextFire = this.game.time.time + this.fireRate;

  };

  //////// Machine gun ////////

  Weapon.MachineGun = function(game) {
    Phaser.Group.call(this, game, game.world, 'MachineGun', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 2000;
    this.fireRate = 100;

    for (var i = 0; i < 32; ++i) {
      this.add(new Bullet(game, 'bullet'), true);
    }

    return this;
  };

  Weapon.MachineGun.prototype = Object.create(Phaser.Group.prototype);
  Weapon.MachineGun.prototype.constructor = Weapon.MachineGun;

  /* fire the MachineGun weapon */
  Weapon.MachineGun.prototype.fire = function(sourceX, sourceY, angle, id) {
    if (this.game.time.time < this.nextFire) {
      return;
    }
    var x = sourceX + 16;
    var y = sourceY + 16 + this.game.rnd.between(-4, 4);

    game.fx.play();
    this.getFirstExists(false).fire(x, y, angle + this.game.rnd.between(-5, 5), this.bulletSpeed, 0, 0, id);

    this.nextFire = this.game.time.time + this.fireRate;
  };

  //////// Shotgun ////////

  Weapon.Shotgun = function(game) {
    Phaser.Group.call(this, game, game.world, 'Shotgun', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1200;
    this.fireRate = 800;

    for (var i = 0; i < 64; ++i) {
      this.add(new Bullet(game, 'shrapnel'), true);
    }

    return this;
  };

  Weapon.Shotgun.prototype = Object.create(Phaser.Group.prototype);
  Weapon.Shotgun.prototype.constructor = Weapon.Shotgun;

  /* fire the Shotgun weapon */
  Weapon.Shotgun.prototype.fire = function(sourceX, sourceY, angle, id) {
    if (this.game.time.time < this.nextFire) {
      return;
    }
    var x = sourceX + 16;
    var y = sourceY + 16;
    game.shotGunFx.play();
    game.reloadShotgunFx.play();
    this.getFirstExists(false).fire(x, y, angle + this.game.rnd.between(-10, 5), this.bulletSpeed, 0, 0, id);
    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 0, id);
    this.getFirstExists(false).fire(x, y, angle + this.game.rnd.between(5, 10), this.bulletSpeed, 0, 0, id);

    this.nextFire = this.game.time.time + this.fireRate;
  };

  //////// GrenadeLauncher ////////

  Weapon.GrenadeLauncher = function(game) {
    Phaser.Group.call(this, game, game.world, 'GrenadeLauncher', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 700;
    this.fireRate = 1250;

    for (var i = 0; i < 8; ++i) {
      this.add(new Bullet(game, 'grenade'), true);
    }

    return this;
  };

  Weapon.GrenadeLauncher.prototype = Object.create(Phaser.Group.prototype);
  Weapon.GrenadeLauncher.prototype.constructor = Weapon.GrenadeLauncher;

  /* fire the GrenadeLauncher weapon */
  Weapon.GrenadeLauncher.prototype.fire = function(sourceX, sourceY, angle, id) {
    if (this.game.time.time < this.nextFire) {
      return;
    }
    var x = sourceX + 16;
    var y = sourceY + 16;

    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 600, 0, id);

    this.nextFire = this.game.time.time + this.fireRate;
  };

  // Create
  GameScene.prototype.create = function() {

    // Start physics
    phaser.physics.startSystem(Phaser.Physics.ARCADE);
    phaser.physics.arcade.OVERLAP_BIAS = 10;
    this.add.tileSprite(0, 0, 1600, 1000, 'city');
    this.world.setBounds(0, 0, 1600, 1000);
    game.kills = 0;
    platforms = this.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(0, this.world.height - 64, 'ground');
    ground.scale.setTo(4.5, 2);
    ground.body.immovable = true;

    // create a bunch of platforms based on the game design docs
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

    // add audio to game
    //handgun
    game.fx = this.game.add.audio('shoot1');

    game.shotGunFx = this.game.add.audio('shootShotgun');
    game.reloadShotgunFx = this.game.add.audio('reloadShotgun');
    game.grenade = this.game.add.audio('grenade');

    //------------------------------------
    // configuration for health bar
    var barConfig = {
      x: 150,
      y: 35,
      width: 100,
      height: 20,
      isFixedToCamera: true
    };
    // Healthbar
    game.playerHealthBar = new HealthBar(this.game, barConfig);
    game.killsText = phaser.add.text(800, 60, "Kills: " + game.kills, {
      font: "24px Arial",
      fill: "#76EE00",
    });
    game.killsText.fixedToCamera = true;
    //------------------------------------

    // Collision group
    game.groups.collisionGroup = phaser.add.group();
    game.groups.collisionGroup.enableBody = true;
    game.groups.collisionGroup.physicsBodyType = Phaser.Physics.ARCADE;

    // Weapons
    game.weapons = [];
    game.weapons.push(new Weapon.AutoHG(this));
    game.weapons.push(new Weapon.MachineGun(this));
    game.weapons.push(new Weapon.Shotgun(this));
    game.weapons.push(new Weapon.GrenadeLauncher(this));

    // Player
    var user_id;
    user_id = game.user._id;

    game.localPlayer = new game.entities.Player({
      _id: user_id,
      name: game.user.username || 'Local player',
      group: game.groups.collisionGroup,
    });
    game.players[user_id] = game.localPlayer;

    // Logon event
    game.socket.emit('logon', {
      _id: user_id,
      x: game.localPlayer.sprite.body.x,
      y: game.localPlayer.sprite.body.y
    });

    // Socket.io events
    this.addSocketListeners();
  };

  GameScene.prototype.addSocketListeners = function() {
    var self = this;

    game.socket.on('alert', function(data) {
      alert(data.message);
    });

    game.socket.on('disconnect', function(data) {
      // location.href = '/signout';
      self.state.start('Login');
    });

    // New player connected
    game.socket.on('connected', function(player) {
      console.log('New player online: ', player);
      self.addRemotePlayer(player);
    });

    // Remove player
    game.socket.on('disconnected', function(player) {
      if (player && game.players[player._id]) {
        game.players[player._id].playerName.destroy();
        game.players[player._id].sprite.kill();
        delete game.players[player._id];
      }
    });

    // Player has moved
    game.socket.on('moved', function(_player) {
      self.movePlayer(_player);
    });

    // Players has shot 
    game.socket.on('shotFired', function(bullet) {
      self.addRemoteBullet(bullet);

    });

    game.socket.on('kills', function(bullet) {
      var m = game.user._id;
      if (m == bullet) {
        game.kills += 1;
      }
    });

    // Get online players
    game.socket.on('players', function(players) {
      _.each(players, function(player) {
        self.addRemotePlayer(player);
      });
    });
  };

  // Update
  function collisionHandler(sp1, sp2) {}

  GameScene.prototype.updatePlayers = function() {
    _.each(game.players, function(player) {
      player.update && player.update();
    });


  };

  // Main update
  GameScene.prototype.update = function(player) {
    this.updatePlayers();

    for (var i = 0; i < game.weapons.length; ++i) {
      phaser.physics.arcade.collide(game.weapons[i], platforms, function(bullet, platform) {
        bullet.kill();
        if (i == 3) {

          game.grenade.play();
        }
      });
    }


    game.killsText.setText("Kills: " + game.kills);
  };

  GameScene.prototype.render = function() {
    if (game.localPlayer.sprite) {
      phaser.debug.spriteCoords(game.localPlayer.sprite, 20, 20);
    }
  };

  GameScene.prototype.addRemotePlayer = function(player) {
    game.players[player._id] = new game.entities.Character({
      _id: player._id,
      x: player.x,
      y: player.y,
      name: player.name || 'Remote player'
    });
  };

  GameScene.prototype.addRemoteBullet = function(bullet) {
    game.weapons[bullet.currentWeapon].fire(bullet.x, bullet.y, bullet.angle, bullet._id);

  };

  GameScene.prototype.moveRemotePlayer = function(player, data) {
    player.destinationX = data.x;
    player.destinationY = data.y;
    player.direction = data.direction;
  };

  GameScene.prototype.movePlayer = function(_player) {
    var player = game.players[_player._id];
    if (player) {
      this.moveRemotePlayer(player, _player);
    }
    else {
      this.addRemotePlayer(_player);
    }
  };

  // Render
  GameScene.prototype.render = function() {};

  // Logout
  GameScene.prototype.logout = function() {
    this.state.start('Login');
  };

  window.onfocus = function() {
    _.each(game.players, function(player) {
      if (player.type === 'remote') {
        phaser.add.tween(player.sprite.body).to({
          x: player.destinationX,
          y: player.destinationY
        }, 1, Phaser.Easing.Linear.None, true);
      }
    });
  };

  // game.scenes.Game = GameScene;
  phaser.state.add('Game', GameScene);
})();