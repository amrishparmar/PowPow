!function(root){

  // App variables
  var game           = root.game;
  game.title         = 'Pow Pow';
  game.entities      = {};
  game.scenes        = {};
  game.groups        = {};
  game.players       = {};
 
 
  
  game.socket     = io.connect(location.protocol + '//' + location.host);
  noop            = function(){};

  game.gameWidth  = 800;
  game.gameHeight = 600;
  
  
  
  window.phaser = new Phaser.Game(game.gameWidth, game.gameHeight, Phaser.AUTO, "game");


  // Ready?
  window.onload = function(){
    if(game.user && game.user._id){
      phaser.state.start('Game');
    } else {
      phaser.state.start('Login');
    }
  };

}(window);