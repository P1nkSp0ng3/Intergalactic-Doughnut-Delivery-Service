const express = require('express');
const router = express.Router();
const db = require('../database/connection');

router.get('/', (req, res, next) => { // view all products route handler (uses an arrow function (to define an anonymous function))
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => {
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

router.post('/', (req, res, next) => { // create new product route handler
    const product = {
        name: req.body.name, // pull data from request body (via body property)
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock
    };
    const query = `INSERT INTO products (name, description, price, stock) VALUES ('${product.name}', '${product.description}', '${product.price}', '${product.stock}')`
    db.query(query, (error, results) => {
        if (error) {
            console.error('Database error:', error.sqlMessage);
            return res.status(500).json({
                error: error
            });
        }
        console.log('Query results:', results); // return query results in console
        product.id = results.insertId;
        res.status(201).json({
            message: 'Handling POST calls to /products',
            createdProduct: product
        });
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