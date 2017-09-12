# Pow Pow

An 2D online muliplayer platform shooter. 

Group project by Amrish Parmar, Vidmantas Naravas, Hasan Banna, Amir Hussain, Niru Kumar. 

## Requirements
- NodeJS
- MongoDB

## Deployment

### First time setup

Execute the following to install dependencies specified in package.json (only needed first time):
```
npm install
```

### Executing the application

Execute the following to run the application:
1. Start MongoDB: In terminal enter: 
```
./mongod
```
2. Start the Node app. Open another terminal window and enter: 
```
node app
```
3. Open the application by accessing `https://yourhostname/play` (where your `yourhostname` is wherever you are hosting it) 
 
   (Optional) If this is your first time running the application, you will need to create a user account. This can be done by going onto `https://yourhostname/signup`

Logged in users can logout by going to `https://yourhostname/signout`.

