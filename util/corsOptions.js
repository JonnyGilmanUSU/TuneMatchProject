const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
};

module.exports = corsOptions;
  
