# Pow Pow

An 2D online muliplayer platform shooter. 

Second year group project by [Amrish Parmar](https://github.com/amrishparmar), [Vidmantas Naravas](https://github.com/widmaN), [Hasan Banna](https://github.com/hasanbanna), Amir Hussain and Niru Kumar. 

## Requirements
- NodeJS (tested working on v4.1.x and v6.1.x)
- MongoDB (tested working on v2.6.x)

## Deployment

### First time setup

Execute the following to install the dependencies specified in package.json (only needed first time):
```
npm install
```

### Executing the application

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

