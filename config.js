module.exports = {
	gameTitle: 'Testing',
	port: process.env.PORT,
	db: 'mongodb://localhost/SoftProj',    
	sessionKey: 'hello',
	// is used to compute a session hash
	sessionSecret: 'hello1',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions'
};