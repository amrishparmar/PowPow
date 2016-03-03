(function() {
    var baseVelocity = 300;

    function Player(params, game) {
        var self = this;
        var playerExists = 1;
        self._id = params._id;
        self.name = params.name;
        self.type = 'local';
        self.direction = params.direction || 'right';
        self.currentWeapon = 0;
        self.weapons = weapons;
        

        var posX = params.x || 505;
        var posY = params.y || 540;

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

        var text = phaser.add.bitmapText(100, 100, 'default', self.name, 16);
        self.playerName = text;
        self.playerName.x = (self.sprite.x + (self.sprite.width / 2)) - (self.playerName.textWidth / 2);
        self.playerName.y = self.sprite.y - self.playerName.textHeight;

        self.sprite.animations.add('stand-down', [0]);
        self.sprite.animations.add('walk-down', [0, 1, 2]);

        self.sprite.animations.add('stand-left', [12]);
        self.sprite.animations.add('walk-left', [12, 13, 14]);

        self.sprite.animations.add('stand-right', [24]);
        self.sprite.animations.add('walk-right', [25, 26, 27]);

        self.sprite.animations.add('stand-up', [36]);
        self.sprite.animations.add('walk-up', [36, 37, 38]);

        self.sprite.name = self.name;
        self.sprite.lastPosition = {};
        self.cursors = phaser.input.keyboard.createCursorKeys();

        // create an object which stores the wasd keys for movement and numbers for weapon change
        self.keys = phaser.input.keyboard.addKeys({
            'up': Phaser.KeyCode.W,
            'left': Phaser.KeyCode.A,
            'right': Phaser.KeyCode.D,
            'weap1': Phaser.KeyCode.ONE,
            'weap2': Phaser.KeyCode.TWO,
            'weap3': Phaser.KeyCode.THREE,
            'weap4': Phaser.KeyCode.FOUR
        });

        phaser.camera.follow(self.sprite);
    }

    var onCollision = function() {

    };

    Player.prototype.update = function() {
        var self = this;

        var player = self.sprite,
            cursors = self.cursors,
            keys = self.keys,
            moveParams = {},
            shotParams = {},
            positionOffset = 10;

        if (game.groups.collisionGroup) {
            phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision);
            player.body.collideWorldBounds = true;
        }

        phaser.physics.arcade.collide(self.sprite, platforms);

        phaser.physics.arcade.collide(self.weapons[self.currentWeapon], platforms, function(bullet, platform) {
            bullet.kill();
        });
        
         
        phaser.physics.arcade.collide(self.weapons[self.currentWeapon], player, function(bullet, player) {
            bullet.kill();
        });
        
       

        player.body.bounce.y = 0.15;
        player.body.gravity.y = 1400;

        player.body.velocity.x = 0;

        self.playerName.x = (player.x + (player.width / 2)) - (self.playerName.textWidth / 2);
        self.playerName.y = player.y - self.playerName.textHeight;

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
        

        if (phaser.input.activePointer.isDown) {
            var angle = Math.atan2(phaser.input.y + phaser.camera.y - player.y, phaser.input.x + phaser.camera.x - player.x) * (180 / Math.PI);
            self.weapons[self.currentWeapon].fire(player.x, player.y, angle);

            shotParams.x = player.x;
            shotParams.y = player.y;
            shotParams.currentWeapon = self.currentWeapon;
            shotParams.angle = angle;


        }

        game.socket.emit('shot', shotParams);
        
        // Up/Down
        if ((cursors.up.isDown || keys.up.isDown) && player.body.touching.down) {
            player.body.velocity.y = -900;
            self.direction = 'up';
            moveParams.velY = -900;
        }

        // Left/Right
        if (self.movingLeft || cursors.left.isDown || keys.left.isDown) {
            player.body.velocity.x = -baseVelocity;
            self.direction = 'left';
            moveParams.velX = -baseVelocity;

        }
        else if (self.movingRight || cursors.right.isDown || keys.right.isDown) {
            player.body.velocity.x = baseVelocity;
            self.direction = 'right';
            moveParams.velX = baseVelocity;
        }

        if (player.body.velocity.x) {
            self.sprite.animations.play('walk-' + self.direction, 10, true);
        }
        else {
            self.sprite.animations.play('stand-' + self.direction, 10, true);
        }

        if (player.lastPosition.x !== player.body.x || player.lastPosition.y !== player.body.y) {
            moveParams.x = player.body.x;
            moveParams.y = player.body.y;
            moveParams.direction = self.direction;

            game.socket.emit('move', moveParams);

            player.lastPosition.x = player.body.x;
            player.lastPosition.y = player.body.y;
        }


        player.destinationX = 0;
        player.destinationY = 0;
    };

    game.entities = game.entities || {};
    game.entities.Player = Player;
})();