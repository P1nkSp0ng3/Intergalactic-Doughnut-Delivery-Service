/*
    this file contains the JavaScript logic to spin up the API's hosting express server
*/
const http = require('http'); // import http package
const app = require('./app.js');
const port = process.env.PORT || 7890;  // local port number

const server = http.createServer(app); // app is passed as a listener (the file gets executed every time a request is received)

server.listen(port); // start server on port