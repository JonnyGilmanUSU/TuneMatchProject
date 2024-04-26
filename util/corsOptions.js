const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"};

module.exports = corsOptions;
  
