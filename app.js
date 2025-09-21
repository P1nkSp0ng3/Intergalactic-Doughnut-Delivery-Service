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

// export the app object so it can be used in other files
module.exports = app;