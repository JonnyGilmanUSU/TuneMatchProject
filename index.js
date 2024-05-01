const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();
const corsOptions = require('./util/corsOptions');




// Routers
const frontEndRouter = require('./routes/frontEnd-routes');
const spotifyRouter = require('./routes/spotify-routes');

// Database Connection String
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@tunematch.e8f81lf.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}?retryWrites=true&w=majority&appName=TuneMatch`

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});


// -----------------------------------------** DEPLOYMENT MODE **-------------------------------------
const port = process.env.PORT || 3001;
// -----------------------------------------** DEPLOYMENT MODE **-------------------------------------

// Dev Mode
// const port = 3001;


// Initialize App
const app = express();






// -----------------------------------------** DEPLOYMENT MODE **-------------------------------------


app.use(cors(corsOptions));

// -----------------------------------------** DEPLOYMENT MODE **-------------------------------------

// Dev Mode
// app.use(cors());





// Mount middleware to parse request bodies
app.use(express.urlencoded({extended: false}));

// parse requests to JSON
app.use(bodyParser.json());

// Register Session Middleware
app.use(session({
  secret: process.env.MY_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.createdAt) {
    req.session.createdAt = Date.now();
  }
  next();
});

// Timer to periodically check and destroy expired sessions
setInterval(() => {
  app.use((req, res, next) => {
    if (req.session.createdAt && (Date.now() > req.session.createdAt + 1 * 60 * 1000)) {
      console.log('Session expired. Destroying session.');
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }
    next();
  });
}, 1 * 60 * 1000); // Run every 30 minutes




// Register Routes
app.use(frontEndRouter);
app.use('/spotify', spotifyRouter);


// Point the application to the location of static resources
app.use(express.static(path.join(__dirname, '/client/build')));

// Render Client for any path
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/client/build/index.html')))

  

app.get('/', (req, res) => {
    console.log("SERVER IS RUNNING!")
  });



// Middleware to handle unrecognized requests
// app.use(errorController.getError);

mongoose.connect(MONGODB_URI)
  .then(() => {
    // Launch App
    app.listen(port, () => {console.log("Server is running on port: ", port)})
  })

