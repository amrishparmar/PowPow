!function() {

    function Character(params) {
        var self = this;
        self._id = params._id;
        self.name = params.name;
        self.type = 'remote';
        self.direction = params.direction || 'down';
        self.currentWeapon = 0;
        self.health = 100;

        var posX = params.x || 0;
        var posY = params.y || 0;

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

        self.sprite.name = self.name;
       //  self.sprite.body.immovable = true;

        var text = phaser.add.bitmapText(100, 100, 'default', self.name, 16);
        self.playerName = text;

        self.playerName.x = (self.sprite.x + (self.sprite.width / 2)) - (self.playerName.textWidth / 2);
        self.playerName.y = self.sprite.y - self.playerName.textHeight;
        
         self.sprite.animations.add('stand-down', [6]);
        self.sprite.animations.add('walk-down', [6,7,8,9,10,11]);

        self.sprite.animations.add('stand-left', [6]);
        self.sprite.animations.add('walk-left', [6,7,8,9,10,11]);

        self.sprite.animations.add('stand-right', [12]);
        self.sprite.animations.add('walk-right', [12,13,14,15,16,17]);

        
        self.playerName = text;
    }

    var onCollision = function() {};

    Character.prototype.update = function() {
        var self = this;
        var player = self.sprite;
            // positionOffset = 5;
            
        player.body.bounce.y = 0.15;
        player.body.gravity.y = 1400;

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        self.playerName.x = (player.body.x + (player.width / 2)) - (self.playerName.textWidth / 2);
        self.playerName.y = player.body.y - self.playerName.textHeight;

        // phaser.physics.arcade.moveToXY(player, self.destinationX, self.destinationY, 10, baseVelocity);
        phaser.physics.arcade.moveToXY(player, self.destinationX, self.destinationY, 10, 50);

        if (player.body.velocity.x) {
            self.sprite.animations.play('walk-' + self.direction, 10, true);
        }
        else {
            self.sprite.animations.play('stand-' + self.direction, 10, true);
        }

        if (game.groups.collisionGroup) {
            phaser.physics.arcade.collide(self.sprite, game.groups.collisionGroup, onCollision);
        }

        for (var i = 0; i < game.weapons.length; ++i) {
            phaser.physics.arcade.collide(game.weapons[i], player, function(player, bullet) {
                bullet.kill();
            });
        }
    };

    game.entities = game.entities || {};
    game.entities.Character = Character;

}();