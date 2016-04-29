// Login Scene
(function(){

  var LoginScene = function(game) {
   
  };

  // Preload
  LoginScene.prototype.preload = function() {
  
    // Fonts
    var fontFile = (navigator.isCocoonJS) ? 'font_medium.xml' : 'font_medium_desktop.xml';
    this.load.bitmapFont('font_medium', 'assets/fonts/font_medium.png', 'assets/fonts/' + fontFile);

    var fontFile2 = (navigator.isCocoonJS) ? 'font_large.xml' : 'font_large_desktop.xml';
    this.load.bitmapFont('font_large', 'assets/fonts/font_large.png', 'assets/fonts/' + fontFile2);
    
    var fontFile3 = (navigator.isCocoonJS) ? 'default.xml' : 'default_desktop.xml';
    this.load.bitmapFont('default', 'assets/fonts/default.png', 'assets/fonts/' + fontFile3);

    // Background
    this.load.image('background', 'assets/images/city_bg.jpg');

    // Input
    this.load.image('input', 'assets/images/input1.png');

    // Button
    this.load.image('login_btn', 'assets/images/button_login.png');
  };

  // Create
  LoginScene.prototype.create = function() {
    var self                   = this;
    this.stage.backgroundColor = 0x2d2d2d;
    var background             = this.add.sprite(0, 0, 'background');
    background.alpha           = 0.4;

    var title                  = this.add.bitmapText(phaser.canvas.width/2, 80, 'default', 'Pow Pow', 72);
    title.x                    -= title.textWidth/2;

    var form                   = this.add.group();
    var username               = form.create(0, 0, 'input');
    username.inputEnabled      = true;
    var password               = form.create(0, 80, 'input');
    password.inputEnabled      = true;
    var loginBtn               = form.create(0, 160, 'login_btn');
    loginBtn.inputEnabled      = true;
    form.x                     = phaser.canvas.width/2 - username.width/2;
    form.y                     = 210;

    var placeholder1           = this.add.bitmapText(form.x + 15, form.y + 10, 'default', 'Username', 25);
    placeholder1.alpha         = 0.7;

    var placeholder2           = this.add.bitmapText(form.x + 15, form.y + 90, 'default', 'Password', 25);
    placeholder2.alpha         = 0.7;

    var login_text             = this.add.bitmapText(form.x + (loginBtn.width/2), form.y + loginBtn.y + 10, 'default', 'Login', 30);
    login_text.x               -= login_text.textWidth/2;
    
    
     var signup_text             = this.add.bitmapText(form.x + (loginBtn.width/2), form.y + loginBtn.y + 80, 'default', 'If dont have an account, please use sign up page on the top right corner of the page.', 15);
     signup_text.x               -= signup_text.textWidth/2;

    var user_password          = '';

    // Login event
    loginBtn.events.onInputDown.add(function(){
      var params = 'username=' + placeholder1.text + '&password='+user_password;

      var xhr = new XMLHttpRequest({ withCredentials: true });
      xhr.open('POST', '/signin?'+params, true);

      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      xhr.onload = function(){
        login_text.text = 'Login';
        var response = {};
        try {
          response = JSON.parse(this.responseText);
        } catch(e) {}
        if(response.success){
          // Regenerate Socket.io session
          game.socket.socket.disconnect();
          game.socket.socket.connect();
          game.user = response.user;
          setTimeout(function(){
            self.initGame();
          }, 0);
        } else {
          alert(response.error);
        }
      };
      xhr.send(params);
    });

    // Username prompt
    username.events.onInputDown.add(function(){
      var text = window.prompt("Please enter your username","");
      placeholder1.text = text;

    });

    // Password prompt
    password.events.onInputDown.add(function(){
      
      var text = window.prompt("Please enter your password","");
      var placeholder = '';
      
      for (var i = 0; i < text.length; i++){
        placeholder += '*';
      }
      user_password     = text;
      placeholder2.text = placeholder;
    });

   
  };

  // Update
  LoginScene.prototype.update = function() {

  };

  // Render
  LoginScene.prototype.render = function() {
    // phaser.debug.cameraInfo(phaser.camera, 20, 20);
  };

  // initGame
  LoginScene.prototype.initGame = function() {
    phaser.state.start('Game');
  };

  // game.scenes.login = LoginScene;
  phaser.state.add('Login', LoginScene);

})();