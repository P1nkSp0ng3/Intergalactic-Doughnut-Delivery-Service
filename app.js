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
app.use(express.urlencoded({ extended: false })); // parse URL encoded data from incoming request bodies
app.use(express.json()); // parse JSON data from incoming request bodies

// API endpoint middleware(s)
app.use('/health', healthRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// error handling middleware(s)
app.use((req, res, next) => { // 404 error handling middleware
    const error = new Error('Not found! It appears you are lost... The doughnuts are elsewhere...');
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