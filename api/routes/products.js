const express = require('express');
const router = express.Router();
const db = require('../database/connection');

router.get('/', (req, res, next) => { // list all products route handler (uses an arrow function (to define an anonymous function))
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => { // execute the query
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

router.get('/random', (req, res, next) => { // list a random product route handle
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Database error:', error.sqlMessage);
            return res.status(500).json({
                error: error
            });
        }
        const randomIndex = Math.floor(Math.random() * results.length);
        console.log('Query results:', results[randomIndex]); // return data in console
        res.status(200).json({
            message: 'Handling GET calls to /products/random',
            products: results[randomIndex]
        });
    });
});

router.get('/search', (req, res, next) => { // search for a product route handle
    const searchTerm = req.query.term; // pull value from 'term' URL parameter
    if(!searchTerm) {
        return res.status(400).json({
            message: "Please enter the name of doughnut you want to search for!"
        });
    }
    const likeTerm = `%${searchTerm}%`;
    const query = `SELECT * FROM products WHERE name LIKE "${likeTerm}" OR description LIKE "${likeTerm}" LIMIT 10`;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Database error:', error.sqlMessage);
            return res.status(500).json({
                error: error
            });
        }
        console.log('Query results:', results); // return data in console
        if (results.length === 0) {
            return res.status(404).json({
                message: 'No doughnuts found! :('
            });
        } else {
            res.status(200).json({
                message: `Search results for ${searchTerm}`,
                products: results
            });
        }
    });
});

router.get('/:productId', (req, res, next) => { // view a specific product route handle
    //const productId = req.params.productId;
    const productId = parseInt(req.params.productId, 10); // pull the productId from the URL parameters using the params object
    if (Number.isNaN(productId)) {
        return res.status(400).json({
            error: 'Please enter a valid doughnut ID value!'
        });
    }
    const query = `SELECT * FROM products WHERE id=${productId}`;
    db.query(query, (error, results) => {
        if(error) {
            console.error('Database error:', error.sqlMessage);
            return res.status(500).json({
                error: error
            });
        }
        console.log('Query results:', results); // return data in console
        if (results.length === 0) {
            return res.status(404).json({
                message: 'Doughnut not found! :('
            });
        } else {
            res.status(200).json({
                message: 'You searched for product with an id of: ' + productId,
                product: results
            });
        }
    });
});







router.patch('/:productId', (req, res, next) => { // update a product route handle
    res.status(200).json({
        message: 'Product updated!'
    });
});




router.delete('/:productId', (req, res, next) => { // delete a product route handle
    res.status(200).json({
        message: 'Product deleted!'
    });
});

module.exports = router;