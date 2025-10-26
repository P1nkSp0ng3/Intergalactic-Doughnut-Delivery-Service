const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// NOT VULNERABLE
router.get('/', (req, res, next) => { // list all products route handler (uses an arrow function (to define an anonymous function))
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => { // execute the query
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: '⚠️ Houston, we have a problem retrieving the doughnuts!',
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({
                announcement: '🛸 Our shelves are temporarily empty! The Galactic Doughnut Chefs are crafting new treats - please come back soon.',
                count: 0,
                galacticInventory: []
            });
        }
        const products = results.map(product => ({ // check product stock code (maps the products into an array for iteration)
            ...product, // keep all original columns - uses spread syntax to "spread" all key-value pairs from product object into products object
            stock: product.stock === 0 // shorthand if statement using conditional (ternary) operator (overwrites stock value from database)
                ? '🚀 Sorry, this doughnut is currently out of stock in this galaxy!'
                : `🪐 ${product.stock} available for intergalactic delivery`
        }));
        // console.log('Retrieved products from the Intergalactic Menu:', products); // return data in console
        res.status(200).json({
            announcement: '🍩 Welcome to the Intergalactic Doughnut Delivery Service! Feast your eyes on our galactic menu.',
            count: products.length,
            galacticInventory: products
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
        if(error) {
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

// NOT VULNERABLE
router.get('/random', (req, res, next) => { // list a random product route handle
    const query = `SELECT * FROM products`;
    db.query(query, (error, results) => {
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: '⚠️ Houston, we have a problem retrieving the doughnuts!',
                details: error.sqlMessage
            });
        }
        if(!results || results.length === 0) {
            return res.status(200).json({
                announcement: '🚫 No doughnuts currently available in this quadrant of space!'
            });
        }
        const randomIndex = Math.floor(Math.random() * results.length);
        const product = results[randomIndex];
        const randomProduct = {
            ...product,
            stock: product.stock === 0
                ? '🚀 Sorry, this doughnut is currently out of stock in this galaxy!'
                : `🪐 ${product.stock} available for intergalactic delivery`
        }
        // console.log('Retrieved random product from the Intergalactic Menu:', randomProduct.name); // return data in console
        res.status(200).json({
            announcement: 'Your cosmic craving chooser has selected a random doughnut for you:',
            cosmicTreat: randomProduct
        });
    });
});

// VULNERABLE
router.get('/search', (req, res, next) => { // search for a product route handle
    const searchTerm = req.query.term; // pull value from 'term' URL parameter
    if(!searchTerm) {
        return res.status(400).json({
            announcement: '🛸 The Search Satellites need a query! Please include ?term=your-flavour'
        });
    }
    const likeTerm = `%${searchTerm}%`; // required for partial matches
    const query = `SELECT * FROM products WHERE name LIKE '${likeTerm}' LIMIT 10`;
    db.query(query, (error, results) => {
        if(error) {
            console.error('Galactic database malfunction:', error.sqlMessage);
            return res.status(500).json({
                announcement: '⚠️ Houston, we have a problem retrieving the searched doughnut!',
                details: error.sqlMessage
            });
        }
        // console.log('Retrieved product from the Intergalactic Menu:', results); // return data in console
        if(!results || results.length === 0) {
            return res.status(200).json({
                announcement: `🔎 You searched for ${searchTerm}... The bakers report no matches in this sector.`,
                count: 0,
                galacticInventory: []
            });
        }
        res.status(200).json({
            announcement: `🔎 You searched for ${searchTerm} (may include interstellar surprises)`,
            count: results.length,
            galacticInventory: results
        });
    });
});

router.get('/:productId', (req, res, next) => { // view a specific product route handle
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
    const productId = parseInt(req.params.productId, 10); // pull the productId from the URL parameters using the params object - parse it as an integer
    if (Number.isNaN(productId)) { // if Not-a-number, return error
        return res.status(400).json({
            error: 'Please enter a valid doughnut ID value!'
        });
    }
    /*const updates = req.body; // grab the request body
    if (!updates || Object.keys(updates).length === 0) { // if request body is empty, return error
        return res.status(400).json({
            error: 'Please provide doughnut details!'
        });
    }*/
    const allowed = ['name', 'description', 'price', 'stock'];
    const updates = {};
    for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            updates[key] = req.body[key];
        }
    }
    if (Object.keys(updates).length === 0) { // if request body is empty, return error
        return res.status(400).json({
            error: 'Please provide doughnut details!'
        });
    }
    const setParts = Object.keys(updates).map(k => {
        return `${k} = '${updates[k]}'`;
    });
    const setClause = setParts.join(', ');
    const query = `UPDATE products SET ${setClause} WHERE id = ${productId}`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('DB error:', err && err.sqlMessage ? err.sqlMessage : err);
            return res.status(500).json({
                error: 'Database error'
            });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        return res.status(200).json({
            message: 'Product updated',
            updatedFields: updates
        });
    });
});

router.delete('/:productId', (req, res, next) => { // delete a product route handle
    const productId = parseInt(req.params.productId, 10); // pull the productId from the URL parameters using the params object - parse it as an integer
    if (Number.isNaN(productId)) { // if Not-a-number, error
        return res.status(400).json({
            error: 'Please enter a valid doughnut ID value!'
        });
    }
    const query = `DELETE FROM products WHERE id=${productId}`;
    db.query(query, (error, results) => {
        if(error) {
            console.error('Database error:', error.sqlMessage);
            return res.status(500).json({
                error: error
            });
        }
        if (results.affectedRows === 0) {
            res.status(404).json({
                message: 'Doughnut not found...'
            });
        } else {
            console.log('Query results:', results); // return data in console
            res.status(200).json({
                message: "Farewell doughnut, live long and prosper",
                deletedId: productId
            });
        }
    });
});

module.exports = router;