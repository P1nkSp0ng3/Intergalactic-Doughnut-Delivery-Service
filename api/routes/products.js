const express = require('express');
const router = express.Router();
const db = require('../database/connection');

router.get('/', (req, res, next) => { // handle GET requests to /products via an arrow function (to define an anonymous function)
    db.query('SELECT * FROM products', (error, results) => {
        if (error) {
            console.error('Database error:', error.sqlMessage);
            return res.status(500).json({
                error: error
            });
        }
        console.log('Query results:', results); // return data in console
        res.status(200).json({
            message: 'Handling GET calls to /products',
            products: results
        });
    });
});

router.post('/', (req, res, next) => { // handle POST requests to /products
    const product = {
        name: req.body.name, // pull data from request body (via body property)
        price: req.body.price
    };
    res.status(201).json({
        message: 'Handling POST calls to /products',
        createdProduct: product
    });
});

router.get('/:productId', (req, res, next) => { // handle GET requests to /products/:id
    const productId = req.params.productId; // pull the productId from the URL parameters using the params object
    if (productId === 'special') {
        res.status(200).json({
            id: productId,
            message: 'Special product'
        });
    } else {
        res.status(200).json({
            message: 'You searched for product with an id of: ' + productId
        });
    }
});

router.patch('/:productId', (req, res, next) => { // handle PATCH requests to /products/:id
    res.status(200).json({
        message: 'Product updated!'
    });
});

router.delete('/:productId', (req, res, next) => { // handle DELETE requests to /products/:id
    res.status(200).json({
        message: 'Product deleted!'
    });
});

module.exports = router;