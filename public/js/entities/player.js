(function() {
    // movement speed
    var baseVelocity = 300;

    function Player(params, game) {
        var self = this;
        self._id = params._id;
        self.name = params.name;
        self.type = 'local';
        self.direction = params.direction || 'right';
        self.currentWeapon = 0;
        self.health = 100;
        self.deaths = 0;
        self.deathText = {};
        self.healthText = {};
    
        // set the position to start at either the params passed in or 505, 540
        var posX = params.x || 50 + Math.floor(1500 * Math.random());
        var posY = params.y || 100;

        // Sprite config
        var characterSprite = 'player';

        if (params.group) {
            self.group = params.group;
            self.sprite = self.group.create(posX, posY, characterSprite);
        }
        else {
            self.sprite = phaser.add.sprite(posX, posY, characterSprite);
            phaser.physics.enable(self.sprite, Phaser.Physics.ARCADE);
        }

        // add the player name label
        var text = phaser.add.bitmapText(100, 100, 'default', self.name, 16);
        self.playerName = text;
        self.playerName.x = (self.sprite.x + (self.sprite.width / 2)) - (self.playerName.textWidth / 2);
        self.playerName.y = self.sprite.y - self.playerName.textHeight;

        // define the animations for the sprite
        self.sprite.animations.add('stand-down', [6]);
        self.sprite.animations.add('walk-down', [6, 7, 8, 9, 10, 11]);
        self.sprite.animations.add('stand-left', [6]);
        self.sprite.animations.add('walk-left', [6, 7, 8, 9, 10, 11]);
        self.sprite.animations.add('stand-right', [12]);
        self.sprite.animations.add('walk-right', [12, 13, 14, 15, 16, 17]);
        self.sprite.name = self.name;
        self.sprite.lastPosition = {};

        // store the cursor keys as a valid in input method
        self.cursors = phaser.input.keyboard.createCursorKeys();

        // create an object which stores the wasd keys for movement and numbers for weapon change
        self.keys = phaser.input.keyboard.addKeys({
            'up': Phaser.KeyCode.W,
            'left': Phaser.KeyCode.A,
            'right': Phaser.KeyCode.D,
            'space': Phaser.KeyCode.SPACEBAR,
            'weap1': Phaser.KeyCode.ONE,
            'weap2': Phaser.KeyCode.TWO,
            'weap3': Phaser.KeyCode.THREE,
            'weap4': Phaser.KeyCode.FOUR
        });

        // let the camera follow the local player
        phaser.camera.follow(self.sprite);

        self.healthText = phaser.add.text(20, 20, "Health: " , {
            font: "24px Arial",
            fill: "#ff0044",
            align: "center",
        });
         self.healthText.fixedToCamera = true;
        
        self.deathText = phaser.add.text(800, 20, "Deaths: " + self.deaths, {
            font: "24px Arial",
            fill: "#ff0044",
            align: "left",
        });
        self.deathText.fixedToCamera = true;
    }

    // callback for general collisions
    var onCollision = function() {

    };

    Player.prototype.update = function() {
        var self = this;

        var player = self.sprite,
            cursors = self.cursors,
            keys = self.keys,
            moveParams = {},
            shotParams = {};
        
        // enable collision between the player and other collision objects
        if (game.groups.collisionGroup) {
            phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision);
            player.body.collideWorldBounds = true;
        }

        // enable collision between player and platforms so that it can jump on them
        phaser.physics.arcade.collide(self.sprite, platforms);


        for (var i = 0; i < game.weapons.length; ++i) {
            phaser.physics.arcade.collide(game.weapons[i], player, function(player, bullet) {
                if (self.health >= 0 && bullet.id != undefined) {
                    // reduce health depending which weapon is being used
                    if (i == 0) {
                    self.health -= 20;
                    }
                    else if (i == 1) {
                    self.health -= 5;
                    }
                    else if (i == 2) {
                    self.health -= 15;
                    }
                    else if (i == 3) {
                    self.health -= 40;
                    }
                    // update health bar
                    game.playerHealthBar.setPercent(self.health);

                    if (self.health <= 0) {
                        self.deaths += 1;
                        self.sprite.x = 50 + Math.floor(1500 * Math.random());
                        self.sprite.y = 100;
                        self.health = 100;
                        game.playerHealthBar.setPercent(self.health);
                        game.socket.emit('kills', bullet.id);
                    }
                }
                bullet.kill();
            });
        }

        // DEATH AND KILL COUNT TEXT
        self.deathText.x = 800 + phaser.camera.x;
        self.deathText.y = 60 + phaser.camera.y;
        game.killsText.x = 800 + phaser.camera.x;
        game.killsText.y = 20 + phaser.camera.y;
        self.deathText.setText("Deaths: " + self.deaths);

        //health text
         self.healthText.x = 20 + phaser.camera.x;
         self.healthText.y = 20 + phaser.camera.y;
        

        // set gravitational properties
        player.body.bounce.y = 0.15;
        player.body.gravity.y = 1400;

        // by default the player is not moving in the x axis
        player.body.velocity.x = 0;

        // set the current player depending on which number key is pressed
        if (keys.weap1.isDown) {
            self.currentWeapon = 0;
        }
        else if (keys.weap2.isDown) {
            self.currentWeapon = 1;
        }
        else if (keys.weap3.isDown) {
            self.currentWeapon = 2;
        }
        else if (keys.weap4.isDown) {
            self.currentWeapon = 3;
        }

        // shoot the bullets whilst the left mouse button is clicked
        if (phaser.input.activePointer.isDown || keys.space.isDown) {
            // get the angle from the player to the mouse taking into account camera coords as well
            var angle = Math.atan2(phaser.input.y + phaser.camera.y - player.y, phaser.input.x + phaser.camera.x - player.x) * (180 / Math.PI);
            game.weapons[self.currentWeapon].fire(player.x, player.y, angle);

            shotParams.x = player.x;
            shotParams.y = player.y;
            shotParams.currentWeapon = self.currentWeapon;
            shotParams.angle = angle;
            game.socket.emit('shot', shotParams);
        }

        // jumping
        if ((cursors.up.isDown || keys.up.isDown) && player.body.touching.down) {
            player.body.velocity.y = -900;
            self.direction = 'up';
            moveParams.velY = -900;
        }

        // moving left
        if (self.movingLeft || cursors.left.isDown || keys.left.isDown) {
            player.body.velocity.x = -baseVelocity;
            self.direction = 'left';
            moveParams.velX = -baseVelocity;

        }
        //moving right
        else if (self.movingRight || cursors.right.isDown || keys.right.isDown) {
            player.body.velocity.x = baseVelocity;
            self.direction = 'right';
            moveParams.velX = baseVelocity;
        }

        // if player is notmoving in x, show walking animation
        if (player.body.velocity.x) {
            self.sprite.animations.play('walk-' + self.direction, 10, true);
        }
        // otherwise show standing animation
        else {
            self.sprite.animations.play('stand-' + self.direction, 10, true);
        }

        // if the player's position has changed emit that to the socket
        if (player.lastPosition.x !== player.body.x || player.lastPosition.y !== player.body.y) {
            moveParams.x = player.body.x;
            moveParams.y = player.body.y;
            moveParams.direction = self.direction;

            game.socket.emit('move', moveParams);

            player.lastPosition.x = player.body.x;
            player.lastPosition.y = player.body.y;
        }

        // let the text label follow the player
        self.playerName.x = (player.body.x + (player.width / 2)) - (self.playerName.textWidth / 2);
        self.playerName.y = player.body.y - self.playerName.textHeight;

        player.destinationX = 0;
        player.destinationY = 0;
    };
    game.entities = game.entities || {};
    game.entities.Player = Player;
})();