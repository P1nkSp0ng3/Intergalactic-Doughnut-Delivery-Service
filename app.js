// imports
const express = require('express');
const morgan = require('morgan');
const app = express(); // execute express as a function
const healthRoutes = require('./api/routes/health');
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

// logging middleware
app.use(morgan('dev'));

// request body parsing middleware(s)
app.use(express.urlencoded({ // parse URL encoded data from incoming request bodies
    extended: false
}));
app.use(express.json()); // parse JSON data from incoming request bodies

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET POST PUT PATCH DELETE');
        return res.status(200).json({}); // return an empty JSON object and terminate execution
    } else {
        next();
    }
});

// API endpoint middleware(s)
app.use('/health', healthRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// error handling middleware(s)
app.use((req, res, next) => { // 404 error handling middleware
    const error = new Error("It appears you're lost... The doughnuts are elsewhere...");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => { // global error handling middleware
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    });
});

// export the app object so it can be used in other files
module.exports = app;