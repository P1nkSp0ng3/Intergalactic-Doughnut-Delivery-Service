// imports
const express = require('express');
const app = express(); // execute express as a function
const morgan = require('morgan');
const healthRoutes = require('./api/routes/health');
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

// logging middleware
app.use(morgan('dev'));

// endpoint middleware(s)
app.use('/health', healthRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// error handling middleware(s)
app.use((req, res, next) => { // middleware to handle calls to non-existent API endpoints
    const error = new Error('Not found! It appears you are lost... The doughnuts are that way...');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => { // middleware to handle all other errors
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    });
});

// export the app object so it can be used in other files
module.exports = app;