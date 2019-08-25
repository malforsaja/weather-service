/**
 * app.js
 * exports an Express app as a function
 */
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 5000;
const HOST = '0.0.0.0';
//add body parser as middleware for all requests
app.use(bodyParser.json());

// Define routes
app.use('/cities', require('./routes/weather'));
app.use('/oop', require('./routes/weather-oop'));

app.listen(port, HOST, () =>
  console.log(`Weather service is listening on port ${port}!`),
);

module.exports = app;