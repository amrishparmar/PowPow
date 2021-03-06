var users  = require('../controllers/users');

module.exports = function(app) {

	//
  app.get('/signin', users.signin);
  app.post('/signin', users.login);

	app.get('/signup', users.signup);
  app.post('/signup', users.create);

	app.get('/signout', users.signout);

	// Create user
	app.post('/users', users.create);

	// Setting up the userId param
	app.param('userId', users.user);

};